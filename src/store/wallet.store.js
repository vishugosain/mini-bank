import { writable } from 'svelte/store';
import { LOCAL_WALLET } from '../app.constants';

function saveToLocalStorage(wallets) {
    console.log('Stored Data', wallets);
    localStorage.setItem(LOCAL_WALLET, JSON.stringify(wallets));
}

function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem(LOCAL_WALLET));
}

function restoreTransactionBalance(transaction, walletBalance) {
    return Number(transaction.type === 'debit' ? (+walletBalance + +transaction.amount).toFixed(2) : (+walletBalance - +transaction.amount).toFixed(2));
}

function handleTransactionBalance(transaction, walletBalance) {
    return Number(transaction.type === 'debit' ? (+walletBalance - +transaction.amount).toFixed(2) : (+walletBalance + +transaction.amount).toFixed(2));
}

function createWallet() {
    const {subscribe, set, update} = writable(getFromLocalStorage() || []);

    return {
        subscribe,
        addWallet: (wallet) => update(wallets => {
            wallets = [...wallets, wallet];
            saveToLocalStorage(wallets);
            return wallets;
        }),
        deleteWallet: (walletId) => update(wallets => {
            const walletIndex = wallets.findIndex(wallet => wallet.id === walletId);
            if (walletIndex > -1) {
                wallets.splice(walletIndex, 1);
            }
            saveToLocalStorage(wallets);
            return wallets;
        }),
        addTransaction: (transaction, walletId) => update(wallets => {
            wallets = wallets.map(wallet => {
                if (wallet.id === walletId) {
                    wallet.transactions = [...wallet.transactions, transaction];
                    wallet.balance = handleTransactionBalance(transaction, wallet.balance);
                }
                return wallet;
            });
            saveToLocalStorage(wallets);
            return wallets;
        }),
        editTransaction: (transaction, walletId) => update(wallets => {
            wallets = wallets.map(wallet => {
                if (wallet.id === walletId) {
                    wallet.transactions = [...wallet.transactions.map(trans => {
                        if (trans.id === transaction.id) {
                            wallet.balance = restoreTransactionBalance(trans, wallet.balance);
                            wallet.balance = handleTransactionBalance(transaction, wallet.balance);
                            return transaction;
                        }
                        return trans;
                    })];
                }
                return wallet;
            });
            saveToLocalStorage(wallets);
            return wallets;
        }),
        deleteTransaction: (transaction, walletId) => update(wallets => {
            wallets = wallets.map(wallet => {
                if (wallet.id === walletId) {
                    const findIndex = wallet.transactions.findIndex(t => t.id === transaction.id);
                    if (findIndex > -1) {
                        wallet.balance = restoreTransactionBalance(transaction, wallet.balance);
                        wallet.transactions.splice(findIndex, 1);
                    }
                }
                return wallet;
            });
            saveToLocalStorage(wallets);
            return wallets;
        }),
        reset: () => {
            set([]);
            localStorage.removeItem(LOCAL_WALLET);
        }
    }

}

export const wallet = createWallet();