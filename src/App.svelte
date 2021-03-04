<script>
	import { wallet } from './store/wallet.store.js';
	import Router, {push} from 'svelte-spa-router';
	import {routes} from './router';

	function deleteAll() {
		wallet.reset();
		push('/');
	}
</script>

<main>
	<img src="assets/bank.svg" alt="MiniBank">
	<h1>Mini Bank</h1>
	<p>Store all your transactions</p>
	<p>(All of the data are stored in your browser.)</p>
	<div class="top-bar">
        <button class="danger-btn" on:click={deleteAll}>Delete All</button>
    </div>
	<Router {routes} />
</main>

<style type="text/scss">
	@import './styles/_main.scss';
	main {
		width: 100vw;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		overflow: auto;
		.top-bar {
			padding-top: 16px;
        }
		img {
			width: 80px;
			height: 80px;
			object-fit: contain;
			margin: 16px 0;
		}
		h1 {
			line-height: 1;
			font-size: 48px;
			color: $yellow;
		}
		p{
			color: $gray;
			text-align: center;
		}
	}
</style>