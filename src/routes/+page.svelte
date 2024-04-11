<!-- App.svelte -->
<script lang="ts">
	import {
		CHAINLINK_FEED,
		CHAINLINK_PROGRAM_ID,
		TOKEN_METADATA_PROGRAM_ID,
		connection,
		endpoint,
		programId
	} from '$lib';
	import {
		findMasterEditionPda,
		findMetadataPda,
		mplTokenMetadata
	} from '@metaplex-foundation/mpl-token-metadata';
	import { publicKey } from '@metaplex-foundation/umi';
	import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
	import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
	import { web3 } from '@project-serum/anchor';
	import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
	import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
	//@ts-ignore
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';

	const umi = createUmi(endpoint)
		.use(walletAdapterIdentity($walletStore, true))
		.use(mplTokenMetadata());
	let initialized = true;
	let isLoading = false;
	let initIsLoading = false;
	let domainName = 'domain1';
	let uri = 'https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA';
	let title = 'Nft title';
	let errorMessage = '';
	let domainType = 'solana';
	const top_domains = ['solana', 'meta', 'music', 'nft', 'web3', 'lpp', '404', '007'];

	//wallet mnemonic= wash paddle silly corn glance embrace cannon armed fortune trade wrap invite

	async function initDns() {
		let [dnsState] = web3.PublicKey.findProgramAddressSync([Buffer.from('dns_state')], programId);

		try {
			initIsLoading = true;
			const tx = await $workSpace.program?.methods
				.initDns(top_domains)
				.accounts({
					dnsState: dnsState,
					signer: $walletStore.publicKey,
					systemProgram: $workSpace.systemProgram?.programId
				})
				.transaction();
			const latestBlockHash = await connection.getLatestBlockhash();
			tx!.feePayer = $walletStore.publicKey;
			tx!.recentBlockhash = latestBlockHash.blockhash;
			const signedTx = await $walletStore.signTransaction(tx);
			const txId = await connection.sendRawTransaction(signedTx.serialize());
			await connection.confirmTransaction({
				signature: txId,
				blockhash: latestBlockHash.blockhash,
				lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
			});
			initialized = true;
			initIsLoading = false;
			//initial txId: 3pjer97DJf9BJV3skKs9k7S2wj6GRaw54Cmz9Lb8Ft1sfHMJBvumXpwgFTbLfua9duxDUrgyAb11Hseyrj2jqFnT
		} catch (error: any) {
			initialized = true;
			initIsLoading = false;
			errorMessage = new Error(error).message;
		}
	}

	async function registerDomain() {
		try {
			isLoading = true;
			errorMessage = '';
			const _domainName = domainName + '.' + domainType;
			const mint = web3.Keypair.generate();

			const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, $walletStore.publicKey);

			const metadataAccount = findMetadataPda(umi, {
				mint: publicKey(mint.publicKey)
			})[0];

			const masterEditionAccount = findMasterEditionPda(umi, {
				mint: publicKey(mint.publicKey)
			})[0];

			const [dnsState] = web3.PublicKey.findProgramAddressSync(
				[Buffer.from('dns_state')],
				programId
			);
			const [derivedPublicKey] = web3.PublicKey.findProgramAddressSync(
				[Buffer.from('domain'), Buffer.from(_domainName)],
				programId
			);

			const tx = await $workSpace.program?.methods
				.registerDomain(_domainName, 1, mint.publicKey, uri, title, 'sol')
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
					metadata: metadataAccount,
					tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
					masterEdition: masterEditionAccount,
					authority: $walletStore.publicKey,
					rent: web3.SYSVAR_RENT_PUBKEY,
					systemProgram: web3.SystemProgram.programId
				})
				.transaction();

			const latestBlockHash = await connection.getLatestBlockhash();
			tx!.feePayer = $walletStore.publicKey;
			tx!.recentBlockhash = latestBlockHash.blockhash;
			const signedTx = await $walletStore.signTransaction(tx);
			const txId = await connection.sendRawTransaction(signedTx.serialize());
			await connection.confirmTransaction({
				signature: txId,
				blockhash: latestBlockHash.blockhash,
				lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
			});
			console.log('🚀 ~ registerDomain ~ signedTx:', txId);
		} catch (error: any) {
			isLoading = false;
			console.log('🚀 ~ registerDomain ~ error:', error);
			errorMessage = new Error(error).message;
		}
		isLoading = false;
	}
</script>

<div class="container">
	<div class="form-container">
		<WalletMultiButton />
		<h2>Initial Program</h2>
		<button on:click={initDns} disabled={initialized || initIsLoading}>
			{initIsLoading ? 'Loading...' : initialized ? 'Initialed' : 'Init Program'}</button
		>
		<h2>Domain Registration</h2>
		<form on:submit|preventDefault={registerDomain}>
			<label for="domainName">Domain Name:</label>
			<div style="display: flex;">
				<input
					type="text"
					id="domainName"
					bind:value={domainName}
					pattern={'[a-zA-Z0-9-]+.[a-zA-Z]{2,}'}
					title="Please enter a valid domain name (e.g., example.com)"
					required
				/>
				<select id="domainType" bind:value={domainType}>
					{#each top_domains as domain (domain)}
						<option value={domain}>.{domain}</option>
					{/each}
				</select>
			</div>

			<label for="metadataURI">URI:</label>
			<input type="text" id="metadataURI" bind:value={uri} />

			<label for="metadataURI">Title:</label>
			<input type="text" id="metadataTitle" bind:value={title} />

			<button type="submit" disabled={isLoading}
				>{isLoading ? 'Loading...' : 'Register Domain'}</button
			>
			<span>{errorMessage}</span>
		</form>
	</div>
</div>

<style>
	:root {
		--custom-primary-color: #512da8;
		--custom-button-color: #512da8;
		--custom-button-hover-color: #311b92;
		--custom-button-disabled-color: #5c5b62;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.form-container {
		max-width: 400px;
		min-width: 320px;
		margin: 0 auto;
		padding: 20px;
		border: 1px solid var(--custom-primary-color);
		border-radius: 5px;
		background-color: #f9f9f9;
	}

	.form-container label {
		display: block;
		font-weight: bold;
	}

	.form-container input[type='text'] {
		width: 100%;
		padding: 10px;
		border: 1px solid var(--custom-primary-color);
		border-radius: 5px;
		box-sizing: border-box;
	}
	.form-container select {
		width: 40%;
		padding: 10px;
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
	.form-container button:disabled {
		cursor: auto;
		background-color: var(--custom-button-disabled-color);
	}
	.form-container form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
