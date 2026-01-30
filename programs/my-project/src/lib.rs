use anchor_lang::prelude::*;
use std::mem::size_of;

declare_id!("HUBqtg5NkMCyygzyxx9Vc4X389icp6i9pXPV9pnrkEaH");

#[program]
pub mod init_if_needed {
    use super::*;

    pub fn increment(ctx: Context<Initialize>) -> Result<()> {
        let current_counter = ctx.accounts.my_pda.counter;
        ctx.accounts.my_pda.counter = current_counter + 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        payer = signer,
        space = size_of::<MyPDA>() + 8,
        seeds = [],
        bump
    )]
    pub my_pda: Account<'info, MyPDA>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MyPDA {
    pub counter: u64,
}
