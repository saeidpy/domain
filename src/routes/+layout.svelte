<script lang="ts">
	import { endpoint, idl, commitmentLevel } from '$lib';
	import { ConnectionProvider, WalletProvider } from '@svelte-on-solana/wallet-adapter-ui';
	import { onMount } from 'svelte';
	import { AnchorConnectionProvider } from '@svelte-on-solana/wallet-adapter-anchor';
	const localStorageKey = 'walletAdapter';
	const network = endpoint; // localhost or mainnet
	const config = commitmentLevel;

	let wallets: any;

	onMount(async () => {
		const { PhantomWalletAdapter } = await import('@solana/wallet-adapter-wallets');

		const walletsMap = [new PhantomWalletAdapter()];

		wallets = walletsMap;
	});
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<ConnectionProvider {network} {config} />
<AnchorConnectionProvider {network} {idl} />
<div>
	<slot />
</div>
