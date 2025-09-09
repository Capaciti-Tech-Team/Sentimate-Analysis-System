function Header({ apiStatus, onRefreshApi }) {
  try {
    return (
      <header className="glass-effect shadow-2xl border-b border-white/20" data-name="header" data-file="components/Header.js">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center floating-animation" 
                   style={{background: 'var(--gradient-success)'}}>
                <div className="icon-brain-circuit text-2xl text-white"></div>
              </div>
              <div>
                <h1 style={{"paddingTop":"0px","paddingRight":"0px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"4px","marginLeft":"0px","fontSize":"36px","color":"#1c175e","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"start","fontWeight":"700","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="text-4xl font-bold text-white mb-1">Sentiment Analysis System</h1>
                <p style={{"paddingTop":"0px","paddingRight":"2px","paddingBottom":"0px","paddingLeft":"0px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","fontSize":"18px","color":"#131131","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"start","fontWeight":"700","objectFit":"fill","display":"block","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="text-lg text-blue-200 font-medium">Text Tone Analyzer</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <ApiStatus apiStatus={apiStatus} onRefresh={onRefreshApi} />
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}
