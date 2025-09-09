function ExportOptions({ results }) {
  try {
    const exportToCsv = () => {
      const headers = ['Text', 'Sentiment', 'Confidence', 'Keywords'];
      const csvContent = [
        headers.join(','),
        ...results.map(result => [
          `"${result.text.replace(/"/g, '""')}"`,
          result.sentiment,
          result.confidence.toFixed(3),
          `"${result.keywords.join('; ')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const exportToJson = () => {
      const jsonContent = JSON.stringify(results, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const exportToPdf = () => {
      const printWindow = window.open('', '_blank');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sentiment Analysis Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .positive { color: #10b981; background-color: #f0f9ff; }
            .negative { color: #ef4444; background-color: #fef2f2; }
            .neutral { color: #6b7280; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Sentiment Analysis Results</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Text</th>
                <th>Sentiment</th>
                <th>Confidence</th>
                <th>Keywords</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(result => `
                <tr>
                  <td>${result.text}</td>
                  <td class="${result.sentiment.toLowerCase()}">${result.sentiment}</td>
                  <td>${(result.confidence * 100).toFixed(1)}%</td>
                  <td>${result.keywords.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    };

    return (
      <div className="flex gap-2" data-name="export-options" data-file="components/ExportOptions.js">
        <h4 className="text-sm font-medium text-gray-700 mr-2">Export Your Results:</h4>
        <button
          onClick={exportToCsv}
          className="btn btn-secondary text-xs"
          disabled={results.length === 0}
        >
          <div className="icon-file-spreadsheet text-sm"></div>
          CSV
        </button>
        <button
          onClick={exportToJson}
          className="btn btn-secondary text-xs"
          disabled={results.length === 0}
        >
          <div className="icon-file-json text-sm"></div>
          JSON
        </button>
        <button
          onClick={exportToPdf}
          className="btn btn-secondary text-xs"
          disabled={results.length === 0}
        >
          <div className="icon-file-text text-sm"></div>
          PDF
        </button>
      </div>
    );
  } catch (error) {
    console.error('ExportOptions component error:', error);
    return null;
  }
}