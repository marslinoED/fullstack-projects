import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGuessingGame } from './GuessingGameContext';

// Create the context
const GameContext = createContext();

// Custom hook to use the context
export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

// Game Provider component
export const GameProvider = ({ children }) => {
    const { handleGuessingGameCommand } = useGuessingGame();

    // Terminal UI states
    const [hideContent, setHideContent] = useState(true);
    const [hideLoadingTerminal, setHideLoadingTerminal] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [root, setRoot] = useState('C:\\>');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [tip, setTip] = useState('Tip: Type help to see available apps\n');
    const [loadingComplete, setLoadingComplete] = useState(true);

    // Menu popup states
    const [showMenuPopup, setShowMenuPopup] = useState(false);
    const [hasExistingGame, setHasExistingGame] = useState(false);

    // Cinematic transition states
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionStep, setTransitionStep] = useState(0); // 0: normal, 1: power off, 2: title, 3: chapter, 4: power on, 5: time skip
    const [transitionMessage, setTransitionMessage] = useState(''); // For custom messages like "3 Days Later"

    // Screen closer states
    const [transitionRunning, setTransitionRunning] = useState(false);
    const [poweringTransitionStep, setPoweringTransitionStep] = useState(0);

    const DefaultState = {
        chapter: 0,
        pwr: false,
        chaptersData: {
            0: {
                title: "The Beginning",
                isUserWin: false,
                date: "February 5, 1952",
                smartNews: {
                    1: {
                        title: 'Cairo Fire',
                        content: `Within just a few hours, flames devoured nearly 700 shops across downtown Cairo. The fire left countless dead and injured. Officials claim it was caused by an electrical fault from a worker who vanished abroad only minutes after the incident.`
                    },

                    2: {
                        title: 'Simulation Experiment',
                        content: `MataNet has unveiled its latest project in consciousness simulation — a revolutionary process that transfers human awareness into a digital entity. The company warns the public that the technology remains experimental and may involve unpredictable risks.`
                    },

                    3: {
                        title: 'Dr. R.H.N Abduction',
                        content: `Amid the chaos of today's fire, reports confirmed the disappearance of Dr. R.H.N — the scientist behind one of the century’s most significant discoveries. Authorities remain silent, and no official statements have been released regarding his fate.`
                    }
                },
                apps: ['update','smartNews', 'guessingGame', 'calender', 'manual'],
                isCompleted: false
            },
            1: {
                title: "The Mystery Deepens",
                isUserWin: true,
                date: "February 8, 1952",
                smartNews: {
                    1: { title: 'NAN', content: 'NAN' },
                    2: { title: 'NAN', content: 'NAN' },
                    3: { title: 'NAN', content: 'NAN' },
                },
                apps: ['update', 'smartNews', 'guessingGame', 'calender', 'manual'],
                isCompleted: false
            },
        }
    };
    // Main game state
    const [state, setState] = useState({
        chapter: 0,
        pwr: true,
        chaptersData: {
            0: DefaultState.chaptersData[0]
        }
    });

    const [hasLoaded, setHasLoaded] = useState(false);

    // Check for existing game state and show menu popup
    useEffect(() => {
        const checkExistingGame = () => {
            try {
                const saved = localStorage.getItem('gameState');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && typeof parsed === 'object') {
                        setHasExistingGame(true);
                        setShowMenuPopup(true);
                        return parsed;
                    }
                }
                setHasExistingGame(false);
                setShowMenuPopup(true);
                return null;
            } catch (err) {
                console.error('Failed to check saved state:', err);
                setHasExistingGame(false);
                setShowMenuPopup(true);
                return null;
            }
        };

        const savedState = checkExistingGame();
        if (savedState) {
            setState(prev => ({ ...prev, ...savedState }));
        }
        setHasLoaded(true);
    }, []);

    // Handle menu popup actions
    const handleNewGame = useCallback(() => {
        // Clear localStorage
        localStorage.removeItem('gameState');
        localStorage.removeItem('guessingGameState');

        // Reset to initial state
        setState({
            chapter: 0,
            pwr: true,
            chaptersData: {
                0: DefaultState.chaptersData[0]
            }
        });

        // Reset terminal states
        setHistory([]);
        setUserInput('');
        setRoot('C:\\>');
        setHistoryIndex(-1);

        // Close popup and start fresh
        setShowMenuPopup(false);
        setHideContent(true);
        setHideLoadingTerminal(false);
        setLoadingComplete(true);
    }, [DefaultState.chaptersData]);

    const handleContinueGame = useCallback(() => {
        // Just close the popup and continue with loaded state
        setShowMenuPopup(false);
        setHideContent(true);
        setHideLoadingTerminal(false);
        setLoadingComplete(true);
    }, []);

    const handleChapterSelect = useCallback((chapterNumber) => {
        // Set the selected chapter and include all chapters from 0 to selected chapter
        setState(prev => {
            const updatedChaptersData = {};

            // Copy all chapters from 0 to the selected chapter from DefaultState
            for (let i = 0; i <= chapterNumber; i++) {
                if (DefaultState.chaptersData[i]) {
                    updatedChaptersData[i] = { ...DefaultState.chaptersData[i] };
                }
            }

            return {
                ...prev,
                chapter: chapterNumber,
                chaptersData: updatedChaptersData
            };
        });

        // Reset terminal states for new chapter
        setHistory([]);
        setUserInput('');
        setRoot('C:\\>');
        setHistoryIndex(-1);

        // Close popup and start
        setShowMenuPopup(false);
        setHideContent(true);
        setHideLoadingTerminal(false);
        setLoadingComplete(true);
    }, [DefaultState.chaptersData]);

    // Cinematic transition when completing chapter 0
    const startChapterTransition = useCallback((nextChapter, timeSkipMessage = "3 Days Later") => {
        setIsTransitioning(true);
        setTransitionStep(1); // Start with power off
        setTransitionMessage(timeSkipMessage); // Set the custom message

        setHistory([]);
        setUserInput('');
        setRoot('C:\\>');
        setHistoryIndex(-1);
        setHideContent(true);
        setHideLoadingTerminal(false);
        setLoadingComplete(true);

        // Power off animation
        setTimeout(() => {
            setTransitionStep(2); // Show title
        }, 1500);

        // Show "Terminal Soul"
        setTimeout(() => {
            setTransitionStep(3); // Show chapter
        }, 4000);

        // After N days...
        setTimeout(() => {
            setTransitionStep(5); // Show time skip message
        }, 7000);

        // Show "Chapter X"
        setTimeout(() => {
            setTransitionStep(4); // Power on
        }, 10000);

        // Power on and continue
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                chapter: nextChapter,
                pwr: false,
                chaptersData: {
                    ...prev.chaptersData,
                    [nextChapter]: DefaultState.chaptersData[nextChapter]
                }
            }));
            setTransitionStep(0);
            setIsTransitioning(false);
        }, 10000);
    }, [DefaultState.chaptersData]);

    // Screen closer functions
    const triggerScreenClose = useCallback(() => {
        // Prevent multiple concurrent calls
        if (transitionRunning) return;
        
        setTransitionRunning(true);
        if (!state.pwr) {
            // If screen is closed, open it with animation
            setState(prev => ({ ...prev, pwr: true }));
            setHistory([]);
            setUserInput('');
            setRoot('C:\\>');
            setHistoryIndex(-1);

            setTimeout(() => {
                setPoweringTransitionStep(5);
            }, 0);
            setTimeout(() => {
                setPoweringTransitionStep(4);
            }, 500);
            setTimeout(() => {
                setPoweringTransitionStep(0);
            }, 1000);
            setHideLoadingTerminal(false);
            setLoadingComplete(true);
            setHideContent(true);
        } else {
            // If screen is open, close it with animation
            setState(
                prev => ({ ...prev, pwr: false })
            );
            setHistory([]);
            setUserInput('');
            setRoot('C:\\>');
            setHistoryIndex(-1);

            setTimeout(() => {
                setPoweringTransitionStep(4);
            }, 0);
            setTimeout(() => {
                setPoweringTransitionStep(2);
            }, 500);
            setTimeout(() => {
                setPoweringTransitionStep(3);
            }, 1000);
            setHideLoadingTerminal(false);
            setLoadingComplete(true);
        }
        setTimeout(() => {
            setTransitionRunning(false);
        }, 1500); // Increased timeout to prevent rapid clicks
    }, [state, transitionRunning]);

    // Save state only after loaded
    useEffect(() => {
        if (hasLoaded) {
            localStorage.setItem('gameState', JSON.stringify(state));
        }
    }, [state, hasLoaded]);

    // Current chapter reference for easier access
    const currentChapter = state.chaptersData[state.chapter];

    // Commands logic
    const getCommands = useCallback(() => ({
        help: {
            output: `Available apps:\n${currentChapter.apps.map(a => `  - ${a}`).join('\n')}`,
            flag: 'Tip: Type [app name] to open an app\n'
        },
        manual: {
            output: `Available commands:\n  - help: Show available apps\n  - clear: Clear the terminal\n  - cat: show file contents\n`,
            flag: ''
        },
        smartNews: {
            output: `Latest News Headlines:\n${Object.entries(currentChapter.smartNews)
                .map(([id, article]) => `    ${id}. ${article.title}`)
                .join('\n')}\n`,
            flag: `                                                         
 _____               _   _____               
|   __|_____ ___ ___| |_|   | |___ _ _ _ ___ 
|__   |     | .'|  _|  _| | | | -_| | | |_ -|
|_____|_|_|_|__,|_| |_| |_|___|___|_____|___|
Tip: Type "cat smartNews\\<article_number>" to read more.\n `
        },
        update: {
            output: `updating system...\n
Error 504 — Gateway Timeout\n `,
            flag: 'Tip: You need to import Internet module to update\n '
        },
        calender: {
            output: `Today's Date: ${currentChapter.date}\n `,
            flag: ''
        },
        cat: {
            output: `cat <filename> to print file contents`,
            flag: ''
        }
    }), [currentChapter]);

    // Command handler
    const handleCommand = useCallback((command) => {
        const Commands = getCommands();
        // Handle Guessing Game app logic
        if (root === '] guessingGame>' || command === 'guessingGame') {
            if (command === 'guessingGame') setRoot('] guessingGame>');
            if (command === 'exit') setRoot('C:\\>');

            const result = handleGuessingGameCommand(command, state.chaptersData[state.chapter]?.isUserWin);

            if (result?.state === "Win" && !state.chaptersData[state.chapter]?.isUserWin) {
                setState(prev => {
                    const updated = { ...prev };
                    updated.chaptersData[prev.chapter].isUserWin = true;
                    // Mark current chapter as completed and unlock next chapter
                    updated.chaptersData[prev.chapter].isCompleted = true;

                    // If completing chapter 0, trigger cinematic transition
                    if (prev.chapter === 0) {
                        // Start the cinematic sequence with custom message
                        setTimeout(() => startChapterTransition(1, "3 Days Later"), 5000);
                        setTimeout(triggerScreenClose, 4000);
                    } else {
                        // For other chapters, just advance normally
                        updated.chapter = prev.chapter + 1;
                    }

                    return updated;
                });

                // Only return to C:\> if not doing transition
                if (state.chapter !== 0) {
                    setRoot('C:\\>');
                }
            }

            if (result) {
                setHistory(prev => [...prev, {
                    root,
                    input: command,
                    output: result
                }]);
            }
            return;
        }

        // Regular commands
        if (command in Commands) {
            setHistory(prev => [...prev, {
                root,
                input: command,
                output: Commands[command]
            }]);
        } else if (command === 'clear') {
            setHistory([]);
            setLoadingComplete(true);
        } else if (command.startsWith('cat ')) {
            const fileName = command.slice(4).trim();
            if (fileName.startsWith('smartNews\\')) {
                const articleNumber = parseInt(fileName.split('\\')[1]);
                const article = currentChapter.smartNews[articleNumber];
                if (article) {
                    setHistory(prev => [...prev, {
                        root,
                        input: command,
                        output: { output: article.content, flag: '' }
                    }]);
                } else {
                    setHistory(prev => [...prev, {
                        root,
                        input: command,
                        output: { output: `Article ${articleNumber} not found.`, flag: '' }
                    }]);
                }
            } else {
                setHistory(prev => [...prev, {
                    root,
                    input: command,
                    output: { output: `File: ${fileName} not found.`, flag: '' }
                }]);
            }
        } else {
            setHistory(prev => [...prev, {
                root,
                input: command,
                output: { output: `Unknown command: ${command}\nType "help" to see available apps.`, flag: '' }
            }]);
        }

    }, [root, getCommands, handleGuessingGameCommand, state, currentChapter, startChapterTransition, triggerScreenClose]);

    // Keyboard handler
    const handleKeyDown = useCallback((e) => {
        if (!state.pwr) {
            setPoweringTransitionStep(6);
            return false;
        }
        if (hideContent || !loadingComplete) return;
        e.preventDefault();

        if (e.key === 'Enter') {
            setLoadingComplete(false);
            handleCommand(userInput);
            setUserInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'Backspace') {
            setUserInput(prev => prev.slice(0, -1));
            setHistoryIndex(-1);
        } else if (e.key === 'Control') {
            setUserInput(prev => prev + '^');
        } else if (e.key === 'ArrowUp') {
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setUserInput(history[newIndex].input);
            }
        } else if (e.key === 'ArrowDown') {
            if (history.length > 0 && historyIndex !== -1) {
                const newIndex = Math.min(history.length - 1, historyIndex + 1);
                if (newIndex === history.length - 1 && historyIndex === history.length - 1) {
                    setHistoryIndex(-1);
                    setUserInput('');
                } else {
                    setHistoryIndex(newIndex);
                    setUserInput(history[newIndex].input);
                }
            }
        } else if (e.key.length === 1 && e.key >= ' ' && e.key <= '~') {
            setUserInput(prev => prev + e.key);
            setHistoryIndex(-1);
        }
    }, [hideContent, userInput, history, historyIndex, handleCommand, loadingComplete, state.pwr]);

    // Attach keyboard listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const onLoadingComplete = () => {
        setHideLoadingTerminal(true);
        setHideContent(false);
    };

    // Context value
    const value = {
        hideContent,
        setHideContent,
        hideLoadingTerminal,
        setHideLoadingTerminal,
        userInput,
        setUserInput,
        root,
        setRoot,
        history,
        setHistory,
        historyIndex,
        setHistoryIndex,
        tip,
        setTip,
        state,
        setState,
        handleCommand,
        handleKeyDown,
        onLoadingComplete,
        Commands: getCommands(),
        loadingComplete,
        setLoadingComplete,
        // Screen state
        isScreenClosed: !state.pwr,
        // Menu popup states and handlers
        showMenuPopup,
        setShowMenuPopup,
        hasExistingGame,
        handleNewGame,
        handleContinueGame,
        handleChapterSelect,
        // Cinematic transition states
        isTransitioning,
        transitionStep,
        transitionMessage,
        startChapterTransition,
        // Screen closer states and handlers
        triggerScreenClose,
        poweringTransitionStep,
        transitionRunning
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export default GameContext;
