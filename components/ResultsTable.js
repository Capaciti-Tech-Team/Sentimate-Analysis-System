function ResultsTable({ results, totalResults, showAllResults, onToggleShowAll }) {
  try {
    const [expandedRows, setExpandedRows] = React.useState(new Set());
    const [sentimentFilter, setSentimentFilter] = React.useState('all');

    const toggleExpanded = (id) => {
      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      setExpandedRows(newExpanded);
    };

    const getSentimentIcon = (sentiment) => {
      switch (sentiment.toLowerCase()) {
        case 'positive': return 'icon-smile';
        case 'negative': return 'icon-frown';
        default: return 'icon-minus';
      }
    };

    const getSentimentClass = (sentiment) => {
      switch (sentiment.toLowerCase()) {
        case 'positive': return 'sentiment-positive';
        case 'negative': return 'sentiment-negative';
        default: return 'sentiment-neutral';
      }
    };

    const filteredResults = sentimentFilter === 'all' 
      ? results 
      : results.filter(r => r.sentiment.toLowerCase() === sentimentFilter);

    return (
      <div data-name="results-table" data-file="components/ResultsTable.js">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Analysis Results</h3>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="input-field w-auto mt-2 sm:mt-0 text-sm"
            >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Text</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sentiment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Confidence</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Keywords</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <React.Fragment key={result.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate" title={result.text}>
                        {result.text}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentClass(result.sentiment)}`}>
                        <div className={`${getSentimentIcon(result.sentiment)} text-sm`}></div>
                        {result.sentiment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${result.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {result.keywords.slice(0, 3).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                        {result.keywords.length > 3 && (
                          <span className="text-xs text-gray-500">+{result.keywords.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExpanded(result.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <div className={`icon-chevron-${expandedRows.has(result.id) ? 'up' : 'down'} text-lg`}></div>
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(result.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-4 py-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Full Text:</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{result.text}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Sentiment Drivers:</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 text-xs rounded ${getSentimentClass(result.sentiment)}`}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No results match the selected filter.
          </div>
        )}
        
        {totalResults > 5 && (
          <div className="mt-4 text-center">
            <button
              onClick={onToggleShowAll}
              className="btn btn-secondary text-sm"
            >
              {showAllResults ? (
                <>
                  <div className="icon-chevron-up text-sm"></div>
                  Show Less
                </>
              ) : (
                <>
                  <div className="icon-chevron-down text-sm"></div>
                  View More ({totalResults - 5} remaining)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ResultsTable component error:', error);
    return null;
  }
}