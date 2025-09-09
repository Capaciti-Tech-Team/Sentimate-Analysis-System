function ApiStatus({ apiStatus, onRefresh }) {
  try {
    const getStatusColor = (status) => {
      switch (status) {
        case 'online': return 'text-green-300 bg-green-500/20';
        case 'limited': return 'text-yellow-300 bg-yellow-500/20';
        case 'offline': return 'text-red-300 bg-red-500/20';
        default: return 'text-gray-300 bg-gray-500/20';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'online': return 'icon-check-circle';
        case 'limited': return 'icon-alert-triangle';
        case 'offline': return 'icon-x-circle';
        default: return 'icon-loader';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'online': return 'API Online';
        case 'limited': return 'API Limited';
        case 'offline': return 'Offline Mode';
        default: return 'Checking...';
      }
    };

    return (
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/20 ${getStatusColor(apiStatus.status)}`} style={{"paddingTop":"8px","paddingRight":"12px","paddingBottom":"8px","paddingLeft":"12px","marginTop":"0px","marginRight":"0px","marginBottom":"0px","marginLeft":"0px","fontSize":"16px","color":"#5a54a0","backgroundColor":"#c1dce2","textAlign":"start","fontWeight":"400","objectFit":"fill","display":"flex","position":"static","top":"auto","left":"auto","right":"auto","bottom":"auto"}} className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-yellow-300 bg-yellow-500/20">
          <div className={`${getStatusIcon(apiStatus.status)} text-lg ${apiStatus.status === 'checking' ? 'animate-spin' : ''}`}></div>
          <div className="text-sm">
            <div className="font-medium">{getStatusText(apiStatus.status)}</div>
            <div className="text-xs opacity-80">{apiStatus.provider}</div>
          </div>
          <button
            onClick={onRefresh}
            className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
            title="Refresh API Status"
          >
            <div className="icon-refresh-cw text-sm"></div>
          </button>
        </div>
        
        {apiStatus.status === 'online' && (
          <div className="text-xs text-white/60 space-y-1">
            <div>Model: {apiStatus.model.split('/').pop()}</div>
            {apiStatus.responseTime && (
              <div>Response: {apiStatus.responseTime}ms</div>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ApiStatus component error:', error);
    return null;
  }
}