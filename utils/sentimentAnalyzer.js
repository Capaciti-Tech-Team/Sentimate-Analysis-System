const analyzeSentiments = async (texts) => {
  try {
    const results = [];
    
    for (const textObj of texts) {
      try {
        const result = await analyzeSingleText(textObj.text);
        results.push({
          ...textObj,
          sentiment: result.sentiment,
          confidence: result.confidence,
          keywords: extractKeywords(textObj.text, result.sentiment)
        });
      } catch (error) {
        console.error('Error analyzing text:', error);
        // Fallback analysis
        const fallbackResult = analyzeSentimentFallback(textObj.text);
        results.push({
          ...textObj,
          ...fallbackResult,
          keywords: extractKeywords(textObj.text, fallbackResult.sentiment)
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw error;
  }
};

const analyzeSingleText = async (text) => {
  try {
    // Try Hugging Face API first
    const apiResult = await analyzeWithHuggingFace(text);
    if (apiResult) {
      return {
        sentiment: mapHuggingFaceLabel(apiResult.label),
        confidence: apiResult.score,
        source: 'huggingface_api'
      };
    }
  } catch (error) {
    console.log('API unavailable, using local analysis:', error.message);
  }
  
  // Fallback to local analysis
  try {
    const localResult = analyzeSentimentFallback(text);
    return {
      ...localResult,
      source: 'local_fallback'
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return {
      sentiment: 'Neutral',
      confidence: 0.6,
      source: 'error_fallback'
    };
  }
};

const analyzeWithHuggingFace = async (text) => {
  try {
    const response = await fetch('https://proxy-api.trickle-app.host/?url=https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer hf_demo_token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: text.substring(0, 500) // Limit text length for API
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result[0] && result[0].length > 0) {
      // Get the highest confidence prediction
      const prediction = result[0].reduce((max, current) => 
        current.score > max.score ? current : max
      );
      return prediction;
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    throw error;
  }
};

const mapHuggingFaceLabel = (label) => {
  const labelMap = {
    'LABEL_0': 'Negative',
    'LABEL_1': 'Neutral', 
    'LABEL_2': 'Positive',
    'negative': 'Negative',
    'neutral': 'Neutral',
    'positive': 'Positive'
  };
  return labelMap[label] || 'Neutral';
};

const analyzeSentimentFallback = (text) => {
  // Customer review analysis - Enhanced patterns for satisfaction, praise, and approval
  const positiveWords = [
    // Satisfaction expressions
    'love', 'loves', 'loved', 'absolutely', 'amazing', 'fantastic', 'excellent', 'outstanding', 'brilliant',
    'wonderful', 'awesome', 'perfect', 'incredible', 'superb', 'magnificent', 'impressive', 'remarkable',
    
    // Praise and approval
    'great', 'good', 'best', 'better', 'satisfied', 'pleased', 'happy', 'delighted', 'thrilled',
    'recommend', 'recommended', 'worth', 'valuable', 'helpful', 'useful', 'effective', 'efficient',
    
    // Quality and experience
    'intuitive', 'easy', 'simple', 'clean', 'modern', 'user-friendly', 'smooth', 'fast', 'reliable',
    'works', 'working', 'solved', 'saves', 'saved', 'impressed', 'definitely', 'super'
  ];
  
  const negativeWords = [
    // Dissatisfaction expressions  
    'hate', 'hates', 'hated', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'pathetic',
    'useless', 'worthless', 'disgusting', 'disappointing', 'disappointed', 'frustrated', 'frustrating',
    
    // Complaints and disapproval
    'crashes', 'buggy', 'slow', 'broken', 'fails', 'failed', 'problem', 'problems', 'issue', 'issues',
    'waste', 'regret', 'never', 'unreliable', 'annoying', 'irritating', 'confusing', 'complicated',
    
    // Negative experiences
    'doesnt work', 'not working', 'constantly', 'never responds', 'complete waste'
  ];
  
  // Neutral/balanced indicators
  const neutralWords = [
    'okay', 'ok', 'average', 'decent', 'fine', 'acceptable', 'standard', 'normal', 'typical',
    'nothing', 'some', 'few', 'maybe', 'might', 'could', 'should', 'compared', 'similar'
  ];
  
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/).filter(w => w.length > 2);
  
  // Advanced pattern matching for customer reviews
  const positivePatterns = [
    /absolutely\s+love/i, /love\s+this/i, /i\s+love/i, /really\s+love/i,
    /great\s+customer\s+support/i, /excellent\s+value/i, /worth\s+it/i, /definitely\s+recommend/i,
    /super\s+intuitive/i, /makes.*easier/i, /saved\s+me/i, /solved.*in/i, /i'm\s+impressed/i,
    /clean.*modern/i, /user.friendly/i, /works\s+perfectly/i, /definitely\s+worth/i
  ];
  
  const negativePatterns = [
    /crashes\s+constantly/i, /terrible\s+experience/i, /complete\s+waste/i, /regret\s+paying/i,
    /never\s+responds/i, /doesn't\s+work/i, /not\s+worth/i, /slow.*buggy/i,
    /waste\s+of\s+money/i, /features\s+don't\s+work/i, /can't\s+get\s+anything\s+done/i
  ];
  
  const neutralPatterns = [
    /okay.*not\s+great/i, /not\s+terrible\s+either/i, /can't\s+really\s+judge/i, /does\s+what\s+it\s+says/i,
    /nothing\s+more/i, /average\s+compared/i, /some.*work.*others\s+need/i, /few\s+times/i
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  // Pattern matching (high weight)
  positivePatterns.forEach(pattern => {
    if (pattern.test(text)) positiveScore += 3;
  });
  
  negativePatterns.forEach(pattern => {
    if (pattern.test(text)) negativeScore += 3;
  });
  
  neutralPatterns.forEach(pattern => {
    if (pattern.test(text)) neutralScore += 3;
  });
  
  // Word-based scoring
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveScore += 1;
    } else if (negativeWords.includes(word)) {
      negativeScore += 1;
    } else if (neutralWords.includes(word)) {
      neutralScore += 1;
    }
  });
  
  // Strict three-category classification
  let sentiment = 'Neutral';
  let confidence = 0.65;
  
  if (positiveScore > negativeScore && positiveScore > neutralScore) {
    sentiment = 'Positive';
    confidence = Math.min(0.95, 0.75 + (positiveScore * 0.05));
  } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
    sentiment = 'Negative';  
    confidence = Math.min(0.95, 0.75 + (negativeScore * 0.05));
  } else if (neutralScore > 0 || (positiveScore === 0 && negativeScore === 0)) {
    sentiment = 'Neutral';
    confidence = Math.min(0.85, 0.65 + (neutralScore * 0.03));
  } else if (Math.abs(positiveScore - negativeScore) <= 1) {
    // Very close scores - classify as neutral for balanced reviews
    sentiment = 'Neutral';
    confidence = 0.70;
  }
  
  return { sentiment, confidence };
};
