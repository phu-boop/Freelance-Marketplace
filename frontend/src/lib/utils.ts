import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatAmount(amount: number | string) {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getPublicUrl(url: string | null | undefined) {
    if (!url) return '';

    let processedUrl = url;

    // Fix for local development: replace internal docker hostname 'minio' with 'localhost'
    if (processedUrl.includes('minio:9000')) {
        processedUrl = processedUrl.replace(/minio:9000/g, 'localhost:9000');
    }

    // If it's a MinIO/Localhost storage URL, strip query parameters (signatures)
    // We use a public read policy now, so signatures are not needed and actually 
    // cause failures if the hostname doesn't match the signature calculation.
    if (processedUrl.includes('localhost:9000') || processedUrl.includes('minio:9000')) {
        if (processedUrl.includes('?')) {
            processedUrl = processedUrl.split('?')[0];
        }
    }

    return processedUrl;
}
