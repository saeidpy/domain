<!-- App.svelte -->
<script lang="ts">
	import { programId } from '$lib';
	import { web3 } from '@project-serum/anchor';
	import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
	import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
	import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
	import { onMount } from 'svelte';
	let initialized = false;
	let domainName = '';
	let metadataURI = '';
	

	async function initDns() {
	let [dnsState] = web3.PublicKey.findProgramAddressSync([Buffer.from('dns_state')], programId);

		try {
			if (!initialized) {
				const top_domains = ['solana', 'meta', 'music', 'nft', 'web3', 'lpp', '404', '007'];
				await $workSpace.program?.methods
					.initDns(top_domains)
					.accounts({
						dnsState: dnsState,
						signer: $workSpace.baseAccount!.publicKey,
						systemProgram: $workSpace.systemProgram?.programId
					})
					.signers([$workSpace.baseAccount!])
					.rpc();
				initialized = true; // Update initialization status
			} else {
				console.log('Program already initialized');
			}
		} catch (error) {
			console.log('🚀 ~ initDns ~ error:', error);
		}
	}

	// Function to register a domain
	async function registerDomain() {
	let [dnsState] = web3.PublicKey.findProgramAddressSync([Buffer.from('dns_state')], programId);

		try {
			await $workSpace.program?.methods
				.registerDomain(
					'domain1',
					1,
					$workSpace.baseAccount!.publicKey,
					'https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA',
					'NFT Title',
					'sol'
				)
				.accounts({
					domain: $workSpace.baseAccount!.publicKey,
					state: dnsState,
					receiver: $workSpace.baseAccount!.publicKey,

					// chainlinkFeed: CHAINLINK_FEED,
					chainlinkProgram: 'HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny',

					receiverAta: undefined,
					payerAta: undefined,

					mintAuthority: $workSpace.baseAccount!.publicKey,
					mint: $workSpace.baseAccount!.publicKey,
					// tokenAccount: nftTokenAccountBob,
					tokenProgram: TOKEN_PROGRAM_ID,
					// metadata: 'metadataAddress',
					// tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
					// masterEdition: masterEdition,

					authority: $workSpace.baseAccount!.publicKey,
					rent: web3.SYSVAR_RENT_PUBKEY,
					systemProgram: web3.SystemProgram.programId
				})
				.signers([$workSpace.baseAccount!])
				.rpc();
		} catch (error) {
			console.log('🚀 ~ registerDomain ~ error:', error);
		}
	}

	// Initialize Solana program on component mount
	onMount(() => {
		initDns();
	});
</script>

<div class="container">
	<div class="form-container">
		<WalletMultiButton />
		<h2>Solana Domain Registration</h2>
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

	.form-container button[type='submit'] {
		width: 100%;
		padding: 10px;
		background-color: var(--custom-button-color);
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.form-container button[type='submit']:hover {
		background-color: var(--custom-button-hover-color);
	}
</style>
