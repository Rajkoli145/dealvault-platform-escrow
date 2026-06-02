use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub mod error;
pub mod instructions;
pub mod state;

use instructions::{
    dispute::process_dispute,
    init_escrow::process_init_escrow,
    refund::process_refund,
    release::process_release,
};

// ─── Program Entrypoint ───────────────────────────────────────────────────────
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("DealVault Escrow Program entrypoint");

    if instruction_data.is_empty() {
        msg!("Error: instruction data is empty");
        return Err(ProgramError::InvalidInstructionData);
    }

    // First byte is the instruction discriminant
    let (discriminant, rest) = instruction_data.split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match discriminant {
        0 => {
            msg!("Instruction: InitEscrow");
            process_init_escrow(program_id, accounts, rest)
        }
        1 => {
            msg!("Instruction: Release");
            process_release(program_id, accounts, rest)
        }
        2 => {
            msg!("Instruction: Refund");
            process_refund(program_id, accounts, rest)
        }
        3 => {
            msg!("Instruction: RaiseDispute");
            process_dispute(program_id, accounts, rest)
        }
        _ => {
            msg!("Error: unknown instruction discriminant {}", discriminant);
            Err(ProgramError::InvalidInstructionData)
        }
    }
}
