<script>
    import { wallet } from "../store/wallet.store";
    import {link, push} from 'svelte-spa-router';
    import { getYearList, monthNames, MONTH_MAP } from "../app.constants";

    export let params = {}
    let selectedWallet = $wallet.find(wallet => wallet.id === params.id);
    let selectedYear = new Date().getFullYear();
    let selectedMonth = monthNames[new Date().getMonth()];
    const yearList = getYearList();
    let selectedDuration = `${selectedMonth}-${selectedYear}`;
    function setDuration() {
        selectedDuration = `${selectedMonth}-${selectedYear}`;
    }
    function deleteWallet() {
        wallet.deleteWallet(selectedWallet.id);
        push('/');
    }
</script>

<section>
    <div class="top-bar">
        <a href="/" use:link>
            <img src="assets/arrow-left.svg" alt="Back">
        </a>
        <button class="danger-btn" on:click={deleteWallet}>Delete</button>
    </div>
    <div class="wallet-header">
        <img src="assets/wallet.svg" alt="wallet">
        <h3>{selectedWallet.name}</h3>
        <h2 class={selectedWallet.balance < 0 ? 'red': 'green'}>₹{selectedWallet.balance}</h2>
    </div>
    <div class="date-picker">
        <!-- svelte-ignore a11y-no-onchange -->
        <select bind:value={selectedMonth} on:change={setDuration}>
            {#each monthNames as month}
            <option value={month}>{MONTH_MAP[month]}</option>
            {/each}
        </select>
        <!-- svelte-ignore a11y-no-onchange -->
        <select bind:value={selectedYear} on:change={setDuration}>
            {#each yearList as year}
            <option value={year}>{year}</option>
            {/each}
        </select>
    </div>
    <div class="wallet-transactions">
        <h3>TRANSACTIONS</h3>
        {#if selectedWallet.transactions && selectedWallet.transactions.length}
            {#each selectedWallet.transactions.filter(t => t.duration === selectedDuration) as transaction}
                <a href="/{selectedWallet.id}/{transaction.id}/edit" use:link>
                    <div class="transaction">
                        <div class="transaction-info">
                            <h4>{transaction.name}</h4>
                            <h5>{transaction.desc}</h5>
                        </div>
                        <h2 class={transaction.type === 'debit' ? 'red': 'green'}>₹{transaction.amount}</h2>
                    </div>
                </a>
            {/each}
        {:else}
            <p class="placeholder">No Transactions</p>
        {/if}
    </div>
    <a href="/{selectedWallet.id}/{selectedDuration}/add" use:link>
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
        box-sizing: border-box;
        .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            a {
                img {
                    width: 32px;
                    height: 32px;
                    object-fit: contain;
                }
            }
        }
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
                        color: $dark-blue;
                    }
                    h5 {
                        color: $gray;
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

    @media screen and (max-width: 425px) {
        section {
            min-width: 95%;
        }
    }
</style>