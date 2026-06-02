use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};

use crate::{error::EscrowError, state::{EscrowAccount, EscrowStatus}};

/// Instruction data layout for InitEscrow:
///   - 8 bytes: expected_amount (u64 little-endian)
///   - 8 bytes: deadline (i64 unix timestamp, little-endian)
///   - 32 bytes: deal_id ([u8; 32])
pub fn process_init_escrow(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("DealVault: InitEscrow");

    // ── Parse instruction data ─────────────────────────────────────────────────
    if instruction_data.len() < 48 {
        msg!("Error: instruction data too short (expected ≥48 bytes)");
        return Err(EscrowError::InvalidInstruction.into());
    }

    let expected_amount = u64::from_le_bytes(
        instruction_data[0..8].try_into().map_err(|_| EscrowError::InvalidInstruction)?,
    );
    let deadline = i64::from_le_bytes(
        instruction_data[8..16].try_into().map_err(|_| EscrowError::InvalidInstruction)?,
    );
    let deal_id: [u8; 32] = instruction_data[16..48]
        .try_into()
        .map_err(|_| EscrowError::InvalidInstruction)?;

    if expected_amount == 0 {
        msg!("Error: expected_amount cannot be zero");
        return Err(EscrowError::InvalidInstruction.into());
    }

    // ── Unpack accounts ────────────────────────────────────────────────────────
    let accounts_iter = &mut accounts.iter();

    let buyer_account = next_account_info(accounts_iter)?;               // [signer, writable]
    let seller_account = next_account_info(accounts_iter)?;               // []
    let temp_token_account = next_account_info(accounts_iter)?;           // [writable] SPL temp
    let buyer_token_account = next_account_info(accounts_iter)?;          // [] buyer's token acc
    let seller_token_account = next_account_info(accounts_iter)?;         // [] seller's token acc
    let escrow_account = next_account_info(accounts_iter)?;               // [writable] PDA
    let rent_sysvar = next_account_info(accounts_iter)?;                  // Rent sysvar
    let token_program = next_account_info(accounts_iter)?;                // SPL Token program

    // ── Security Checks ────────────────────────────────────────────────────────

    // 1. Buyer must sign the transaction
    if !buyer_account.is_signer {
        msg!("Error: buyer must be signer");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // 2. Buyer and seller must be different
    if buyer_account.key == seller_account.key {
        msg!("Error: buyer and seller cannot be the same account");
        return Err(EscrowError::InvalidInstruction.into());
    }

    // 3. Escrow account must be rent exempt
    let rent = Rent::from_account_info(rent_sysvar)?;
    if !rent.is_exempt(escrow_account.lamports(), EscrowAccount::LEN) {
        msg!("Error: escrow account is not rent exempt");
        return Err(EscrowError::NotRentExempt.into());
    }

    // 4. Ensure escrow account belongs to this program
    if escrow_account.owner != program_id {
        msg!("Error: escrow account not owned by this program");
        return Err(ProgramError::IncorrectProgramId);
    }

    // 5. Validate token program is the SPL token program
    let spl_token_id = spl_token::id();
    if token_program.key != &spl_token_id {
        msg!("Error: invalid token program");
        return Err(ProgramError::IncorrectProgramId);
    }

    // ── Initialize Escrow State ────────────────────────────────────────────────
    let escrow_state = EscrowAccount {
        is_initialized: true,
        buyer_pubkey: *buyer_account.key,
        seller_pubkey: *seller_account.key,
        temp_token_account_pubkey: *temp_token_account.key,
        buyer_token_account_pubkey: *buyer_token_account.key,
        seller_token_account_pubkey: *seller_token_account.key,
        expected_amount,
        status: EscrowStatus::Funded,
        deadline,
        dispute_resolver: None,
        deal_id,
    };

    // ── Serialize State to Account ─────────────────────────────────────────────
    borsh::to_writer(&mut &mut escrow_account.data.borrow_mut()[..], &escrow_state)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    msg!(
        "Escrow initialized: buyer={}, seller={}, amount={}",
        buyer_account.key,
        seller_account.key,
        expected_amount
    );

    Ok(())
}
