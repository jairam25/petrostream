/**
 * Change #8: Chart Capture Utility
 * Uses html2canvas to capture DOM elements (Recharts SVGs) as PNG images
 * for embedding in PDF reports or downloading as standalone images.
 */

import html2canvas from 'html2canvas';

export interface CaptureOptions {
    scale?: number; // DPI multiplier (default 2 for retina)
    backgroundColor?: string;
    width?: number;
    height?: number;
}

/**
 * Captures a DOM element as a PNG data URL.
 * @param element - The DOM element to capture (chart container div)
 * @param options - Capture options
 * @returns PNG data URL string
 */
export async function captureElementToDataURL(
    element: HTMLElement,
    options: CaptureOptions = {}
): Promise<string> {
    const { scale = 2, backgroundColor = '#ffffff', width, height } = options;
    const canvas = await html2canvas(element, {
        scale,
        backgroundColor,
        useCORS: true,
        logging: false,
        width,
        height,
    });
    return canvas.toDataURL('image/png');
}

/**
 * Captures a DOM element and triggers a PNG download.
 * @param element - The DOM element to capture
 * @param filename - Download filename (without extension)
 * @param options - Capture options
 */
export async function downloadElementAsPNG(
    element: HTMLElement,
    filename: string,
    options: CaptureOptions = {}
): Promise<void> {
    const dataUrl = await captureElementToDataURL(element, options);
    triggerDownload(dataUrl, `${filename}.png`);
}

/**
 * Captures a DOM element and returns the canvas for PDF embedding.
 * @param element - The DOM element to capture
 * @param options - Capture options
 * @returns HTMLCanvasElement
 */
export async function captureElementToCanvas(
    element: HTMLElement,
    options: CaptureOptions = {}
): Promise<HTMLCanvasElement> {
    const { scale = 2, backgroundColor = '#ffffff', width, height } = options;
    return html2canvas(element, {
        scale,
        backgroundColor,
        useCORS: true,
        logging: false,
        width,
        height,
    });
}

/**
 * Converts a data URL to a Blob for download.
 */
export function dataURLToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
}

/**
 * Triggers a browser download of a data URL or Blob.
 */
export function triggerDownload(data: string | Blob, filename: string): void {
    const url = typeof data === 'string' ? data : URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof data !== 'string') {
        URL.revokeObjectURL(url);
    }
}

/**
 * Captures an SVG element directly and triggers an SVG download.
 * Works with Recharts SVG containers.
 * @param element - The SVG element or container
 * @param filename - Download filename (without extension)
 */
export function downloadSVG(element: HTMLElement, filename: string): void {
    const svg = element.querySelector('svg');
    if (!svg) {
        console.warn('No SVG element found in container');
        return;
    }
    const clone = svg.cloneNode(true) as SVGElement;
    // Add white background for export
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'white');
    clone.insertBefore(rect, clone.firstChild);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    triggerDownload(blob, `${filename}.svg`);
}

/**
 * Exports chart data as CSV and triggers download.
 * @param data - Array of objects (chart data points)
 * @param columns - Column definitions with key and header label
 * @param filename - Download filename (without extension)
 */
export function downloadCSV(
    data: Record<string, any>[],
    columns: { key: string; label: string }[],
    filename: string
): void {
    const headers = columns.map((c) => c.label).join(',');
    const rows = data.map((row) =>
        columns.map((c) => {
            const val = row[c.key];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
            return String(val);
        }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${filename}.csv`);
}