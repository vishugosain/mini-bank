import { writable } from 'svelte/store';
import { LOCAL_WALLET } from '../app.constants';

function saveToLocalStorage(wallets) {
    localStorage.setItem(LOCAL_WALLET, JSON.stringify(wallets));
}

function createWallet() {
    const {subscribe, set, update} = writable(JSON.parse(localStorage.getItem(LOCAL_WALLET)) || []);

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
                    if (wallet.transactions[transaction.duration]) {
                        wallet.transactions[transaction.duration] = [...wallet.transactions[transaction.duration], transaction];
                    } else {
                        wallet.transactions[transaction.duration] = [transaction];
                    }
                    transaction.type === 'debit' ? wallet.balance -= transaction.amount : wallet.balance += transaction.amount;
                }
                return wallet;
            });
            saveToLocalStorage(wallets);
            return wallets;
        }),
        editTransaction: (transaction, walletId) => update(wallets => {
            wallets = wallets.map(wallet => {
                if (wallet.id === walletId) {
                    const transactionIndex = wallet.transactions[transaction.duration].findIndex(t => t.id === transaction.id);
                    if (transactionIndex > -1) {
                        const oldTransaction = wallet.transactions[transaction.duration][transactionIndex];
                        transaction.type === 'debit' ? wallet.balance += oldTransaction.amount : wallet.balance -= oldTransaction.amount;
                        wallet.transactions[transaction.duration][transactionIndex] = transaction;
                    }
                    transaction.type === 'debit' ? wallet.balance -= transaction.amount : wallet.balance += transaction.amount;
                }
                return wallet;
            });
            saveToLocalStorage(wallets);
            return wallets;
        }),
        deleteTransaction: (transaction, walletId) => update(wallets => {
            wallets = wallets.map(wallet => {
                if (wallet.id === walletId) {
                    const transactionIndex = wallet.transactions[transaction.duration].findIndex(t => t.id === transaction.id);
                    if (transactionIndex > -1) {
                        wallet.transactions[transaction.duration].splice(transactionIndex, 1);
                    }
                    transaction.type === 'debit' ? wallet.balance += transaction.amount : wallet.balance -= transaction.amount;
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