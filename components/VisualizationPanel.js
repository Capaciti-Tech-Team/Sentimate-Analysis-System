function VisualizationPanel({ results }) {
  try {
      const pieChartRef = React.useRef(null);
    const chartInstanceRef = React.useRef(null);

    const getSentimentCounts = () => {
      const counts = { positive: 0, negative: 0, neutral: 0 };
      results.forEach(result => {
        const sentiment = result.sentiment.toLowerCase();
        if (counts.hasOwnProperty(sentiment)) {
          counts[sentiment]++;
        }
      });
      return counts;
    };

    const getConfidenceDistribution = () => {
      const ranges = { low: 0, medium: 0, high: 0 };
      results.forEach(result => {
        if (result.confidence < 0.6) ranges.low++;
        else if (result.confidence < 0.8) ranges.medium++;
        else ranges.high++;
      });
      return ranges;
    };

    const createPieChart = () => {
      const counts = getSentimentCounts();
      const ctx = pieChartRef.current?.getContext('2d');
      
      if (!ctx) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'pie',
        data: {
          labels: [
            `Positive (${counts.positive})`, 
            `Negative (${counts.negative})`, 
            `Neutral (${counts.neutral})`
          ],
          datasets: [{
            data: [counts.positive, counts.negative, counts.neutral],
            backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
            borderWidth: 3,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return `${context.label}: ${percentage}%`;
                }
              }
            }
          }
        }
      });
    };

    const createBarChart = () => {
      const counts = getSentimentCounts();
      const ctx = barChartRef.current?.getContext('2d');
      
      if (!ctx) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: ['Positive Sentiment', 'Negative Sentiment', 'Neutral Sentiment'],
          datasets: [{
            label: 'Number of Text Entries',
            data: [counts.positive, counts.negative, counts.neutral],
            backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
            borderRadius: 8,
            borderSkipped: false,
            borderWidth: 2,
            borderColor: ['#059669', '#dc2626', '#4b5563']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            tooltip: {
              callbacks: {
                title: function(context) {
                  return context[0].label;
                },
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y} entries`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 11,
                  weight: 'bold'
                }
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                font: {
                  size: 11
                }
              },
              title: {
                display: true,
                text: 'Number of Entries',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            }
          }
        }
      });
    };

    React.useEffect(() => {
      if (results.length === 0) return;

      createPieChart();

      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, [results]);

    const counts = getSentimentCounts();
    const total = results.length;

    return (
      <div data-name="visualization-panel" data-file="components/VisualizationPanel.js" style={{"paddingTop":"-1px","paddingRight":"24px","paddingBottom":"0px","paddingLeft":"24px","marginTop":"0px","marginRight":"9px","marginBottom":"0px","marginLeft":"9px","fontSize":"16px","color":"rgb(15, 23, 42)","backgroundColor":"rgba(255, 255, 255, 0.8)","textAlign":"start","fontWeight":"400","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="card p-6">
        <div className="text-center mb-4">
          <h3 style={{"paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"8px","marginLeft":"0px","fontSize":"25px","color":"rgb(31, 41, 55)","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"center","fontWeight":"700","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="text-lg font-bold text-gray-800 mb-2">Sentiment Distribution</h3>
          <p style={{"paddingTop":"11px","paddingRight":"0px","paddingBottom":"11px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","fontSize":"18px","color":"rgb(75, 85, 99)","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"center","fontWeight":"400","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="text-gray-600 text-sm">Visual breakdown of sentiments in analyzed text</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Statistics */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded h-20 flex flex-col justify-center">
                <div className="text-lg font-bold text-green-600">{counts.positive}</div>
                <div className="text-xs text-green-700">Positive</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((counts.positive / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded h-20 flex flex-col justify-center">
                <div className="text-lg font-bold text-red-600">{counts.negative}</div>
                <div className="text-xs text-red-700">Negative</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((counts.negative / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded h-20 flex flex-col justify-center">
                <div className="text-lg font-bold text-gray-600">{counts.neutral}</div>
                <div className="text-xs text-gray-700">Neutral</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((counts.neutral / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded mt-3 h-20 flex flex-col justify-center">
              <div className="text-sm font-semibold text-blue-800">Total Analyzed</div>
              <div className="text-xl font-bold text-blue-600">{total}</div>
            </div>
          </div>

          {/* Chart */}
          <div style={{"paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"100px","marginBottom":"0px","marginLeft":"-1px","fontSize":"20px","color":"rgb(15, 23, 42)","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"start","fontWeight":"500","objectFit":"fill","display":"flex","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="flex flex-col items-center">
            <h4 style={{"paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"12px","marginLeft":"0px","fontSize":"19px","color":"rgb(55, 65, 81)","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"center","fontWeight":"600","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="text-sm font-medium text-gray-700 mb-3">Distribution Chart</h4>
            <div className="w-full max-w-xs">
              <canvas ref={pieChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('VisualizationPanel component error:', error);
    return null;
  }
}
