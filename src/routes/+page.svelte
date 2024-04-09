<!-- App.svelte -->
<script lang="ts">
	import {
		CHAINLINK_FEED,
		CHAINLINK_PROGRAM_ID,
		METADATA_SEED,
		TOKEN_METADATA_PROGRAM_ID,
		connection,
		programId
	} from '$lib';
	import { getOrCreateAssociatedTokenAccount } from '$lib/utils/getOrCreateTokenAccount';
	import { web3 } from '@project-serum/anchor';
	import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
	import { getAssociatedTokenAddressSync } from '@solana/spl-token';
	import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
	import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
	import * as bs58 from 'bs58';

	let initialized = false;
	let domainName = '';
	let metadataURI = '';
	//wallet mnemonic= wash paddle silly corn glance embrace cannon armed fortune trade wrap invite
	async function initDns() {
		let [dnsState] = web3.PublicKey.findProgramAddressSync([Buffer.from('dns_state')], programId);

		try {
			if (!initialized) {
				const top_domains = ['solana', 'meta', 'music', 'nft', 'web3', 'lpp', '404', '007'];
				const tx = await $workSpace.program?.methods
					.initDns(top_domains)
					.accounts({
						dnsState: dnsState,
						signer: $walletStore.publicKey,
						systemProgram: $workSpace.systemProgram?.programId
					})
					.transaction();
				tx!.feePayer = $walletStore.publicKey;
				tx!.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
				const signedTx = await $walletStore.signTransaction(tx);
				const txId = await connection.sendRawTransaction(signedTx.serialize());
				await connection.confirmTransaction(txId);
				console.log('🚀 ~ initDns ~ txId:', txId);
				//initial txId: 3pjer97DJf9BJV3skKs9k7S2wj6GRaw54Cmz9Lb8Ft1sfHMJBvumXpwgFTbLfua9duxDUrgyAb11Hseyrj2jqFnT
			} else {
				console.log('Program already initialized');
			}
		} catch (error) {
			console.log('🚀 ~ initDns ~ error:', error);
		}
	}

	// Function to register a domain
	async function registerDomain() {
		let mint = {
			publicKey: new PublicKey(bs58.decode('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'))
		};

		// let airdropSignature = await connection.requestAirdrop(payer.publicKey, web3.LAMPORTS_PER_SOL);

		// await connection.confirmTransaction(airdropSignature);

		let lamportBalance;
		const balance = await connection.getBalance($walletStore.publicKey);
		lamportBalance = balance / LAMPORTS_PER_SOL;

		const [dnsState] = web3.PublicKey.findProgramAddressSync([Buffer.from('dns_state')], programId);
		const [derivedPublicKey] = web3.PublicKey.findProgramAddressSync(
			[Buffer.from('domain'), Buffer.from('domain1.solana')],
			programId
		);
		const [metadataAddress] = web3.PublicKey.findProgramAddressSync(
			[Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
			TOKEN_METADATA_PROGRAM_ID
		);

		// const tokenAccount = await getOrCreateAssociatedTokenAccount(
		// 	connection,
		// 	$walletStore,
		// 	mint.publicKey,
		// 	$walletStore.publicKey
		// );
		const tokenAccount = getAssociatedTokenAddressSync(mint.publicKey, $walletStore.publicKey);
		console.log("🚀 ~ registerDomain ~ tokenAccount:", tokenAccount)

		try {
			const tx = await $workSpace.program?.methods
				.registerDomain(
					'domain1.solana',
					1,
					mint.publicKey,
					'https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA',
					'NFT Title',
					'sol'
				)
				.accounts({
					domain: derivedPublicKey,
					state: dnsState,
					receiver: $walletStore.publicKey,
					chainlinkFeed: CHAINLINK_FEED,
					chainlinkProgram: CHAINLINK_PROGRAM_ID,
					receiverAta: $walletStore.publicKey,
					payerAta: $walletStore.publicKey,
					mintAuthority: $walletStore.publicKey,
					mint: mint.publicKey,
					tokenAccount: tokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
					metadata: metadataAddress,
					tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
					masterEdition: $walletStore.publicKey,
					authority: $walletStore.publicKey,
					rent: web3.SYSVAR_RENT_PUBKEY,
					systemProgram: web3.SystemProgram.programId
				})
				.transaction();

			tx!.feePayer = $walletStore.publicKey;
			tx!.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
			const signedTx = await $walletStore.signTransaction(tx);

			const txId = await connection.sendRawTransaction(signedTx.serialize());
			await connection.confirmTransaction(txId);
			console.log('🚀 ~ registerDomain ~ signedTx:', txId);
		} catch (error) {
			console.log('🚀 ~ registerDomain ~ error:', error);
		}
	}
</script>

<div class="container">
	<div class="form-container">
		<WalletMultiButton />
		<h2>Solana Domain Registration</h2>
		<button on:click={initDns}>init program</button>

		<form on:submit|preventDefault={registerDomain}>
			<label for="domainName">Domain Name:</label>
			<input
				type="text"
				id="domainName"
				bind:value={domainName}
				pattern={'[a-zA-Z0-9-]+.[a-zA-Z]{2,}'}
				title="Please enter a valid domain name (e.g., example.com)"
				required
			/>

			<label for="metadataURI">Metadata URI:</label>
			<input type="text" id="metadataURI" bind:value={metadataURI} />

			<button type="submit">Register Domain</button>
		</form>
	</div>
</div>

<style>
	:root {
		--custom-primary-color: #512da8;
		--custom-button-color: #512da8;
		--custom-button-hover-color: #311b92;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.form-container {
		max-width: 400px;
		margin: 0 auto;
		padding: 20px;
		border: 1px solid var(--custom-primary-color);
		border-radius: 5px;
		background-color: #f9f9f9;
	}

	.form-container label {
		display: block;
		margin-bottom: 10px;
		font-weight: bold;
	}

	.form-container input[type='text'] {
		width: 100%;
		padding: 10px;
		margin-bottom: 15px;
		border: 1px solid var(--custom-primary-color);
		border-radius: 5px;
		box-sizing: border-box;
	}

	.form-container button {
		width: 100%;
		padding: 10px;
		background-color: var(--custom-button-color);
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.form-container button:hover {
		background-color: var(--custom-button-hover-color);
	}
</style>
