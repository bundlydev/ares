/**
 * Converts a JavaScript object into an array of header key-value pairs.
 * 
 * @param {Record<string, string>} headers - The object representing the headers with keys as header names and values as header values.
 * @returns {Array<[string, string]>} - An array of header key-value pairs.
 */
export function parseHeadersRequest(headers: Record<string, string>): [string, string][] {
    return Object.entries(headers);
}

/**
 * Converts data based on its type. If the data is a string, it will be converted to a Uint8Array.
 * If the data is an array of numbers, it will be converted to a Uint8Array.
 * If the data is an object, it will be converted to a Uint8Array after converting to a JSON string.
 * If the data is neither a string, an array of numbers, nor an object, it will return null.
 * 
 * @param {string | number[] | Record<string, unknown> | null} data - The data to be converted.
 * @returns {Uint8Array | null} - The converted data as a Uint8Array or null if the data cannot be converted.
 */
export function parseBodyRequest(data: string | number[] | Record<string, unknown> | null): Uint8Array {
    const encoder = new TextEncoder();

    if (typeof data === 'string') {
        // Attempt to convert string to object and then to JSON string
        try {
            return encoder.encode(data);
        } catch (error) {
            // If conversion to object and then to JSON string fails, return original string as Uint8Array
            const encoder = new TextEncoder();
            return encoder.encode(data);
        }
    }

    if (Array.isArray(data) || (typeof data === 'object' && data !== null)) {
        // Convert array to JSON string and then to Uint8Array
        try {
            const jsonData = JSON.stringify(data);
            return encoder.encode(jsonData);
        } catch (error) {
            throw error;
        }
    }

    throw new Error('Data type not supported');
}
