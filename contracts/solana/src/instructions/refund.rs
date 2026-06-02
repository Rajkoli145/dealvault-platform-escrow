use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{clock::Clock, Sysvar},
};

use crate::{error::EscrowError, state::{EscrowAccount, EscrowStatus}};

/// Refund escrowed funds back to the buyer (called by admin or after deadline passes).
/// Accounts:
///   0. [signer] authority (buyer OR admin/dispute_resolver)
///   1. [writable] escrow_account (PDA)
pub fn process_refund(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("DealVault: Refund");

    let accounts_iter = &mut accounts.iter();
    let authority = next_account_info(accounts_iter)?;
    let escrow_account = next_account_info(accounts_iter)?;
    let clock_sysvar = next_account_info(accounts_iter)?;

    if !authority.is_signer {
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

    let clock = Clock::from_account_info(clock_sysvar)?;
    let is_buyer = escrow_state.buyer_pubkey == *authority.key;
    let is_resolver = escrow_state.dispute_resolver.map_or(false, |r| r == *authority.key);
    let deadline_passed = clock.unix_timestamp > escrow_state.deadline;

    // Allow refund if: admin/resolver OR deadline has passed (buyer can claim)
    if !is_resolver && !(is_buyer && deadline_passed) {
        msg!("Error: not authorized to refund or deadline has not passed");
        return Err(EscrowError::InvalidSigner.into());
    }

    match escrow_state.status {
        EscrowStatus::Funded | EscrowStatus::InProgress | EscrowStatus::Disputed => {}
        _ => {
            msg!("Error: escrow cannot be refunded in status {:?}", escrow_state.status);
            return Err(EscrowError::InvalidState.into());
        }
    }

    // TODO: invoke SPL Token transfer from temp_token_account → buyer_token_account

    escrow_state.status = EscrowStatus::Refunded;
    borsh::to_writer(&mut &mut escrow_account.data.borrow_mut()[..], &escrow_state)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    msg!("Funds refunded to buyer: {}", escrow_state.buyer_pubkey);
    Ok(())
}
