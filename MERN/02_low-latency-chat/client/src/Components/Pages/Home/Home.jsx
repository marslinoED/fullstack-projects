import React from 'react';
import { useNavigate } from 'react-router-dom';

function generateCode() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export default function Home() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = React.useState('');
  const [joinCode, setJoinCode] = React.useState('');

  const createRoom = () => {
    const nextCode = generateCode();
    const userId = generateCode(); // Generate a random user ID for the creator
    setRoomCode(nextCode);
    navigate(`/chat/${nextCode}/?userId=${userId}`);
  };

  const joinRoom = (event) => {
    event.preventDefault();

    const nextCode = joinCode.trim().toUpperCase();
    if (nextCode.length !== 6) {
      return;
    }

    setRoomCode(nextCode);
    const userId = generateCode(); // Generate a random user ID for the joiner
    navigate(`/chat/${nextCode}/?userId=${userId}`);
  };

  return (
    <div className='home-page'>
      <div className='home-card'>
        <p className='eyebrow'>Low latency calls</p>
        <h1>Start or join a temporary chat room</h1>
        <p className='home-copy'>Generate a fresh 6-letter room code or join an existing room by entering its code.</p>
        <div className='home-grid'>
          <section className='home-panel'>
            <span className='panel-label'>Create room</span>
            <div className='room-preview'>
              <span>Room code</span>
              <strong>{roomCode || 'AAAAAA'}</strong>
            </div>
            <button type='button' className='primary-button' onClick={createRoom}>
              Generate room and enter chat
            </button>
          </section>

          <section className='home-panel home-panel--join'>
            <span className='panel-label'>Join room</span>
            <form className='join-form' onSubmit={joinRoom}>
              <input
                type='text'
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder='Enter 6-letter code'
                maxLength={6}
                aria-label='Room code'
              />
              <button type='submit' className='primary-button'>
                Join chat
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
