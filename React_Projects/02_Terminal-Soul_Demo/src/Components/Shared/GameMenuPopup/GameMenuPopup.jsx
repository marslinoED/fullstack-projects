import React, { useState } from 'react';
import './GameMenuPopup.css';

const GameMenuPopup = ({ isVisible, onNewGame, onContinue, onChapterSelect, hasExistingGame, gameState }) => {
    const [showChapterSelect, setShowChapterSelect] = useState(false);

    if (!isVisible) return null;

    // Get available chapters based on completion
    const getAvailableChapters = () => {
        if (!gameState || !gameState.chaptersData) return [0];

        const chapters = [];
        const chaptersData = gameState.chaptersData;

        // Always include chapter 0
        chapters.push(0);

        // Add subsequent chapters if previous ones are completed
        for (let i = 0; i < 10; i++) { // Assuming max 10 chapters
            if (chaptersData[i] && chaptersData[i].isCompleted) {
                if (!chapters.includes(i + 1)) {
                    chapters.push(i + 1);
                }
            }
        }

        return chapters;
    };

    const availableChapters = getAvailableChapters();

    const handleChapterSelection = (chapterNumber) => {
        onChapterSelect(chapterNumber);
        setShowChapterSelect(false);
    };

    const handleBackToMain = () => {
        setShowChapterSelect(false);
    };

    // Chapter selection view
    if (showChapterSelect) {
        return (
            <div className="game-menu-overlay">
                <div className="game-menu-popup">
                    <div className="game-menu-header">
                        <h2 className="retro-title">CHAPTER SELECTION</h2>
                        <div className="retro-subtitle">Choose Your Adventure</div>
                    </div>

                    <div className="game-menu-content">
                        <div className="menu-message">
                            <p>Select which chapter to begin your journey from.</p>
                        </div>

                        <div className="chapter-buttons">
                            {availableChapters.map(chapterNum => {
                                const chapterData = gameState?.chaptersData?.[chapterNum];
                                const isCompleted = chapterData?.isCompleted || false;

                                return (
                                    <button
                                        key={chapterNum}
                                        className={`retro-button ${isCompleted ? 'completed-chapter-btn' : 'available-chapter-btn'}`}
                                        onClick={() => handleChapterSelection(chapterNum)}
                                    >
                                        <span className="button-text">Chapter {chapterNum}</span>
                                        <span className="button-subtitle">
                                            {chapterData?.title || "The Beginning"}
                                        </span>
                                        <span className="button-status">
                                            {isCompleted ? "Completed" : ""}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className="retro-button back-btn"
                            onClick={handleBackToMain}
                        >
                            <span className="button-text">← Back to Main Menu</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main menu view
    return (
        <div className="game-menu-overlay">
            <div className="game-menu-popup">
                <div className="game-menu-header">
                    <h2 className="retro-title">TERMINAL SOUL</h2>
                </div>

                <div className="game-menu-content">

                    <div className="menu-buttons">
                        <button
                            className="retro-button new-game-btn"
                            onClick={onNewGame}
                        >
                            <span className="button-text">New Adventure</span>
                            <span className="button-subtitle">Start from the beginning</span>
                        </button>

                        {hasExistingGame && (
                            <button
                                className="retro-button continue-btn"
                                onClick={onContinue}
                            >
                                <span className="button-text">Continue Journey</span>
                                <span className="button-subtitle">Resume where you left off</span>
                            </button>
                        )}

                        <button
                            className="retro-button chapter-select-btn"
                            onClick={() => setShowChapterSelect(true)}
                        >
                            <span className="button-text">Chapter Selection</span>
                            <span className="button-subtitle">Choose your starting point</span>
                        </button>
                    </div>
                </div>

                <div className="game-menu-footer">
                    <div className="system-info">
                        <div>Ready to Begin</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameMenuPopup;