import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KeypairVsPda } from "../target/types/keypair_vs_pda";

// this airdrops sol to an address
async function airdropSol(publicKey, amount) {
  let airdropTx = await anchor.getProvider().connection.requestAirdrop(publicKey, amount * anchor.web3.LAMPORTS_PER_SOL);
  await confirmTransaction(airdropTx);
}

async function confirmTransaction(tx) {
  const latestBlockHash = await anchor.getProvider().connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
}

describe("keypair_vs_pda", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.KeypairVsPda as Program<KeypairVsPda>;

  it("Is initialized -- keypair version", async () => {
		
    const newKeypair = anchor.web3.Keypair.generate();
    await airdropSol(newKeypair.publicKey, 1e9); // 1 SOL

    console.log("the keypair account address is", newKeypair.publicKey.toBase58());

    await program.methods.initializeKeypairAccount()
      .accounts({myKeypairAccount: newKeypair.publicKey})
      .signers([newKeypair]) // the signer must be the keypair
      .rpc()
      
    console.log("my_keypair_account x value", (await program.account.myKeypairAccount.fetch(newKeypair.publicKey)).x.toNumber());
  
  });
});
