import React from 'react';
import { useGame } from '../../../Context/GameContext';

const PowerLED = ({ state, transitionRunning }) => {
  const { triggerScreenClose } = useGame();
  
  const handleClick = () => {
    if (!transitionRunning) {
      triggerScreenClose();
    }
  };

  return (
    <div 
      onClick={handleClick}
      style={{ 
        cursor: !transitionRunning ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      <div
        className="position-absolute"
        style={{
          top: '25px',
          right: '30px',
          width: '8px',
          height: '8px',
          backgroundColor: state ? '#00ff00' : '#ff0000',
          borderRadius: '50%',
          boxShadow: state ? '0 0 6px #00ff00' : '0 0 6px #ff0000',
          animation: 'pulse 2s infinite'
        }}
      />
      <div
        className="position-absolute"
        style={{
          top: '35px',
          right: '22px',
          fontSize: '8px',
          color: '#505050'
        }}
      >
        PWR
      </div>
    </div>
  );
};

export default PowerLED;