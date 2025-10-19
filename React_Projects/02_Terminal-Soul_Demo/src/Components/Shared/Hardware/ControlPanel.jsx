import React from 'react';

const ControlPanel = () => {
  const ControlKnob = ({ label, position }) => (
    <div className="d-flex align-items-center">
      <span style={{ fontSize: '9px', color: '#404040', marginRight: '5px' }}>{label}</span>
      <div style={{ width: '40px', height: '3px', backgroundColor: '#606060', borderRadius: '2px', position: 'relative' }}>
        <div style={{ 
          width: '12px', 
          height: '8px', 
          backgroundColor: '#505050', 
          borderRadius: '1px', 
          position: 'absolute', 
          top: '-2.5px', 
          left: `${position}px` 
        }} />
      </div>
    </div>
  );

  return (
    <div
      className="position-absolute"
      style={{
        bottom: '40px',
        left: '30px',
        right: '30px',
        height: '35px',
        backgroundColor: '#808080',
        borderRadius: '4px',
        border: '2px solid #606060',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 15px'
      }}
    >
      <ControlKnob label="VOL" position={15} />
      <ControlKnob label="BRIGHT" position={20} />
      <ControlKnob label="CONT" position={18} />
    </div>
  );
};

export default ControlPanel;