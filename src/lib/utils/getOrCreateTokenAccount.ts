import type { Wallet } from '@project-serum/anchor';
import {
	TokenAccountNotFoundError,
	TokenInvalidAccountOwnerError,
	TokenInvalidMintError,
	TokenInvalidOwnerError,
	createAssociatedTokenAccountInstruction,
	getAccount,
	getAssociatedTokenAddressSync,
	type Account
} from '@solana/spl-token';
import { Transaction, type Connection, type PublicKey } from '@solana/web3.js';

export async function getOrCreateAssociatedTokenAccount(
	connection: Connection,
	payer: Wallet,
	mint: PublicKey,
	owner: PublicKey
): Promise<Account> {
	const associatedToken = getAssociatedTokenAddressSync(mint, owner);

	// This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
	// Sadly we can't do this atomically.
	let account: Account;
	try {
		account = await getAccount(connection, associatedToken);
	} catch (error: unknown) {
		// TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
		// becoming a system account. Assuming program derived addressing is safe, this is the only case for the
		// TokenInvalidAccountOwnerError in this code path.
		if (
			error instanceof TokenAccountNotFoundError ||
			error instanceof TokenInvalidAccountOwnerError
		) {
			// As this isn't atomic, it's possible others can create associated accounts meanwhile.
			try {
				const transaction = new Transaction().add(
					createAssociatedTokenAccountInstruction(payer.publicKey, associatedToken, owner, mint)
				);

				transaction!.feePayer = payer.publicKey;
				transaction!.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
				const signedTx = await payer.signTransaction(transaction);

				const txId = await connection.sendRawTransaction(signedTx.serialize());
				await connection.confirmTransaction(txId);
			} catch (error: unknown) {
				// Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
				// instruction error if the associated account exists already.
			}

			// Now this should always succeed
			account = await getAccount(connection, associatedToken);
		} else {
			throw error;
		}
	}

	if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
	if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

	return account;
}
