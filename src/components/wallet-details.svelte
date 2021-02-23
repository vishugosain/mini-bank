<script>
import { wallet } from "../store/wallet.store";
import {link} from 'svelte-spa-router';
export let params = {}
let selectedWallet = $wallet.find(wallet => wallet.id === params.id);
let durations = (selectedWallet.transactions && Object.keys(selectedWallet.transactions)) || [];
let selectedDuration = (durations.length && durations[0]) || '';
</script>

<section>
    <div class="wallet-header">
        <img src="assets/wallet.svg" alt="wallet">
        <h3>{selectedWallet.name}</h3>
        <h2>₹{selectedWallet.balance}</h2>
    </div>
    {#if durations && durations.length}
    <div class="date-picker">
        <select bind:value={selectedDuration}>
            {#each durations as duration}
            <option value={duration}>{duration}</option>
            {/each}
        </select>
    </div>
    {/if}
    <div class="wallet-transactions">
        <h3>TRANSACTIONS</h3>
        {#if selectedWallet.transactions && selectedWallet.transactions[selectedDuration]}
            {#each selectedWallet.transactions[selectedDuration] as transaction}
                <div class="transaction">
                    <div class="transaction-info">
                        <h4>{transaction.name}</h4>
                        <h5>{transaction.desc}</h5>
                    </div>
                    <h2 class={transaction.type === 'debit' ? 'red': 'green'}>₹{transaction.amount}</h2>
                </div>
            {/each}
        {:else}
            <p class="placeholder">No Transactions</p>
        {/if}
    </div>
    <a href="/{selectedWallet.id}/add" use:link>
        <button class="add-transaction">
            <div>Add Transaction</div>
            +
        </button>
    </a>
</section>
<style type="text/scss">
    @import '../styles/_main.scss';
    section {
        border-radius: 8px;
        box-shadow: 0px 5px 20px rgba(0,0,0,0.2);
        margin: 32px 0;
        min-width: 400px;
        padding: 16px;
        .wallet-header {
            display: flex;
            align-items: center;
            padding-bottom: 16px;
            border-bottom: 2px solid rgba(0,0,0,0.05);
            img {
                width: 48px;
                height: 48px;
                object-fit: contain;
                margin-right: 8px;
            }
            h2 {
                color: $dark-blue;
                margin-left: auto;
            }
            h3 {
                font-size: 24px;
            }
        }
        .date-picker {
            margin-top: 8px;
            text-align: right;
        }
        .wallet-transactions {
            margin-top: 8px;
            .transaction {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border: 1px solid $gray;
                border-radius: 8px;
                padding: 8px;
                margin: 8px 0;
                .transaction-info {
                    h4 {
                        
                    }
                    h5 {
                        color: $gray;
                    }
                }
                h2 {
                    &.red {
                        color: $red;
                    }
                    &.green {
                        color: $green;
                    }
                }
            }
            .placeholder {
                text-align: center;
                margin: 16px 0;
                color: $gray;
            }
        }
        a {
            width: 100%;
        }
        .add-transaction {
            border-radius: 24px;
            padding: 7px 16px;
            color: white;
            background: $yellow;
            display: flex;
            align-items: center;
            float: right;
            cursor: pointer;
            transition: all 0.25s ease-out;
            font-size: 24px;
            border: none;
            outline: none;
            margin-bottom: 0;
            div {
                max-width: 0;
                display: inline-flex;
                white-space: nowrap;
                overflow: hidden;
                font-size: 16px;
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