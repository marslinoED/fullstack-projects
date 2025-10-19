import React, { useEffect, useRef, useState } from 'react';
import TerminalHistory from './TerminalHistory';
import { useGame } from '../../../Context/GameContext';

const TerminalContent = () => {
    const { root, userInput, history, tip, loadingComplete, state } = useGame();
    const terminalRef = useRef(null);
    const [scrollTrigger, setScrollTrigger] = useState(0);

    // Auto-scroll to bottom when content changes or during typing animation
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [userInput, history, scrollTrigger, state]);

    // Function to trigger scroll during text typing
    const handleScrollTrigger = () => {
        setScrollTrigger(prev => prev + 1);
    };

    return (
        <div
            ref={terminalRef}
            className="position-relative terminal-content"
            style={{
                zIndex: 2,
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '5px',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
            }}
        >

            <div className="mb-2" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ color: '#ffff00' }}>Terminal-Soul SYSTEM v0.1.{state.chapter}</div>
                <div style={{ color: '#888888' }}>Copyright (c) 1952-2025 Terminal-Soul Computing Corp.</div>
                <div style={{ color: '#888888' }}>Memory: 64K RAM  Extended: 512K  Available: 61440 bytes</div>
                <div style={{ color: '#888888' }}>Disk Drives: C:/</div>
                <div style={{ color: '#888888' }}>════════════════════════════════════════════════════</div>
            </div>
            {tip && (
                <div className="mb-1" style={{ color: '#00ffff', position: 'relative', zIndex: 1 }}>
                    <span>{tip}</span>
                </div>
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <TerminalHistory history={history} onScrollTrigger={handleScrollTrigger} />
            </div>
            {
                loadingComplete && (
                    <div className="mb-2" style={{ 
                        position: 'relative', 
                        zIndex: 1,
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            position: 'relative',
                            flexWrap: 'wrap',
                            wordWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}>
                            <span style={{ 
                                color: '#ffff00',
                                flexShrink: 0,
                                minWidth: 'auto'
                            }}>{root}</span>
                            <span style={{ 
                                marginLeft: '8px', 
                                position: 'relative',
                                flex: 1,
                                wordWrap: 'break-word',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                minWidth: 0
                            }}>
                                <span style={{ 
                                    color: '#00ff00',
                                    wordWrap: 'break-word',
                                    wordBreak: 'break-word'
                                }}>{userInput}</span>
                                <span
                                    style={{
                                        color: '#00ff00',
                                        animation: 'blink 1s infinite'
                                    }}
                                >
                                    █
                                </span>
                            </span>
                        </div>
                    </div>)}
        </div>
    );
};

export default TerminalContent;