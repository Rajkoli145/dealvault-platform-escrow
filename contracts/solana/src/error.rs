use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum EscrowError {
    #[error("Invalid instruction data provided")]
    InvalidInstruction,

    #[error("Escrow account is not rent exempt")]
    NotRentExempt,

    #[error("Expected amount does not match deposited amount")]
    ExpectedAmountMismatch,

    #[error("Arithmetic overflow occurred")]
    AmountOverflow,

    #[error("Insufficient funds in escrow account")]
    InsufficientFunds,

    #[error("The signer is not authorized to perform this action")]
    InvalidSigner,

    #[error("The escrow is in an invalid state for this operation")]
    InvalidState,

    #[error("Dispute has not been resolved yet")]
    DisputeNotResolved,

    #[error("Deadline has not been reached yet")]
    DeadlineNotReached,

    #[error("Escrow deadline has passed")]
    DeadlinePassed,

    #[error("Account data deserialization failed")]
    DeserializationFailed,
}

impl From<EscrowError> for ProgramError {
    fn from(e: EscrowError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
