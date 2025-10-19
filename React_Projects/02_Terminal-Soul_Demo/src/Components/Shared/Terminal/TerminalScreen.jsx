import React from 'react';
import LoadingTerminal from './LoadingTerminal';
import TerminalContent from './TerminalContent';
import ScreenCloser from '../ScreenCloser/ScreenCloser';
import { useGame } from '../../../Context/GameContext';
import Waves from '../ReactBits/Waves/Waves';

const TerminalScreen = () => {
    // Get all states and functions from context
    const {
        hideContent,
        hideLoadingTerminal,
        poweringTransitionStep,
        isScreenClosed
    } = useGame();

    return (
        <>
            <div
                className="position-absolute terminal-screen"
                style={{
                    top: '55px',
                    left: '20px',
                    right: '20px',
                    bottom: '80px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '6px',
                    border: '3px solid #333',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
                }}
            >
                {/* Terminal Screen */}
                <div
                    className="h-100 w-100 position-relative text-start"
                    style={{
                        backgroundColor: '#000000',
                        fontFamily: 'Monaco, "Lucida Console", monospace',
                        fontSize: '13px',
                        color: '#00ff00',
                        padding: '12px',
                        overflow: 'auto',
                        lineHeight: '1.3'
                    }}
                >
                    {/* CRT Curvature Effect */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
                            pointerEvents: 'none',
                            zIndex: -2
                        }}
                    />
                    {/* Waves Background */}
                    <Waves
                        lineColor="#549f9d9c"
                        backgroundColor="transparent"
                        waveSpeedX={0.05}
                        waveSpeedY={0.02}
                        waveAmpX={10}
                        waveAmpY={4}
                        xGap={10}
                        yGap={10}
                        friction={0.95}
                        tension={0.002}
                        maxCursorMove={0}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 0,
                            opacity: 0.3,
                            pointerEvents: 'none'
                        }}
                    />
                    
                    {/* Loading Terminal */}
                    {!hideLoadingTerminal && (
                        <LoadingTerminal />
                    )}

                    {/* Terminal Content */}
                    {!hideContent && !isScreenClosed && (
                        <TerminalContent />
                    )}
                    
                    {/* Screen Closer Effect */}
                    <ScreenCloser 
                        transitionStep={poweringTransitionStep}
                    />
                    
                    {/* Black screen when closed */}
                    {isScreenClosed && (
                        <div 
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                                backgroundColor: '#000000',
                                zIndex: 999
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Retro Terminal Scrollbar Styles */}
            <style>{`
            .terminal-content::-webkit-scrollbar {
                width: 12px;
            }
            
            .terminal-content::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 3px;
                border: 1px solid #333;
            }
            
            .terminal-content::-webkit-scrollbar-thumb {
                background: #00ff00;
                border-radius: 3px;
                border: 1px solid #008800;
                box-shadow: inset 0 0 3px rgba(0, 255, 0, 0.3);
            }
            
            .terminal-content::-webkit-scrollbar-thumb:hover {
                background: #00cc00;
                box-shadow: inset 0 0 5px rgba(0, 255, 0, 0.5);
            }
            
            .terminal-content::-webkit-scrollbar-corner {
                background: #1a1a1a;
            }
            
            /* Firefox scrollbar */
            .terminal-content {
                scrollbar-width: thin;
                scrollbar-color: #00ff00 #1a1a1a;
            }
        `}</style>
        </>
    );
};

export default TerminalScreen;