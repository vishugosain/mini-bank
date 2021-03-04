<script>
	import { wallet } from './store/wallet.store.js';
	import Router, {push} from 'svelte-spa-router';
	import {routes} from './router';

	let profileLinks = [
		{
			link: 'https://github.com/vishugosain/mini-bank',
			icon: 'assets/github.svg',
			altText: 'Github'
		},
		{
			link: 'https://svelte.dev/',
			icon: 'assets/svelte.svg',
			altText: 'Svelte'
		}
	]

	function deleteAll() {
		wallet.reset();
		push('/');
	}
</script>

<main>
	<div class="about-wrap">
		{#each profileLinks as link}
			<a href={link.link}><img src={link.icon} alt={link.altText}></a>
		{/each}
	</div>
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
		.about-wrap {
			position: fixed;
			top: 0;
			right: 0;
			padding: 16px;
			display: flex;
			flex-direction: column;
			img {
				height: 36px;
				width: 36px;
				margin: 4px 0;
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