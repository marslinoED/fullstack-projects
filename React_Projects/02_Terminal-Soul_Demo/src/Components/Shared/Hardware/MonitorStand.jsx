import React from 'react';

const MonitorStand = ({ logoText = "Soul" }) => {
  return (
    <>
      {/* Monitor Stand */}
      <div
        className="position-absolute"
        style={{
          bottom: '-35px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140px',
          height: '35px',
          backgroundColor: '#808080',
          borderRadius: '4px',
          border: '2px solid #606060',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
      />

      {/* Stand Logo */}
      <div
        className="position-absolute"
        style={{
          bottom: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: '#505050',
          fontWeight: 'bold'
        }}
      >
        {logoText}
      </div>
    </>
  );
};

export default MonitorStand;