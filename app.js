class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
      const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [currentView, setCurrentView] = React.useState('single');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showAllResults, setShowAllResults] = React.useState(false);
    const [hasAnalyzedResults, setHasAnalyzedResults] = React.useState(false);

    const [inputMode, setInputMode] = React.useState('batch');
    const [analysisHistory, setAnalysisHistory] = React.useState([]);
    const [selectedForComparison, setSelectedForComparison] = React.useState([]);
    const [apiStatus, setApiStatus] = React.useState({
      status: 'checking',
      provider: 'Hugging Face Inference API',
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      lastChecked: null,
      rateLimitRemaining: null,
      responseTime: null
    });

    React.useEffect(() => {
      checkApiStatus();
    }, []);

    const checkApiStatus = async () => {
      const startTime = Date.now();
      try {
        // Test API connectivity with a simple request
        const response = await fetch('https://proxy-api.trickle-app.host/?url=https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer hf_demo_token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: "test" })
        });
        
        const responseTime = Date.now() - startTime;
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        
        setApiStatus({
          status: response.ok ? 'online' : 'limited',
          provider: 'Hugging Face Inference API',
          model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
          lastChecked: new Date().toISOString(),
          rateLimitRemaining: rateLimitRemaining || 'Unknown',
          responseTime: responseTime
        });
      } catch (error) {
        setApiStatus(prev => ({
          ...prev,
          status: 'offline',
          lastChecked: new Date().toISOString(),
          responseTime: Date.now() - startTime
        }));
      }
    };



    const handleAnalysis = async (texts, isFile = false) => {
      setLoading(true);
      setError('');
      
      try {
        const analysisResults = await analyzeSentiments(texts);
        setResults(analysisResults);
        setHasAnalyzedResults(true);
        
        // Add to analysis history
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          template: 'General Analysis',
          source: isFile ? 'file_upload' : 'batch_input',
          count: analysisResults.length,
          results: analysisResults
        };
        setAnalysisHistory(prev => [historyEntry, ...prev].slice(0, 10));
        
        // Auto-scroll to results after analysis
        setTimeout(() => {
          const resultsSection = document.querySelector('[data-name="results-section"]');
          if (resultsSection) {
            resultsSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);
        
      } catch (err) {
        const errorMessage = handleAnalysisError(err);
        setError(errorMessage);
        console.error('Analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    const filteredResults = results.filter(result => {
      if (!searchTerm) return true;
      return result.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
             result.sentiment.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const displayedResults = showAllResults ? filteredResults : filteredResults.slice(0, 5);

    return (
      <div data-name="app" data-file="app.js" style={{"paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","fontSize":"16px","color":"rgb(15, 23, 42)","backgroundColor":"#ffffff","textAlign":"start","fontWeight":"400","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="min-h-screen">
        <Header apiStatus={apiStatus} onRefreshApi={checkApiStatus} />
        
        <div className="container py-8">
          {/* Input Section */}
          <div className="mb-6">
            <div style={{"paddingTop":"24px","paddingRight":"81px","paddingBottom":"24px","paddingLeft":"24px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","fontSize":"16px","color":"rgb(15, 23, 42)","backgroundColor":"rgba(255, 255, 255, 0.8)","textAlign":"start","fontWeight":"400","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="card p-6">
              <BatchTextInput 
                onAnalyze={handleAnalysis} 
                loading={loading} 
                hasAnalyzedResults={hasAnalyzedResults}
                onNewAnalysis={() => setHasAnalyzedResults(false)}
              />
            </div>
          </div>

          {/* Results Section */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3" data-name="results-section">
              {/* Visualization Panel */}
              <div className="card p-4">
                <VisualizationPanel results={filteredResults} />
              </div>

              {/* Search and Export Options */}
              <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="icon-search text-sm text-gray-400"></div>
                    <input
                      type="text"
                      placeholder="Search results..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field max-w-xs text-sm"
                    />
                  </div>
                  <ExportOptions results={filteredResults} />
                </div>
              </div>

              {/* Results Table */}
              <div className="card p-4">
                <ResultsTable 
                  results={displayedResults}
                  totalResults={filteredResults.length}
                  showAllResults={showAllResults}
                  onToggleShowAll={() => setShowAllResults(!showAllResults)}
                  onSelectForComparison={setSelectedForComparison}
                  selectedForComparison={selectedForComparison}
                />
              </div>
            </div>
          )}

          {loading && (
            <div className="card p-6 text-center">
              <div className="animate-spin w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Analyzing sentiment...</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);