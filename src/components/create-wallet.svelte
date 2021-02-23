<script>
import { wallet } from "../store/wallet.store";
import {push} from 'svelte-spa-router'

    let errorMsg = '';
    let walletName = '';
    let walletInitialBalance = 0;
    function addWallet() {
        if (!walletName || walletInitialBalance == null) {
            errorMsg = 'Fill all the required details';
            return;
        }
        errorMsg = '';
        wallet.addWallet({
            name: walletName,
            balance: walletInitialBalance
        });
        push('/');
    }
</script>
<form>
    <div class="form-row">
        <label>
            <h4>Name</h4>
            <input bind:value={walletName} type="text" placeholder="Wallet Name">
        </label>
    </div>
    <div class="form-row">
        <label>
            <h4>Initial Balance (₹)</h4>
            <input bind:value={walletInitialBalance} type="number" step="1" placeholder="Wallet Initial Balance">
        </label>
    </div>
    {#if errorMsg}
        <div class="error-msg">{errorMsg}</div>
    {/if}
    <button on:click={addWallet}>
        <img src="assets/arrow-right.svg" alt="Add">
    </button>
</form>

<style type="text/scss">
    @import '../styles/_main.scss';
    form {
        min-width: 50%;
        padding: 80px 40px;
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
        button {
            background: $dark-blue;
            border: none;
            outline: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            cursor: pointer;
            margin: 32px auto;
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