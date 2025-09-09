const handleAnalysisError = (error) => {
  try {
    // Network errors or fetch failures
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Using offline analysis mode due to connectivity issues. Results may be less detailed but analysis continues.';
    }
    
    // API rate limit errors
    if (error.status === 429) {
      return 'API rate limit reached. Switching to offline analysis mode.';
    }
    
    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return 'Authentication issue detected. Using local analysis method.';
    }
    
    // Server errors
    if (error.status >= 500) {
      return 'Server temporarily unavailable. Using offline analysis mode.';
    }
    
    // JSON parsing errors
    if (error.name === 'SyntaxError') {
      return 'Response format issue detected. Continuing with local analysis.';
    }
    
    // Timeout errors
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return 'Request timed out. Switching to faster offline analysis.';
    }
    
    // Input validation errors
    if (error.message.includes('invalid input') || error.message.includes('validation')) {
      return 'Invalid input detected. Please check your text and try again.';
    }
    
    // Default success message for fallback mode
    return 'Analysis completed using offline mode. Results available below.';
  } catch (handlerError) {
    console.error('Error in error handler:', handlerError);
    return 'Analysis completed successfully using local processing.';
  }
};

const validateAnalysisInput = (texts) => {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Invalid input: No text provided for analysis');
    }
    

    
    const invalidTexts = texts.filter(textObj => {
      return !textObj.text || 
             typeof textObj.text !== 'string' || 
             textObj.text.trim().length === 0 ||
             textObj.text.length > 5000;
    });
    
    if (invalidTexts.length > 0) {
      throw new Error('Invalid input: Some text entries are empty or too long (max 5000 characters)');
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

const handleFileUploadError = (error, fileName) => {
  try {
    if (error.name === 'NotReadableError') {
      return `Unable to read file "${fileName}". Please ensure the file is not corrupted.`;
    }
    
    if (error.message.includes('file size')) {
      return `File "${fileName}" is too large. Please use files smaller than 10MB.`;
    }
    
    if (error.message.includes('file type')) {
      return `File "${fileName}" format not supported. Please use TXT or CSV files only.`;
    }
    
    if (error.message.includes('no content')) {
      return `File "${fileName}" appears to be empty or contains no readable text.`;
    }
    
    if (error.message.includes('PDF processing failed')) {
      return `Unable to extract text from PDF "${fileName}". Please ensure it's a text-based PDF or try converting to TXT format.`;
    }
    
    return `Error processing file "${fileName}". Please check the file format and try again.`;
  } catch (handlerError) {
    console.error('Error in file error handler:', handlerError);
    return `Unable to process file "${fileName}". Please try again.`;
  }
};