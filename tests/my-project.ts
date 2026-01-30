import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfund } from "../target/types/crowdfund";

describe("crowdfund", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Crowdfund as Program<Crowdfund>;

  it("Is initialized!", async () => {
    const programId = await program.account.pda.programId;

    let seeds = [];
    let pdaAccount = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId)[0];

    await program.methods.initialize().accountsPartial({
      pda: pdaAccount
    }).rpc();
    
    console.log("lamport balance of pdaAccount",
    await anchor.getProvider().connection.getBalance(pdaAccount));
    // transfer 2 SOL
    await program.methods.donate(new anchor.BN(2_000_000_000)).accounts({
      pda: pdaAccount
    }).rpc();

    console.log("lamport balance of pdaAccount after donation",
    await anchor.getProvider().connection.getBalance(pdaAccount));

    // transfer back 1 SOL
    // the signer is the permitted address
    await program.methods.withdraw(new anchor.BN(1_000_000_000)).accounts({
      pda: pdaAccount
    }).rpc();


    console.log("lamport balance of pdaAccount after withdrawal",
    await anchor.getProvider().connection.getBalance(pdaAccount));  
    // try to transfer back another 1_000_000_001 lamports, rent exemption should prevent this
    try {
      await program.methods.withdraw(new anchor.BN(1_000_000_001)).accounts({
        pda: pdaAccount
      }).rpc();
    } catch (e) {
      console.log("expected error on over-withdrawal:", e);
    }

    // check balance again to confirm no change
    console.log("lamport balance of pdaAccount after failed withdrawal",
    await anchor.getProvider().connection.getBalance(pdaAccount));

  });
});
