function ComparativeAnalysis({ history, onCompare }) {
  try {
    const [selectedAnalyses, setSelectedAnalyses] = React.useState([]);
    const [comparisonData, setComparisonData] = React.useState(null);

    const handleAnalysisSelection = (analysisId, checked) => {
      if (checked) {
        setSelectedAnalyses(prev => [...prev, analysisId].slice(-3)); // Max 3 comparisons
      } else {
        setSelectedAnalyses(prev => prev.filter(id => id !== analysisId));
      }
    };

    const generateComparison = () => {
      const selectedData = history.filter(h => selectedAnalyses.includes(h.id));
      
      const comparison = selectedData.map(analysis => {
        const counts = { positive: 0, negative: 0, neutral: 0, mixed: 0, sarcastic: 0 };
        analysis.results.forEach(result => {
          const sentiment = result.sentiment.toLowerCase();
          if (counts.hasOwnProperty(sentiment)) {
            counts[sentiment]++;
          }
        });
        
        return {
          id: analysis.id,
          name: `${analysis.template} (${new Date(analysis.timestamp).toLocaleDateString()})`,
          source: analysis.source,
          total: analysis.count,
          sentiments: counts,
          averageConfidence: analysis.results.reduce((sum, r) => sum + r.confidence, 0) / analysis.results.length
        };
      });
      
      setComparisonData(comparison);
    };

    React.useEffect(() => {
      if (selectedAnalyses.length >= 2) {
        generateComparison();
      } else {
        setComparisonData(null);
      }
    }, [selectedAnalyses]);

    return (
      <div className="card" data-name="comparative-analysis" data-file="components/ComparativeAnalysis.js">
        <h3 className="text-lg font-semibold mb-4">Comparative Analysis</h3>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select analyses to compare (max 3):</h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((analysis) => (
              <label key={analysis.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedAnalyses.includes(analysis.id)}
                  onChange={(e) => handleAnalysisSelection(analysis.id, e.target.checked)}
                  disabled={!selectedAnalyses.includes(analysis.id) && selectedAnalyses.length >= 3}
                  className="rounded"
                />
                <span className="text-sm">
                  {analysis.template} - {analysis.count} entries ({new Date(analysis.timestamp).toLocaleDateString()})
                </span>
              </label>
            ))}
          </div>
        </div>

        {comparisonData && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Analysis</th>
                    <th className="px-3 py-2 text-center">Total</th>
                    <th className="px-3 py-2 text-center">Positive</th>
                    <th className="px-3 py-2 text-center">Negative</th>
                    <th className="px-3 py-2 text-center">Neutral</th>
                    <th className="px-3 py-2 text-center">Avg Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((analysis) => (
                    <tr key={analysis.id}>
                      <td className="px-3 py-2 font-medium">{analysis.name}</td>
                      <td className="px-3 py-2 text-center">{analysis.total}</td>
                      <td className="px-3 py-2 text-center text-green-600">{analysis.sentiments.positive}</td>
                      <td className="px-3 py-2 text-center text-red-600">{analysis.sentiments.negative}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{analysis.sentiments.neutral}</td>
                      <td className="px-3 py-2 text-center">{(analysis.averageConfidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ComparativeAnalysis component error:', error);
    return null;
  }
}