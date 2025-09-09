function FileUploadButton({ onAnalyze, loading }) {
  try {
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef(null);

    const handleFiles = async (files) => {
      setError('');
      const file = files[0];
      
      if (!file) return;
      
      const validTypes = ['text/plain', 'application/pdf'];
      const validExtensions = ['.txt', '.pdf'];
      
      const hasValidType = validTypes.includes(file.type);
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!hasValidType && !hasValidExtension) {
        setError('Please upload a valid TXT or PDF file.');
        return;
      }

      try {
        let extractedText = '';
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          try {
            extractedText = await extractPdfText(file);
          } catch (pdfError) {
            setError(`PDF Error: ${pdfError.message}`);
            return;
          }
        } else {
          extractedText = await file.text();
        }
        
        const texts = await parseFileContent(extractedText, file.name, file.type);
        
        if (texts.length === 0) {
          setError('No readable text content found in file. Please ensure the file contains text.');
          return;
        }

        onAnalyze(texts, true);
        setError('');
      } catch (err) {
        setError(`Error processing file: ${err.message || 'Please try again.'}`);
        console.error('File processing error:', err);
      }
    };

    return (
      <div className="relative" data-name="file-upload-button" data-file="components/FileUploadButton.js">
        <button
          type="button"
          onClick={() => !loading && fileInputRef.current?.click()}
          disabled={loading}
          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2 px-4"
          title="Upload File (PDF, TXT)"
        >
          <div className="icon-plus text-sm"></div>
          Upload File
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={loading}
        />
        
        {error && (
          <div className="absolute top-full left-0 right-0 mt-1 text-xs text-red-600 bg-red-50 p-2 rounded border z-10">
            {error}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('FileUploadButton component error:', error);
    return null;
  }
}