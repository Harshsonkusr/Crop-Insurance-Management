
/**
 * Utility functions for handling file downloads
 */

/**
 * Triggers a browser download for a JSON file
 * @param data The data object to download
 * @param filename The name of the file
 */
export const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Triggers a browser download for a CSV file
 * @param data Array of objects (flat structure works best)
 * @param filename The name of the file
 */
export const downloadCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
        console.error('No data to download');
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Convert to CSV string
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle strings with commas or quotes
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Triggers the browser's print dialog, allowing users to "Save as PDF"
 * This is the most consistent way to get a PDF without heavy libraries.
 */
export const printToPDF = () => {
    window.print();
};

/**
 * Creates a mock "Download" for a specific remote file URL by opening it in a new tab
 * (since we can't force download on cross-origin without proxy usually)
 */
export const downloadFile = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    if (filename) link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
