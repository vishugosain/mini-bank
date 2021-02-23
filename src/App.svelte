<script>
	import Router from 'svelte-spa-router';
	import {routes} from './router';
</script>

<main>
	<h1>Mini Bank</h1>
	<p>Store all your transactions</p>
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