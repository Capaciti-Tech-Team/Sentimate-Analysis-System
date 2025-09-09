function FileUpload({ onAnalyze, loading }) {
  try {
    const [dragActive, setDragActive] = React.useState(false);
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
        setError(''); // Clear any previous errors on success
      } catch (err) {
        setError(`Error processing file: ${err.message || 'Please try again.'}`);
        console.error('File processing error:', err);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    };

    const handleDrag = (e) => {
      e.preventDefault();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    return (
      <div data-name="file-upload" data-file="components/FileUpload.js">
        <label className="block text-lg font-bold text-gray-800 mb-2">
          File Upload Analysis
        </label>
        <p className="text-gray-600 mb-3 text-sm">Upload PDF or TXT files</p>
        
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDrag}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <div className="icon-upload text-2xl text-gray-400 mb-2"></div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drop files or click to browse
          </p>
          <p className="text-xs text-gray-500">
            TXT and PDF files supported
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={loading}
        />
        
        {error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('FileUpload component error:', error);
    return null;
  }
}