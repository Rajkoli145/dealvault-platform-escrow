use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

/// Status of an escrow account on-chain
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, Copy, PartialEq, Eq)]
pub enum EscrowStatus {
    /// Escrow has been initialized but no funds deposited yet
    Created,
    /// Buyer has deposited funds
    Funded,
    /// Seller is working on the deliverable
    InProgress,
    /// Seller has submitted work; awaiting buyer review
    Submitted,
    /// Buyer approved the work; ready for release
    Approved,
    /// Funds released to seller
    Released,
    /// A dispute has been raised
    Disputed,
    /// Funds returned to buyer
    Refunded,
}

/// On-chain state of a DealVault escrow account
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct EscrowAccount {
    /// Whether this account has been initialized
    pub is_initialized: bool,

    /// Public key of the buyer (deal initiator)
    pub buyer_pubkey: Pubkey,

    /// Public key of the seller
    pub seller_pubkey: Pubkey,

    /// Temporary SPL token account holding escrowed funds
    pub temp_token_account_pubkey: Pubkey,

    /// Buyer's SPL token account to receive refund if needed
    pub buyer_token_account_pubkey: Pubkey,

    /// Seller's SPL token account to receive payment on release
    pub seller_token_account_pubkey: Pubkey,

    /// Amount locked in escrow (in lamports or token smallest unit)
    pub expected_amount: u64,

    /// Current status of the escrow
    pub status: EscrowStatus,

    /// Unix timestamp of the deal deadline
    pub deadline: i64,

    /// Optional dispute resolver (admin/arbitrator pubkey)
    pub dispute_resolver: Option<Pubkey>,

    /// Off-chain deal ID (stored for indexing — first 32 bytes of UUID)
    pub deal_id: [u8; 32],
}

impl EscrowAccount {
    /// Size (in bytes) of the serialized account data
    pub const LEN: usize =
        1   // is_initialized
        + 32 // buyer_pubkey
        + 32 // seller_pubkey
        + 32 // temp_token_account_pubkey
        + 32 // buyer_token_account_pubkey
        + 32 // seller_token_account_pubkey
        + 8  // expected_amount
        + 1  // status enum (u8)
        + 8  // deadline i64
        + 1  // Option<Pubkey> discriminant
        + 32 // dispute_resolver pubkey (always allocated)
        + 32; // deal_id
}
