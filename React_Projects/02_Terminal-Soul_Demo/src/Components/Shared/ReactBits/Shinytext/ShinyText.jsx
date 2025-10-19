import './ShinyText.css';

const ShinyText = ({ text, disabled = false, speed = 5, className = '', style = { fontSize: '2rem' } }) => {
  const animationDuration = `${speed}s`;

  return (
    <div className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`} style={{ animationDuration }}>
      <span style={style}>
        {text}
      </span>
    </div>
  );
};

export default ShinyText;
