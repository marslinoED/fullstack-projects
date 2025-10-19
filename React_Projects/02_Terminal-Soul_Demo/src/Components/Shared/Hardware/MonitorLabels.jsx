import React from 'react';

const MonitorLabels = ({ modelName, serialNumber }) => {
  return (
    <>
      {/* Model Label */}
      <div
        className="position-absolute"
        style={{
          top: '20px',
          left: '20px',
          fontSize: '11px',
          color: '#404040',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold'
        }}
      >
        {modelName}
      </div>

      {/* Serial Number */}
      <div
        className="position-absolute"
        style={{
          top: '35px',
          left: '20px',
          fontSize: '9px',
          color: '#505050',
          fontFamily: 'monospace'
        }}
      >
        {serialNumber}
      </div>
    </>
  );
};

export default MonitorLabels;