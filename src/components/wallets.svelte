<script>
    import { wallet } from '../store/wallet.store.js';
    import {link} from 'svelte-spa-router'
</script>
<section>
    {#if $wallet.length}
    <div class="wallet-wrap">
        {#each $wallet as wallet}
            <a href="/{wallet.name.toLowerCase()}" use:link>
                <div class="wallet">
                    <img src="assets/wallet.svg" alt="wallet">
                    <h3>{wallet.name}</h3>
                    <h2>₹{wallet.balance}</h2>
                </div>
            </a>
        {/each}
    </div>
    {:else}
        <h3 class="placeholder">No Wallets here.</h3>
    {/if}
    <a href="/#/create">
        <button class="add-wallet">
            <div>Add Wallet</div>
            +
        </button>
    </a>
</section>
<style type="text/scss">
    @import '../styles/_main.scss';
    section {
        padding: 16px;
        min-width: 50%;
        .wallet-wrap {
            display: flex;
            margin-bottom: 16px;
            a {
                width: 100%;
            }
            .wallet {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                cursor: pointer;
                border: 1px solid #ccc;
                border-radius: 8px;
                img {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                }
                h2 {
                    margin-left: auto;
                    color: $dark-blue;
                }
                h3 {
                    color: black;
                    font-weight: 400;
                    margin-left: 8px;
                }
            }
        }
        .placeholder {
            text-align: center;
            color: $gray;
            margin: 48px 0;
        }
        .add-wallet {
            border-radius: 26px;
            padding: 2px 16px;
            color: white;
            background: $yellow;
            display: flex;
            align-items: center;
            float: right;
            cursor: pointer;
            transition: all 0.25s ease-out;
            font-size: 32px;
            border: none;
            outline: none;
            div {
                max-width: 0;
                display: inline-flex;
                white-space: nowrap;
                overflow: hidden;
                font-size: 20px;
                opacity: 0;
                transition: all 0.5s ease-out;
            }
            &:hover {
                div {
                    max-width: 20rem;
                    opacity: 1;
                    padding-right: 8px;
                }
            }
        }
    }
</style>