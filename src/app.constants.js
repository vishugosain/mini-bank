export const LOCAL_WALLET = 'localWallet';
export const monthNames = [
    "Jan","Feb","Mar","Apr",
    "May","Jun","Jul","Aug",
    "Sep", "Oct","Nov","Dec"
];
export function getYearList() {
    const year = new Date().getFullYear();
    const years = [year];
    for (let i = 1;i <= 10;i++) {
        years.push(year + i);
        years.unshift(year - i);
    }
    return years;
}