import "../Styles/Loading.css"

import React from 'react';


function Loading() {
  return (
    <div className="loading-screen">
      <div className="loader-circle"></div>
      <div className="loading-text">Loading …</div>
      <div className="dots">
        <div className="dot blue"></div>
        <div className="dot purple"></div>
        <div className="dot indigo"></div>
      </div>
    </div>
  );
}

export default Loading;
