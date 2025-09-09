function BatchTextInput({ onAnalyze, loading, hasAnalyzedResults, onNewAnalysis }) {
  try {
    const [bulkText, setBulkText] = React.useState('');
    const [error, setError] = React.useState('');
    const [isExpanded, setIsExpanded] = React.useState(true);

    const parseBulkText = (text) => {
      const entries = text
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      return entries;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      
      const validEntries = parseBulkText(bulkText);
      
      if (validEntries.length === 0) {
        setError('Please enter at least one text entry.');
        return;
      }

      const texts = validEntries.map((text, index) => ({
        text: text.trim(),
        id: `batch_${Date.now()}_${index}`,
        source: 'manual_batch',
        entry_index: index + 1,
        timestamp: new Date().toISOString()
      }));

      onAnalyze(texts);
    };

    return (
      <div data-name="batch-text-input" data-file="components/BatchTextInput.js">
        <form onSubmit={handleSubmit} style={{"paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","fontSize":"20px","color":"rgb(15, 23, 42)","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"start","fontWeight":"400","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="space-y-3">
          <label style={{"paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"8px","marginLeft":"0px","fontSize":"22px","color":"rgb(31, 41, 55)","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"start","fontWeight":"700","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="block text-lg font-bold text-gray-800 mb-2">Paste text entries</label>
          {!hasAnalyzedResults || isExpanded ? (
            <>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste your text entries here, one per line:&#10;First review or text entry&#10;Second review or text entry&#10;Third review or text entry..."
                className="input-field resize-none text-sm h-32"
                disabled={loading}
              />
              <div className="text-xs text-gray-500">
                {parseBulkText(bulkText).length} entries ready
              </div>
              
              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !bulkText.trim()}
                  className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2"
                >
                  <div className="icon-zap"></div>
                  {loading ? 'Analyzing...' : `Analyze ${parseBulkText(bulkText).length} Entries`}
                </button>
                <FileUploadButton onAnalyze={onAnalyze} loading={loading} />
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(true);
                  onNewAnalysis();
                  setBulkText('');
                }}
                className="btn btn-primary"
              >
                <div className="icon-plus text-sm"></div>
                Analyze More Text
              </button>
            </div>
          )}
        </form>
      </div>
    );
  } catch (error) {
    console.error('BatchTextInput component error:', error);
    return null;
  }
}
