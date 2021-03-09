<script>
    import { wallet } from "../store/wallet.store";
    import {push, link} from 'svelte-spa-router';

    export let params = {};
    
    let transactionName = '';
    let transactionDesc = '';
    let transactionBalance = 0;
    let transactionType = 'debit';
    let isTouched = false;
    function addTransaction() {
        if (!transactionName || transactionBalance == null) {
            isTouched = true;
            return;
        }
        if (transactionName.length > 30) {
            isTouched = true;
            return;
        }
        if (transactionDesc.length > 200) {
            isTouched = true;
            return;
        }
        isTouched = false;
        wallet.addTransaction({
            id: '_' + Math.random().toString(36).substr(2, 9),
            name: transactionName.trim(),
            desc: (transactionDesc && transactionDesc.trim()) || '',
            amount: transactionBalance,
            type: transactionType,
            duration: params.duration.toLowerCase(),
            createdAt: new Date().toIndianFormat()
        }, params.id);
        push(`/${params.id}`);
    }
    </script>
    <form>
        <div class="top-bar">
            <a href="/{params.id}" use:link>
                <img src="assets/arrow-left.svg" alt="Back">
            </a>
        </div>
        <div class="form-row">
            <label>
                <h4>Name<span class="required-asterik">*</span></h4>
                <input bind:value={transactionName} type="text" placeholder="Transaction Name" required="true">
                <div class="input-bottom">
                    {#if isTouched}
                        {#if !transactionName}
                            <h5 class="red">This field is required</h5>
                        {/if}
                        {#if transactionName.length > 30}
                            <h5 class="red">Wallet name cannot be more than 30 characters.</h5>
                        {/if}
                    {/if}
                    <h4 class={transactionName.length > 30 ? 'char-count red': 'char-count'}>{transactionName.length}/30</h4>
                </div>
            </label>
        </div>
        <div class="form-row">
            <label>
                <h4>Description</h4>
                <textarea bind:value={transactionDesc} type="text" placeholder="Transaction Description"></textarea>
                <div class="input-bottom">
                    {#if isTouched}
                        {#if transactionDesc.length > 200}
                            <h5 class="red">Wallet Description cannot be more than 200 characters.</h5>
                        {/if}
                    {/if}
                    <h4 class={transactionDesc.length > 200 ? 'char-count red': 'char-count'}>{transactionDesc.length}/200</h4>
                </div>
            </label>
        </div>
        <div class="form-row">
            <label>
                <h4>Transaction Amount (₹)<span class="required-asterik">*</span></h4>
                <input bind:value={transactionBalance} type="number" step="1" placeholder="Wallet Initial Balance" required="true">
            </label>
        </div>
        <div class="form-row">
            <label>
                <h4>Transaction Type<span class="required-asterik">*</span></h4>
                <select bind:value={transactionType}>
                    <option value="debit">Debit (-)</option>
                    <option value="credit">Credit (+)</option>
                </select>
            </label>
        </div>
        <button on:click|preventDefault={addTransaction}>
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
                    >h4 {
                        color: $dark-blue;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                    }
                }
                input, textarea {
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