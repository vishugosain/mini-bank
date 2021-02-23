import Wallets from './components/wallets.svelte';
import CreateWallet from './components/create-wallet.svelte';
import WalletDetails from './components/wallet-details.svelte';
import CreateTransaction from './components/create-transaction.svelte';

export const routes = {
    '/': Wallets,
    '/create': CreateWallet,
    '/:id': WalletDetails,
    '/:id/add': CreateTransaction,
    '*': Wallets
}