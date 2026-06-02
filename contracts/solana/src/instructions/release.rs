use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::{error::EscrowError, state::{EscrowAccount, EscrowStatus}};

/// Release escrowed funds to the seller after buyer approval.
/// Accounts:
///   0. [signer] buyer
///   1. [writable] escrow_account (PDA)
///   2. [writable] seller_token_account
///   3. [] token_program
pub fn process_release(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("DealVault: Release");

    let accounts_iter = &mut accounts.iter();
    let buyer_account = next_account_info(accounts_iter)?;
    let escrow_account = next_account_info(accounts_iter)?;

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
    if escrow_state.status != EscrowStatus::Submitted && escrow_state.status != EscrowStatus::Approved {
        msg!("Error: escrow must be Submitted or Approved before releasing funds");
        return Err(EscrowError::InvalidState.into());
    }

    // TODO: invoke SPL Token transfer from temp_token_account → seller_token_account

    escrow_state.status = EscrowStatus::Released;
    borsh::to_writer(&mut &mut escrow_account.data.borrow_mut()[..], &escrow_state)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    msg!("Funds released to seller: {}", escrow_state.seller_pubkey);
    Ok(())
}
