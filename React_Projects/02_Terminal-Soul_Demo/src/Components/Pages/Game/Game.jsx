import VentilationGrille from '../../Shared/Hardware/VentilationGrille';
import MonitorLabels from '../../Shared/Hardware/MonitorLabels';
import PowerLED from '../../Shared/Hardware/PowerLED';
import TerminalScreen from '../../Shared/Terminal/TerminalScreen';
import ControlPanel from '../../Shared/Hardware/ControlPanel';
import MonitorStand from '../../Shared/Hardware/MonitorStand';
import GameMenuPopup from '../../Shared/GameMenuPopup/GameMenuPopup';
import CinematicTransition from '../../Shared/CinematicTransition/CinematicTransition';
import { useGame } from '../../../Context/GameContext';

export default function Game() {
  const {
    state,
    showMenuPopup,
    hasExistingGame,
    handleNewGame,
    handleContinueGame,
    handleChapterSelect,
    isTransitioning,
    transitionStep,
    transitionMessage
  } = useGame();

  return (
    <div className='Game-Content'>
      {/* Game Menu Popup */}
      <GameMenuPopup
        isVisible={showMenuPopup}
        onNewGame={handleNewGame}
        onContinue={handleContinueGame}
        onChapterSelect={handleChapterSelect}
        hasExistingGame={hasExistingGame}
        gameState={state}
      />

      {/* Cinematic Transition */}
      <CinematicTransition
        isVisible={isTransitioning}
        transitionStep={transitionStep}
        transitionMessage={transitionMessage}
      />

      {/* Retro Computer System */}
      <div
        className="position-relative shadow-lg"
        style={{
          width: '900px',
          height: '680px',
          maxWidth: '90vw',
          maxHeight: '85vh',
          backgroundColor: '#9a9a9a',
          borderRadius: '12px',
          border: '12px solid #707070',
          boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,0,0,0.3)',
          opacity: isTransitioning && (transitionStep === 1 || transitionStep === 4) ? 0.3 : 1,
          transition: 'opacity 1s ease-out'
        }}
      >
        {/* Top Ventilation Grilles */}
        <VentilationGrille
          count={25}
          style={{ top: '5px', left: '20px', right: '20px', height: '8px' }}
        />

        {/* Monitor Labels */}
        <MonitorLabels
          modelName="Terminal-Soul-2000"
          serialNumber="S/N: NX2K-8503-7421"
        />

        {/* Power LED */}
        <PowerLED state={state.pwr} />

        {/* Terminal Screen */}
        <TerminalScreen />

        {/* Control Panel */}
        <ControlPanel />

        {/* Monitor Stand */}
        <MonitorStand logoText="Soul" />
      </div>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .Game-Content {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .Game-Content input {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
