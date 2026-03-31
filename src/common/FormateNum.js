export function formatNumber(num) {
    if (num >= 1000000000000000) {
        return (num / 1000000000000000).toFixed(2) + 'Q';  // For quadrillions
    } else if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(2) + 'T';     // For trillions
    } else if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';     // For billions
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';        // For millions
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';           // For thousands
    } else {
        return num.toString();                          // For numbers less than 1000
    }
}