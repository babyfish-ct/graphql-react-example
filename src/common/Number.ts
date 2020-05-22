export function numberOf(value: number | string | null | undefined): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    let num: number;
    if (typeof(value) === 'number') {
        num = value as number;
    } else {
        num = parseInt(value.toString());
    }
    if (isNaN(num)) {
        return undefined;
    }
    return num;
}