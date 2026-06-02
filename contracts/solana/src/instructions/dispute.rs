use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::{error::EscrowError, state::{EscrowAccount, EscrowStatus}};

/// Raise a dispute on an active escrow.
/// Only the buyer can raise a dispute when deal is InProgress or Submitted.
/// Accounts:
///   0. [signer] buyer
///   1. [writable] escrow_account (PDA)
///   2. [] dispute_resolver (admin pubkey)
pub fn process_dispute(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("DealVault: RaiseDispute");

    let accounts_iter = &mut accounts.iter();
    let buyer_account = next_account_info(accounts_iter)?;
    let escrow_account = next_account_info(accounts_iter)?;
    let dispute_resolver = next_account_info(accounts_iter)?;

    if !buyer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    if escrow_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut escrow_state = EscrowAccount::try_from_slice(&escrow_account.data.borrow())
        .map_err(|_| EscrowError::DeserializationFailed)?;

    if !escrow_state.is_initialized {
        return Err(EscrowError::InvalidState.into());
    }
    if escrow_state.buyer_pubkey != *buyer_account.key {
        return Err(EscrowError::InvalidSigner.into());
    }

    match escrow_state.status {
        EscrowStatus::InProgress | EscrowStatus::Submitted => {}
        _ => {
            msg!("Error: dispute can only be raised on InProgress or Submitted escrows");
            return Err(EscrowError::InvalidState.into());
        }
    }

    escrow_state.status = EscrowStatus::Disputed;
    escrow_state.dispute_resolver = Some(*dispute_resolver.key);

    borsh::to_writer(&mut &mut escrow_account.data.borrow_mut()[..], &escrow_state)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    msg!("Dispute raised. Resolver: {}", dispute_resolver.key);
    Ok(())
}
