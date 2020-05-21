export function numberOf(value: number | string | undefined): number | undefined {
    if (value === undefined) {
        return value;
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