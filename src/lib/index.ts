// place files you want to import through the `$lib` alias in this folder.
import idl from "./solana_idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

/* Constants for RPC Connection the Solana Blockchain */
export const commitmentLevel = "processed";
export const endpoint = clusterApiUrl("devnet");
export const connection = new Connection(endpoint, commitmentLevel);

/* Constants for the Deployed "Hello World" Program */
export const programId = new PublicKey(idl.metadata.address);
export const programInterface = JSON.parse(JSON.stringify(idl));
export {idl}