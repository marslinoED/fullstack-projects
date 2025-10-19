import React from 'react';

const VentilationGrille = ({ count = 25, style }) => {
  return (
    <div className="position-absolute" style={style}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="d-inline-block" style={{
          width: '3px',
          height: '8px',
          backgroundColor: '#606060',
          marginRight: '2px',
          borderRadius: '1px'
        }} />
      ))}
    </div>
  );
};

export default VentilationGrille;