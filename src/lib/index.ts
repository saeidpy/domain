// place files you want to import through the `$lib` alias in this folder.
import { web3 } from "@project-serum/anchor";
import idl from "./solana_idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export { idl }
export const commitmentLevel = "confirmed";
export const endpoint = clusterApiUrl("devnet");
export const connection = new Connection(endpoint);
export const programId = new PublicKey(idl.metadata.address);
export const programInterface = JSON.parse(JSON.stringify(idl));
export const CHAINLINK_FEED = new web3.PublicKey('99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR')
export const CHAINLINK_PROGRAM_ID = new web3.PublicKey('HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny')
export const METADATA_SEED = 'metadata';
export const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);
