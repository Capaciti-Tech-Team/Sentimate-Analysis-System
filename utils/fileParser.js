const extractPdfText = async (file) => {
  try {
    // Enhanced PDF text extraction using built-in browser APIs
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert PDF bytes to string and extract readable text
    let text = '';
    let inTextObject = false;
    let currentWord = '';
    
    for (let i = 0; i < uint8Array.length - 1; i++) {
      const char = String.fromCharCode(uint8Array[i]);
      const nextChar = String.fromCharCode(uint8Array[i + 1]);
      
      // Look for text objects in PDF structure
      if (char === 'B' && nextChar === 'T') {
        inTextObject = true;
        continue;
      }
      if (char === 'E' && nextChar === 'T') {
        inTextObject = false;
        if (currentWord.trim()) {
          text += currentWord + ' ';
          currentWord = '';
        }
        continue;
      }
      
      // Extract printable characters
      if (char.match(/[a-zA-Z0-9\s\.,!?\-\(\)\[\]'"]/)) {
        if (inTextObject) {
          currentWord += char;
        } else {
          text += char;
        }
      } else if (char === '\n' || char === '\r') {
        if (currentWord.trim()) {
          text += currentWord + ' ';
          currentWord = '';
        }
        text += ' ';
      }
    }
    
    // Clean up the extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.,!?\-\(\)\[\]'"]/g, ' ')
      .replace(/\s([.,!?])/g, '$1')
      .trim();
    
    // If we didn't get much text, try a different approach
    if (text.length < 20) {
      text = '';
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        if (byte >= 32 && byte <= 126) { // Printable ASCII
          text += String.fromCharCode(byte);
        } else if (byte === 10 || byte === 13) { // Line breaks
          text += ' ';
        }
      }
      
      text = text
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\.,!?\-\(\)]/g, ' ')
        .trim();
    }
    
    if (text.length < 10) {
      throw new Error('Unable to extract readable text from PDF. Please ensure the PDF contains text (not just images) or try converting to TXT format.');
    }
    
    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('PDF processing failed: ' + error.message);
  }
};

const parseFileContent = async (content, fileName, fileType) => {
  try {
    const timestamp = new Date().toISOString();
    const source = `file_${fileType.replace('/', '_')}`;
    
    // Split content into meaningful segments
    let segments = [];
    
    if (fileType.includes('csv') || fileName.toLowerCase().endsWith('.csv')) {
      // Parse CSV - each row as separate entry
      const lines = content.split('\n').filter(line => line.trim());
      segments = lines.map(line => line.replace(/^"(.*)"$/, '$1').trim());
    } else if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      // Parse PDF content - split by sentences and paragraphs
      const sentences = content.split(/[.!?]+/).filter(s => s.trim() && s.length > 10);
      if (sentences.length > 1) {
        segments = sentences;
      } else {
        // If no clear sentences, split by double spaces or line breaks
        const paragraphs = content.split(/\s{2,}|\n\s*\n/).filter(p => p.trim() && p.length > 10);
        segments = paragraphs.length > 0 ? paragraphs : [content];
      }
    } else {
      // Parse text content - split by paragraphs and sentences
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
      
      segments = paragraphs.flatMap(paragraph => {
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim() && s.length > 10);
        return sentences.length > 1 ? sentences : [paragraph];
      });
    }
    
    return segments
      .filter(text => text.trim() && text.length > 5) // Process all valid entries
      .map((text, index) => ({
        text: text.trim(),
        id: `file_${Date.now()}_${index}`,
        source: source,
        file_name: fileName,
        entry_index: index + 1,
        timestamp: timestamp,
        metadata: {
          original_file: fileName,
          file_type: fileType,
          segment_type: fileType.includes('csv') ? 'row' : (fileType === 'application/pdf' ? 'sentence' : 'paragraph')
        }
      }));
  } catch (error) {
    console.error('Content parsing error:', error);
    throw error;
  }
};