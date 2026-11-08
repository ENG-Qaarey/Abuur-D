export function formatNumber(value: number) {
    return value.toLocaleString("en-US");
}

export function formatCurrency(value: number) {
    return "$" + value.toLocaleString("en-US");
}
