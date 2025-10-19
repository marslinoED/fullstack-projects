import React from 'react';
import TextType from '../ReactBits/TextType/TextType';
import { useGame } from '../../../Context/GameContext';

const LoadingTerminal = () => {
  const {
    onLoadingComplete,
    state
  } = useGame();
  const speed = 5;
  return (
    <div className="position-relative" style={{ zIndex: 2 }}>
      <div className="mb-2">
        <TextType
          className="mt-1"
          style={{ color: '#ffff00' }}
          useShinyEffect={false}
          textColors={[{ color: '#ffff00' }]}
          text="> boot Terminal-Soul SYSTEM v0.1.0"
          textSize='1rem'
          typingSpeed={speed}
          initialDelay={0}
          loop={false}
          showCursor={false}
        />
        <br />
        <TextType
          className="mt-1"
          style={{ color: '#888888' }}
          useShinyEffect={false}
          textColors={[{ color: '#888888' }]}
          text="LOADING Terminal-Soul OS..."
          textSize='1rem'
          typingSpeed={speed}
          initialDelay={speed * 35}
          loop={false}
          showCursor={false}
        />
        <br />
        <TextType
          className="mt-1"
          style={{ color: '#888888' }}
          useShinyEffect={false}
          textColors={[{ color: '#888888' }]}
          text="Loading kernel modules:"
          textSize='1rem'
          typingSpeed={speed}
          initialDelay={speed * 70}
          loop={false}
          showCursor={false}
        />
        <br />
        <TextType
          className="mt-1"
          useShinyEffect={false}
          textColors={[{ color: '#888888' }]}
          text="  MEMORY.SYS ........ [OK]"
          textSize='1rem'
          typingSpeed={speed}
          initialDelay={speed * 100}
          loop={false}
          showCursor={false}
        />
        <br />
        <TextType
          className="mt-1"
          useShinyEffect={false}
          textColors={[{ color: '#888888' }]}
          text="  KEYBOARD.SYS ...... [OK]"
          textSize='1rem'
          typingSpeed={speed}
          initialDelay={speed * 135}
          loop={false}
          showCursor={false}
        />
        <br />
        <TextType
          className="mt-1"
          useShinyEffect={false}
          textColors={[{ color: '#888888' }]}
          text="  DISPLAY.SYS ....... [OK]"
          textSize='1rem'
          typingSpeed={speed}
          initialDelay={speed * 170}
          loop={false}
          showCursor={false}
        />
        <br />
        <TextType
          className="mt-1"
          style={{ color: state.chaptersData[0].isUserWin ? '#00ff00' : '#ff0000ff' }}
          useShinyEffect={false}
          textColors={[{ color: state.chaptersData[0].isUserWin ? '#00ff00' : '#ff0000ff' }]}
          text={state.chaptersData[0].isUserWin ? "  NETWORK.SYS ....... [OK]" :
            "  NETWORK.SYS ....... [Error]"}
          textSize='1rem'
          typingSpeed={speed}
          initialDelay={speed * 200}
          loop={false}
          showCursor={false}
        />
        <br />
        <TextType
          className="mt-1"
          style={{ color: '#00aaaa' }}
          useShinyEffect={false}
          textColors={[{ color: '#00aaaa' }]}
          text="════════════════════════════════════════════════════"
          textSize='1rem'
          typingSpeed={Math.floor(speed)}
          initialDelay={speed * 240}
          loop={false}
          showCursor={false}
          onComplete={onLoadingComplete}
          pauseDuration={2000}
        />
      </div>
    </div>
  );
};

export default LoadingTerminal;