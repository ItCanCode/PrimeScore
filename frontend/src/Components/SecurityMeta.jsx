import React from 'react';
import { Helmet } from 'react-helmet-async';

const SecurityMeta = () => {
  return (
    <Helmet>
      <meta 
        httpEquiv="Content-Security-Policy" 
        content="frame-src 'self' https://www.youtube-nocookie.com https://youtube.com; media-src 'self' https://www.youtube-nocookie.com; script-src 'self' 'unsafe-inline' https://www.youtube-nocookie.com;" 
      />
      <meta 
        httpEquiv="Referrer-Policy" 
        content="strict-origin-when-cross-origin" 
      />
      <meta 
        httpEquiv="X-Frame-Options" 
        content="DENY" 
      />
      <meta 
        httpEquiv="X-Content-Type-Options" 
        content="nosniff" 
      />
    </Helmet>
  );
};

export default SecurityMeta;