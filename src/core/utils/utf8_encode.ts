export function utf8Encode(value: string): string {
    return Buffer.from(value, 'utf-8').toString();
}