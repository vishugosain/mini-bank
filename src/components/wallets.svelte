<script>
    import { wallet } from '../store/wallet.store.js';
    import {link} from 'svelte-spa-router';

</script>
<section>
    <a href="/create" use:link>
        <button class="add-wallet">
            <div>Add Wallet</div>
            +
        </button>
    </a>
    <div class="total-balance">
        <h3>Total Balance</h3>
        <h2>₹{$wallet.reduce((sum, wallet) => sum + wallet.balance, 0)}</h2>
    </div>
    {#if $wallet && $wallet.length}
    <div class="wallet-wrap">
        {#each $wallet as wallet}
            <a href="/{wallet.id}" use:link>
                <div class="wallet">
                    <img src="assets/wallet.svg" alt="wallet">
                    <div class="wallet-info">
                        <h3>{wallet.name}</h3>
                        <h4 class="balance">₹{wallet.balance}</h4>
                    </div>
                </div>
            </a>
        {/each}
    </div>
    {:else}
        <h3 class="placeholder">No Wallets here.</h3>
    {/if}
</section>
<style type="text/scss">
    @import '../styles/_main.scss';
    section {
        padding: 16px;
        width: 400px;
        display: flex;
        flex-direction: column;
        .total-balance {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            border: 1px solid $dark-blue;
            background: $dark-blue;
            color: white;
            border-radius: 8px;
            margin: 8px 0;
            h3 {
                font-size: 24px;
            }
        }
        .wallet-wrap {
            display: flex;
            margin: 16px 0;
            flex-direction: column;
            width: 100%;
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
                margin: 8px 0;
                img {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                }
                .wallet-info {
                    padding: 0 8px;
                    flex: 1 1 0;
                    overflow: hidden;
                    h3 {
                        color: black;
                        font-weight: 400;
                        font-size: 24px;
                        width: 100%;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                    h4 {
                            color: $dark-blue;
                    }
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