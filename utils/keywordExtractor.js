const extractKeywords = (text, sentiment) => {
  try {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were',
      'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'in', 'on', 'at', 'by', 'for',
      'with', 'without', 'through', 'during', 'before', 'after', 'above', 'below', 'up',
      'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ]);
    
    const sentimentWords = getSentimentWords(sentiment);
    
    // Filter and count word frequency
    const wordCount = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Prioritize sentiment-relevant words
    const scoredWords = Object.entries(wordCount).map(([word, count]) => {
      let score = count;
      if (sentimentWords.includes(word)) {
        score += 3; // Boost sentiment-relevant words
      }
      return { word, score };
    });
    
    // Sort by score and return top keywords
    return scoredWords
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.word);
      
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return ['text', 'analysis'];
  }
};

const getSentimentWords = (sentiment) => {
  const sentimentLexicon = {
    positive: [
      // Customer satisfaction expressions
      'love', 'loves', 'loved', 'absolutely', 'amazing', 'fantastic', 'excellent', 'great', 'wonderful',
      'awesome', 'perfect', 'brilliant', 'outstanding', 'superb', 'impressed', 'recommend', 'satisfied',
      // Experience and quality
      'intuitive', 'easy', 'helpful', 'useful', 'effective', 'works', 'solved', 'saves', 'worth',
      'clean', 'modern', 'reliable', 'smooth', 'fast', 'definitely', 'super', 'value'
    ],
    negative: [
      // Customer dissatisfaction expressions  
      'hate', 'hates', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'useless',
      'disappointing', 'disappointed', 'frustrated', 'regret', 'waste', 'crashes', 'broken',
      // Problems and issues
      'slow', 'buggy', 'unreliable', 'failed', 'problem', 'problems', 'issue', 'issues',
      'never', 'constantly', 'annoying', 'confusing', 'complicated', 'doesnt', 'work'
    ],
    neutral: [
      // Balanced and factual expressions
      'okay', 'average', 'decent', 'fine', 'standard', 'normal', 'typical', 'compared',
      'similar', 'some', 'few', 'nothing', 'does', 'says', 'might', 'could', 'should'
    ]
  };
  
  return sentimentLexicon[sentiment.toLowerCase()] || [];
};

