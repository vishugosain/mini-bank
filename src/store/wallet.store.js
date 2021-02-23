import { writable } from 'svelte/store';
import { LOCAL_WALLET } from '../app.constants';

function createWallet() {
    const {subscribe, set, update} = writable(JSON.parse(localStorage.getItem(LOCAL_WALLET)) || []);

    return {
        subscribe,
        addWallet: (wallet) => update(wallets => {
            wallets = [...wallets, wallet];
            localStorage.setItem(LOCAL_WALLET, JSON.stringify(wallets));
        }),
        reset: () => set([])
    }

}

export const wallet = createWallet();