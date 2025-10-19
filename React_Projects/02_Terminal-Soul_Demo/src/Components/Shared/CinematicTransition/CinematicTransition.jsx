import React from 'react';
import './CinematicTransition.css';
import { useGame } from '../../../Context/GameContext';

const CinematicTransition = ({ isVisible, transitionStep, transitionMessage }) => {
    const { state } = useGame(); // Ensure context is used if needed in future
    if (!isVisible) return null;

    const renderStep = () => {
        switch (transitionStep) {
            case 1: // Power off - fade to black
                return (
                    <div className="transition-overlay power-off">
                        <div className="fade-to-black"></div>
                    </div>
                );

            case 2: // Show "Terminal Soul" title
                return (
                    <div className="transition-overlay title-screen">
                        <div className="game-title">
                            <h1 className="main-title">TERMINAL SOUL</h1>
                            <div className="title-subtitle">A Digital Mystery</div>
                        </div>
                    </div>
                );

            case 3: // Show "Chapter 1"
                return (
                    <div className="transition-overlay chapter-screen">
                        <div className="chapter-title">
                            <h2 className="chapter-number">CHAPTER {state.chapter + 1}</h2>
                            <div className="chapter-name">{state.chaptersData[state.chapter]?.title}</div>
                        </div>
                    </div>
                );

            case 4: // Power on - fade from black
                return (
                    <div className="transition-overlay power-on">
                        <div className="fade-from-black"></div>
                    </div>
                );

            case 5: // After N days...
                return (
                    <div className="transition-overlay chapter-screen">
                        <div className="time-skip-title">
                            <h2 className="time-skip-text">{transitionMessage || "3 Days Later"}</h2>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="cinematic-container">
            {renderStep()}
        </div>
    );
};

export default CinematicTransition;