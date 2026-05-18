/**
 * Utility functions for exporting data to CSV and printing pages.
 */

/**
 * Exports an array of objects to a CSV file.
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Desired filename (without extension)
 */
export const exportToCSV = (data, filename = 'export') => {
  if (!data || !data.length) {
    console.error('No data provided for export');
    return;
  }

  try {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row)
        .map(value => {
          const val = value === null || value === undefined ? '' : value;
          return `"${val.toString().replace(/"/g, '""')}"`;
        })
        .join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('CSV Export failed:', error);
  }
};

/**
 * Triggers the browser's print dialog.
 */
export const printPage = () => {
  window.print();
};
