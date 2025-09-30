import React from 'react';
import '../Styles/Dashboard.css';


const Dashboard = () => { 
  const renderDashboard = () => (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-left">
          <h2>Welcome</h2>
          <p>Ready to catch up on today's action?</p>
        </div>
        <div className="welcome-right">
        </div>
      </div>
    </div>
  );

  return (
    <div className="prime-score-dashboard">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;