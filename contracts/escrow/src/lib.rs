#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, Symbol};

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
  ) {
    maintainer.require_auth();
    // Transfer USDC from maintainer to this contract
    token::Client::new(&env, &usdc_token)
      .transfer(&maintainer, &env.current_contract_address(), &amount);
    // Store deal info on-chain
    env.storage().instance().set(&deal_id, &(contributor, amount, usdc_token));
  }

  // Step 2: Maintainer approves → auto release
  pub fn release_funds(
    env: Env,
    deal_id: Symbol,
    maintainer: Address,
    platform_wallet: Address,
  ) {
    maintainer.require_auth();
    let (contributor, amount, usdc_token):
      (Address, i128, Address) =
      env.storage().instance().get(&deal_id).unwrap();

    let fee = amount * 2 / 100;        // 2% platform fee
    let payout = amount - fee;         // 98% to contributor

    let client = token::Client::new(&env, &usdc_token);
    client.transfer(&env.current_contract_address(), &contributor, &payout);
    client.transfer(&env.current_contract_address(), &platform_wallet, &fee);
  }

  // Step 3: Dispute → Admin resolves
  pub fn refund_maintainer(
    env: Env,
    deal_id: Symbol,
    admin: Address,
    maintainer: Address,
  ) {
    admin.require_auth(); // Only admin can refund
    let (_, amount, usdc_token):
      (Address, i128, Address) =
      env.storage().instance().get(&deal_id).unwrap();
    token::Client::new(&env, &usdc_token)
      .transfer(&env.current_contract_address(), &maintainer, &amount);
  }
}
