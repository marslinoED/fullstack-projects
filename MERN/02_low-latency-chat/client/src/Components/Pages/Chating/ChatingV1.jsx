import React from 'react';
import { useParams } from 'react-router-dom';
import Pusher from 'pusher-js';

export default function Chating() {
  const { roomCode } = useParams();
  const queryString = window.location.href.split('?')[1];
  const urlParams = new URLSearchParams(queryString);
  const userId = urlParams.get('userId');

  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([
    { id: 1, author: 'System', text: 'Temporary chat is ready.', timestamp: new Date().toISOString(), timeTaken: 0 },
  ]);
  const pusherKey = process.env.REACT_APP_PUSHER_KEY;
  const pusherCluster = process.env.REACT_APP_PUSHER_CLUSTER;

  React.useEffect(() => {
    if (!roomCode || !pusherKey) {
      return undefined;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe(`chat-room-${roomCode}`);

    channel.bind('new-message', function (data) {

      const receivedTime = Date.now();
      const sentTime = new Date(data.timestamp).getTime();
      const latency = receivedTime - sentTime;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          author: data.author,
          text: data.message,
          timestamp: data.timestamp,
          timeTaken: latency,
        },
      ]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`chat-room-${roomCode}`);
      pusher.disconnect();
    };
  }, [roomCode, pusherKey, pusherCluster, userId]);

  const sendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    fetch('/api/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmedMessage, roomCode: roomCode, userId: userId }),
    });

    setMessage('');
  };

  return (
    <div className='chat-page'>
      <div className='chat-shell'>
        <header className='chat-header'>
          <div>
            <p className='eyebrow'>Chat room</p>
            <h1>{roomCode}</h1>
          </div>
          <span className='room-badge'>Temporary room</span>
        </header>

        <section className='chat-panel'>
          <div className='message-list'>
            {messages.map((currentMessage) => (
              <article
                key={currentMessage.id}
                className={`message ${currentMessage.author === userId ? 'message--mine' : 'message--system'}`}
              >
                <span className='message-author'>{currentMessage.author === userId ? 'You' : currentMessage.author}</span>
                <p>{currentMessage.text}</p>
                <span className='message-timestamp'>{new Date(currentMessage.timestamp).toLocaleTimeString()}</span>
                <span className='message-latency'>Latency: {currentMessage.timeTaken} ms</span>
              </article>
            ))}
          </div>

          <form className='message-form' onSubmit={sendMessage}>
            <input
              type='text'
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder='Type a temporary message...'
            />
            <button type='submit' className='primary-button'>
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
