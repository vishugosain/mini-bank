export const LOCAL_WALLET = 'localWallet';
export const monthNames = [
    "jan","feb","mar","apr",
    "may","jun","jul","aug",
    "sep", "oct","nov","dec"
];
export const MONTH_MAP = {
    'jan': 'January',
    'feb': 'February',
    'mar': 'March',
    'apr': 'April',
    'may': 'May',
    'jun': 'June',
    'jul': 'July',
    'aug': 'August',
    'sep': 'September',
    'oct': 'October',
    'nov': 'November',
    'dec': 'December'
};
export function getYearList() {
    const year = new Date().getFullYear();
    const years = [year];
    for (let i = 1;i <= 10;i++) {
        years.push(year + i);
        years.unshift(year - i);
    }
    return years;
}