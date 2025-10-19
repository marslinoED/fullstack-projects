import React from 'react'
import TextType from '../ReactBits/TextType/TextType'
import { useGame } from '../../../Context/GameContext';

export default function TerminalHistory({ onScrollTrigger }) {

    const {
        history,
        setLoadingComplete
    } = useGame();

    return (
        <div style={{
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            maxWidth: '100%'
        }}>
            {history.map((entry, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                    <div style={{
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start'
                    }}>
                        <span style={{
                            color: '#ffff00',
                            flexShrink: 0
                        }}>{entry.root} </span>
                        <span style={{
                            wordWrap: 'break-word',
                            wordBreak: 'break-word',
                            flex: 1,
                            minWidth: 0
                        }}>{entry.input}</span>
                    </div>
                    <div style={{
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '100%',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            flex: 1,
                            minWidth: 0
                        }}>
                            <span
                                style={{
                                    color: '#00ffff',
                                    wordWrap: 'break-word',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {entry.output.flag}
                            </span>
                            <TextType
                                className="mt-1"
                                style={{
                                    color: '#888888',
                                    wordWrap: 'break-word',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    maxWidth: '100%',
                                    display: 'inline'
                                }}
                                useShinyEffect={false}
                                textColors={[{ color: '#888888' }]}
                                text={entry.output.output}
                                typingSpeed={2}
                                initialDelay={0}
                                loop={false}
                                showCursor={false}
                                onCharacterTyped={onScrollTrigger}
                                onComplete={() => {
                                    setLoadingComplete(true);
                                    onScrollTrigger();
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
