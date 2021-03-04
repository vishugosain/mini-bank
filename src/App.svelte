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
	<div class="about-wrap">
		<h4>Made with ❤️ using 
			<a href="https://svelte.dev/">
				<img src="assets/svelte.svg" alt="Svelte">
			</a>
			and 
			<a href="https://github.com/vishugosain/mini-bank">
				<img src="assets/github.svg" alt="Github" />
			</a>
		</h4>
	</div>
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
		.about-wrap {
			padding: 16px;
			h4 {
				display: flex;
				align-items: center;
				line-height: 0;
			}
			img {
				height: 24px;
				width: 24px;
				margin: 0 4px;
				object-fit: contain;
			}
		}
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