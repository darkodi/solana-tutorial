use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("HUBqtg5NkMCyygzyxx9Vc4X389icp6i9pXPV9pnrkEaH");

#[program]
pub mod sol_splitter {
    use super::*;

    pub fn send_sol(ctx: Context<SendSol>, amount: u64) -> Result<()> {
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(), 
        system_program::Transfer {
            from: ctx.accounts.signer.to_account_info(),
            to: ctx.accounts.recipient.to_account_info(),
        }
    );

    // Just use `?` — reverts automatically on failure!
    system_program::transfer(cpi_context, amount)?;
    
    Ok(())
}

}

#[derive(Accounts)]
pub struct SendSol<'info> {
    /// CHECK: we do not read or write the data of this account
    #[account(mut)]
    recipient: UncheckedAccount<'info>,
    
    system_program: Program<'info, System>,

    #[account(mut)]
    signer: Signer<'info>,
}
