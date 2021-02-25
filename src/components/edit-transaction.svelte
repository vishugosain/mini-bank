<script>
    import { onMount } from 'svelte';
    import {wallet} from '../store/wallet.store';
    import {push, link} from 'svelte-spa-router';
    export let params = {};

    let errorMsg = '';
    let transactionName = '';
    let transactionDesc = '';
    let transactionBalance = 0;
    let transactionType = 'debit';
    let selectedTransaction;
    onMount(async () => {
        const selectedWallet = $wallet.find(wallet => wallet.id === params.id);
        selectedTransaction = selectedWallet.transactions[params.date].find(t => t.id === params.tId);
        transactionName = selectedTransaction.name;
        transactionDesc = selectedTransaction.desc;
        transactionBalance = selectedTransaction.amount;
        transactionType = selectedTransaction.type;
    });
    
    function editTransaction() {
        if (!transactionName || !transactionDesc || transactionBalance == null) {
            errorMsg = 'Fill all the required details';
            return;
        }
        errorMsg = '';
        wallet.editTransaction({
            id: params.tId,
            name: transactionName.trim(),
            desc: transactionDesc.trim(),
            amount: transactionBalance,
            type: transactionType,
            duration: selectedTransaction.duration
        }, params.id);
        push(`/${params.id}`);
    }
    function deleteTransaction() {
        wallet.deleteTransaction({
            id: params.tId,
            name: transactionName.trim(),
            desc: transactionDesc.trim(),
            amount: transactionBalance,
            type: transactionType,
            duration: selectedTransaction.duration
        }, params.id);
        push(`/${params.id}`);
    }
</script>
<form>
    <div class="top-bar">
        <a href="/{params.id}" use:link>
            <img src="assets/arrow-left.svg" alt="Back">
        </a>
        <button class="danger-btn" on:click={deleteTransaction}>Delete</button>
    </div>
    <div class="form-row">
        <label>
            <h4>Name</h4>
            <input bind:value={transactionName} type="text" placeholder="Transaction Name">
        </label>
    </div>
    <div class="form-row">
        <label>
            <h4>Description</h4>
            <input bind:value={transactionDesc} type="text" placeholder="Transaction Description">
        </label>
    </div>
    <div class="form-row">
        <label>
            <h4>Transaction Amount (₹)</h4>
            <input bind:value={transactionBalance} type="number" step="1" placeholder="Wallet Initial Balance">
        </label>
    </div>
    <div class="form-row">
        <label>
            <h4>Transaction Type</h4>
            <select bind:value={transactionType}>
                <option value="debit">Debit (-)</option>
                <option value="credit">Credit (+)</option>
            </select>
        </label>
    </div>
    {#if errorMsg}
        <div class="error-msg">{errorMsg}</div>
    {/if}
    <button class="submit-btn" on:click|preventDefault={editTransaction}>
        <img src="assets/arrow-right.svg" alt="Add">
    </button>
</form>

<style type="text/scss">
    @import '../styles/_main.scss';
    form {
        min-width: 50%;
        padding: 24px 16px;
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
        .form-row {
            margin: 8px 0;
            label {
                h4 {
                    color: $dark-blue;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
            }
            input {
                width: 100%;
                padding: 12px;
                outline: none;
                border-radius: 6px;
                font-family: 'Poppins', sans-serif;
                &::placeholder {
                    color: $gray;
                }
            }
        }
        .error-msg {
            margin: 8px 0;
            color: $red;
        }
        button.submit-btn {
            background: $dark-blue;
            border: none;
            outline: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            cursor: pointer;
            margin: 16px auto 0;
            transition: all 0.25s ease-out;
            img {
                width: 48px;
                height: 48px;
                color: white;
                object-fit: contain;
            }
            &:hover {
                transform: scale(1.1);
            }
        }
    }
</style>