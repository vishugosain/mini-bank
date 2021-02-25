<script>
	import Router from 'svelte-spa-router';
	import {routes} from './router';
</script>

<main>
	<img src="assets/bank.svg" alt="MiniBank">
	<h1>Mini Bank</h1>
	<p>Store all your transactions</p>
	<p>(All of your transactions are stored locally in your browser.)</p>
	<Router {routes} />
</main>

<style type="text/scss">
	@import './styles/_main.scss';
	main {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		img {
			width: 80px;
			height: 80px;
			object-fit: contain;
			margin-bottom: 16px;
		}
		h1 {
			line-height: 1;
			font-size: 48px;
			color: $yellow;
		}
		p{
			color: $gray;
		}
	}
</style>