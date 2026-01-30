import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { OtherWrite } from "../target/types/other_write";

// this airdrops sol to an address
async function airdropSol(publicKey, amount) {
  let airdropTx = await anchor.getProvider().connection.requestAirdrop(publicKey, amount);
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

describe("other_write", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.OtherWrite as Program<OtherWrite>;

  it("Is initialized!", async () => {
    const alice = anchor.web3.Keypair.generate();
    const bob = anchor.web3.Keypair.generate();

    const airdrop_alice_tx = await anchor.getProvider().connection.requestAirdrop(alice.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
    await confirmTransaction(airdrop_alice_tx);

    const airdrop_bob_tx = await anchor.getProvider().connection.requestAirdrop(bob.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
    await confirmTransaction(airdrop_bob_tx);

    let seeds = [];
    const [myStorage, _bump] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);

    // ALICE INITIALIZE ACCOUNT
    await program.methods.initialize().accountsPartial({
      myStorage: myStorage,
      fren: alice.publicKey
    }).signers([alice]).rpc();

    // BOB WRITE TO ACCOUNT
    await program.methods.updateValue(new anchor.BN(3)).accountsPartial({
      myStorage: myStorage,
      fren: bob.publicKey
    }).signers([bob]).rpc();

    let value = await program.account.myStorage.fetch(myStorage);
    console.log(`value stored is ${value.x}`);
  });
});
