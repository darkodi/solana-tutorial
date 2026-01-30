import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Batch } from "../target/types/batch";

describe("batch", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Batch as Program<Batch>;

  it("Is initialized!", async () => {
    const wallet = anchor.workspace.Batch.provider.wallet.payer;
    const [pda, _bump] = anchor.web3.PublicKey.findProgramAddressSync([], program.programId);

    const initTx = await program.methods.initialize().accounts({pda: pda}).transaction();

    // for u32, we don't need to use big numbers
    const setTx = await program.methods.set(5).accounts({pda: pda}).transaction();

    // batch the two transactions into one
    let transaction = new anchor.web3.Transaction();
    transaction.add(initTx);
    transaction.add(setTx);

    await anchor.web3.sendAndConfirmTransaction(anchor.getProvider().connection, transaction, [wallet]);

    const pdaAcc = await program.account.pda.fetch(pda);
    console.log(pdaAcc.value); // prints 5
  });
});
