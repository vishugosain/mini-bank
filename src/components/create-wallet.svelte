<script>
import { wallet } from "../store/wallet.store";
import {push, link} from 'svelte-spa-router';

    let walletName = '';
    let walletInitialBalance = 0;
    let isTouched = false;
    function addWallet() {
        if (!walletName || walletInitialBalance == null) {
            isTouched = true;
            return;
        }
        if (walletName.length > 30) {
            isTouched = true;
            return;
        }
        isTouched = false;
        wallet.addWallet({
            id: '_' + Math.random().toString(36).substr(2, 9),
            name: walletName.trim(),
            balance: walletInitialBalance,
            transactions: [],
        });
        push('/');
    }
</script>
<form>
    <div class="top-bar">
        <a href="/" use:link>
            <img src="assets/arrow-left.svg" alt="Back">
        </a>
    </div>
    <div class="form-row">
        <label>
            <h4>Name <span class="required-asterik">*</span></h4>
            <input bind:value={walletName} type="text" placeholder="Wallet Name" class={walletName.length > 30 ? 'error' : ''}>
            <div class="input-bottom">
                {#if isTouched}
                    {#if !walletName}
                        <h5 class="red">This field is required</h5>
                    {/if}
                    {#if walletName.length > 30}
                        <h5 class="red">Wallet name cannot be more than 30 characters.</h5>
                    {/if}
                {/if}
                <h4 class={walletName.length > 30 ? 'char-count red': 'char-count'}>{walletName.length}/30</h4>
            </div>
        </label>
    </div>
    <div class="form-row">
        <label>
            <h4>Initial Balance (₹)<span class="required-asterik">*</span></h4>
            <input bind:value={walletInitialBalance} type="number" step="1" placeholder="Wallet Initial Balance">
            <div class="input-bottom">
                {#if isTouched}
                    {#if walletInitialBalance === null}
                        <h5 class="red">This field is required</h5>
                    {/if}
                {/if}
            </div>
        </label>
    </div>
    <button on:click|preventDefault={addWallet}>
        <img src="assets/arrow-right.svg" alt="Add">
    </button>
</form>

<style type="text/scss">
    @import '../styles/_main.scss';
    form {
        min-width: 50%;
        padding: 32px 24px;
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
                &>h4 {
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
            .input-bottom {
                display: flex;
                align-items: center;
                h4 {
                    margin-left: auto;
                }
                h5 {
                    font-weight: 400;
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
    @media screen and (max-width: 425px) {
        form {
            min-width: 90%;
        }
    }
</style>