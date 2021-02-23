import Wallets from './components/wallets.svelte'
import CreateWallet from './components/create-wallet.svelte'

export const routes = {
    '/': Wallets,
    '/create': CreateWallet,
    '*': Wallets
}