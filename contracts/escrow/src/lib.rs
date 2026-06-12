#![no_std]
use soroban_sdk::{
  contract, contractevent, contractimpl, contracttype, token, Address, Env, Symbol,
};

// SECURITY: Per-deal lifecycle state. Persisted so release/refund can be
// guarded against double-settlement (double-spend / contract drain).
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum DealState {
  Active,
  Released,
  Refunded,
}

// Contract events. Indexed off-chain to audit fund movement.
#[contractevent(topics = ["escrow", "funded"])]
pub struct Funded {
  pub deal_id: Symbol,
  pub amount: i128,
  pub contributor: Address,
  pub maintainer: Address,
}

#[contractevent(topics = ["escrow", "released"])]
pub struct Released {
  pub deal_id: Symbol,
  pub amount: i128,
}

#[contractevent(topics = ["escrow", "refunded"])]
pub struct Refunded {
  pub deal_id: Symbol,
  pub amount: i128,
}

// SECURITY: Distinct, namespaced storage keys per deal. Using typed keys (vs the
// previous single bare deal_id key) prevents deal data, state, admin, and the fee
// destination from colliding and lets each be validated independently.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
  Deal(Symbol),     // (contributor, amount, usdc_token)
  State(Symbol),    // DealState
  Admin(Symbol),    // Address authorized to refund
  Platform(Symbol), // Address that receives the platform fee
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {

  // Step 1: Maintainer locks USDC into contract
  pub fn fund_escrow(
    env: Env,
    deal_id: Symbol,
    maintainer: Address,
    contributor: Address,
    usdc_token: Address,
    amount: i128,
    platform_wallet: Address,
    admin: Address,
  ) {
    maintainer.require_auth();

    // SECURITY: Reject non-positive amounts — a zero/negative escrow is meaningless
    // and would let later fee/payout math produce nonsense transfers.
    assert!(amount > 0, "amount_zero");
    // SECURITY: Maintainer and contributor must differ; identical parties would let
    // one side both fund and receive, defeating escrow.
    assert!(contributor != maintainer, "same_party");

    // Transfer USDC from maintainer to this contract
    token::Client::new(&env, &usdc_token)
      .transfer(&maintainer, &env.current_contract_address(), &amount);

    let storage = env.storage().persistent();
    // Store deal info on-chain
    storage.set(&DataKey::Deal(deal_id.clone()), &(contributor.clone(), amount, usdc_token));
    // SECURITY: Persist the explicit admin (refund authority), separate from the
    // maintainer, so the maintainer has NO self-refund ability and only the
    // designated admin can call refund_maintainer.
    assert!(admin != maintainer, "admin_is_maintainer");
    storage.set(&DataKey::Admin(deal_id.clone()), &admin);
    // SECURITY: Persist the fee destination at fund time so release_funds cannot accept
    // a caller-supplied platform_wallet and redirect the fee.
    storage.set(&DataKey::Platform(deal_id.clone()), &platform_wallet);
    // SECURITY: Mark deal Active so the settle-once guards in release/refund engage.
    storage.set(&DataKey::State(deal_id.clone()), &DealState::Active);

    Funded { deal_id, amount, contributor, maintainer }.publish(&env);
  }

  // Step 2: Maintainer approves → auto release
  pub fn release_funds(
    env: Env,
    deal_id: Symbol,
    maintainer: Address,
  ) {
    maintainer.require_auth();

    let storage = env.storage().persistent();

    // SECURITY: Settle-once guard — reject if the deal is not Active, blocking
    // double-release and release-after-refund (contract-drain vectors).
    let state: DealState = storage
      .get(&DataKey::State(deal_id.clone()))
      .unwrap_or_else(|| panic!("deal_not_found"));
    assert!(state == DealState::Active, "already_settled");

    let (contributor, amount, usdc_token): (Address, i128, Address) = storage
      .get(&DataKey::Deal(deal_id.clone()))
      .unwrap_or_else(|| panic!("deal_not_found"));
    let platform_wallet: Address = storage
      .get(&DataKey::Platform(deal_id.clone()))
      .unwrap_or_else(|| panic!("deal_not_found"));

    // SECURITY: Flip state to Released BEFORE any transfer so a re-entrant or repeated
    // call hits the already_settled guard above.
    storage.set(&DataKey::State(deal_id.clone()), &DealState::Released);

    // SECURITY: checked arithmetic — i128 multiply/divide cannot silently overflow.
    let fee = amount
      .checked_mul(2)
      .unwrap_or_else(|| panic!("arithmetic_overflow"))
      .checked_div(100)
      .unwrap_or_else(|| panic!("arithmetic_overflow")); // 2% platform fee
    let payout = amount
      .checked_sub(fee)
      .unwrap_or_else(|| panic!("arithmetic_overflow")); // 98% to contributor

    let client = token::Client::new(&env, &usdc_token);
    client.transfer(&env.current_contract_address(), &contributor, &payout);
    client.transfer(&env.current_contract_address(), &platform_wallet, &fee);

    Released { deal_id, amount }.publish(&env);
  }

  // Step 3: Dispute → Admin resolves
  pub fn refund_maintainer(
    env: Env,
    deal_id: Symbol,
    admin: Address,
    maintainer: Address,
  ) {
    let storage = env.storage().persistent();

    // SECURITY: Settle-once guard — reject if not Active (blocks double-refund and
    // refund-after-release).
    let state: DealState = storage
      .get(&DataKey::State(deal_id.clone()))
      .unwrap_or_else(|| panic!("deal_not_found"));
    assert!(state == DealState::Active, "already_settled");

    // SECURITY: Only the admin persisted at fund time may refund. Compare the caller-
    // supplied admin to the stored one, then require its auth — an arbitrary
    // self-authorized address can no longer trigger a refund.
    let stored_admin: Address = storage
      .get(&DataKey::Admin(deal_id.clone()))
      .unwrap_or_else(|| panic!("deal_not_found"));
    assert!(admin == stored_admin, "not_admin");
    stored_admin.require_auth();

    let (_, amount, usdc_token): (Address, i128, Address) = storage
      .get(&DataKey::Deal(deal_id.clone()))
      .unwrap_or_else(|| panic!("deal_not_found"));

    // SECURITY: Flip state to Refunded BEFORE the transfer (settle-once).
    storage.set(&DataKey::State(deal_id.clone()), &DealState::Refunded);

    token::Client::new(&env, &usdc_token)
      .transfer(&env.current_contract_address(), &maintainer, &amount);

    Refunded { deal_id, amount }.publish(&env);
  }
}
