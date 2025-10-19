import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the guessing game context
const GuessingGameContext = createContext();

// Custom hook to use the guessing game context
export const useGuessingGame = () => {
    const context = useContext(GuessingGameContext);
    if (!context) {
        throw new Error('useGuessingGame must be used within a GuessingGameProvider');
    }
    return context;
};

// Guessing Game Provider component
export const GuessingGameProvider = ({ children }) => {

    const [gameState, setGameState] = useState();
    const startGame = useCallback(() => {
        setGameState({
            isActive: true,
            targetNumber: Math.floor(Math.random() * 10) + 1,
            attempts: 0,
            maxAttempts: 3,
            hasWon: false,
            hasLost: false,
            lastGameResult: null
        });
        return {
            output: `Guessing Game started!\n
            Type "guess <number>" to make a guess (1-10).\n
            You have 3 attempts.`,
            flag: ''
        };
    }, []);
    const makeGuess = useCallback((guess, state) => {
        if (!gameState || !gameState.isActive) {
            return {
                output: 'No active game. Type "start" to begin a new game.',
                flag: ''
            };
        } else if (gameState.hasWon || gameState.hasLost || gameState.attempts >= gameState.maxAttempts) {
            return {
                output: 'Game over. Type "start" to begin a new game.',
                flag: ''
            };
        } else {
            const guessNumber = parseInt(guess, 10);
            if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 10) {
                return {
                    output: 'Invalid guess. Please enter a number between 1 and 10.',
                    flag: ''
                };
            } else {
                const newAttempts = gameState.attempts + 1;
                let newGameState = { ...gameState, attempts: newAttempts };
                let output = '';
                if (guessNumber === gameState.targetNumber) {
                    newGameState.hasWon = true;
                    newGameState.isActive = false;
                    newGameState.lastGameResult = 'won';
                    output = state ? `Congratulations! You guessed the number ${gameState.targetNumber} correctly!` :
                        `Congratulations! You guessed the number ${gameState.targetNumber} correctly!\n
And as a reward, you've won your internet connection upgrade!\n
Order confirmed. Shipment arriving in 3 days.`;

                } else if (guessNumber < gameState.targetNumber) {
                    output = `Your guess is too low. Try again!`;
                } else {
                    output = `Your guess is too high. Try again!`;
                }
                if (newAttempts >= gameState.maxAttempts && !newGameState.hasWon) {
                    newGameState.hasLost = true;
                    newGameState.isActive = false;
                    newGameState.lastGameResult = 'lost';
                    output += `\nGame Over! You've used all your attempts. The correct number was ${gameState.targetNumber}.`;
                }
                setGameState(newGameState);
                return {
                    output,
                    flag: '',
                    state: newGameState.hasWon ? "Win" : newGameState.hasLost ? "Lose" : "Continue"
                };
            }
        }
    }, [gameState]);
    const endGame = useCallback(() => {
        return {
            output: 'Exiting the game.',
            flag: ''
        }
    }, []);

    // Handle guessing game commands
    const handleGuessingGameCommand = useCallback((command, state) => {
        if (command === 'guessingGame') {
            return {
                output: !state ? `
****************************************************
*                                                  *
*               Welcome To Our Game                *
*      $  UPGRADE YOUR INTERNET CONNECTION  $      *
*                                                  *
*          WIN WITH MATANET SERVICE TODAY!         *
*                                                  *
*                                                  *
*  CALL: (555) 042-MATA  |  CONNECT > matanet.sys  *
*                                                  *
****************************************************

Type "start" to begin a new game.
                ` : `Type "start" to begin a new game.`,
                flag: `                     _         
 ___ _ _ ___ ___ ___|_|___ ___ 
| . | | | -_|_ -|_ -| |   | . |
|_  |___|___|___|___|_|_|_|_  |
|___|                     |___|
                               
 _____                         
|   __|___ _____ ___           
|  |  | .'|     | -_|          
|_____|__,|_|_|_|___| 
`
            }
        }
        else if (command === 'start') {
            // Always start a new game when start command is used
            return startGame();
        } else if (command.startsWith('guess ')) {
            const guessValue = command.slice(6).trim();
            return makeGuess(guessValue, state);
        } else if (command === 'exit') {
            return endGame();
        } else if (command === 'help') {
            return {
                output: `Guessing Game Commands:\n
  start           - Start a new game\n
  guess <number>  - Make a guess (1-10)\n
  help           - Show this help\n
  exit           - Exit the game`,
                flag: ''
            };
        } else {
            return {
                output: `Unknown guessing game command: ${command}\nType "help" for available commands.`,
                flag: ''
            };
        }
    }, [startGame, makeGuess, endGame]);
    // Context value
    const value = {
        handleGuessingGameCommand
    };

    return (
        <GuessingGameContext.Provider value={value}>
            {children}
        </GuessingGameContext.Provider>
    );
};

export default GuessingGameContext;