import { writable } from 'svelte/store';
import { LOCAL_WALLET } from '../app.constants';

function createWallet() {
    const {subscribe, set, update} = writable(JSON.parse(localStorage.getItem(LOCAL_WALLET)) || []);

    return {
        subscribe,
        addWallet: (wallet) => update(wallets => {
            wallets = [...wallets, wallet];
            localStorage.setItem(LOCAL_WALLET, JSON.stringify(wallets));
            return wallets;
        }),
        deleteWallet: (walletId) => update(wallets => {
            const walletIndex = wallets.findIndex(wallet => wallet.id === walletId);
            if (walletIndex > -1) {
                wallets.splice(walletIndex, 1);
            }
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
                }
                return wallet;
            });
            localStorage.setItem(LOCAL_WALLET, JSON.stringify(wallets));
            return wallets;
        }),
        reset: () => set([])
    }

}

export const wallet = createWallet();