import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Pusher from 'pusher-js';

export default function Chating() {
  const { roomCode } = useParams();
  const queryString = window.location.href.split('?')[1];
  const urlParams = new URLSearchParams(queryString);
  const userId = urlParams.get('userId');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, author: 'System', text: 'Temporary chat is ready.', timestamp: new Date().toISOString(), timeTaken: 0 },
  ]);
  
  // حالات المكالمة الصوتية
  const [inCall, setInCall] = useState(false);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const pusherKey = process.env.REACT_APP_PUSHER_KEY;
  const pusherCluster = process.env.REACT_APP_PUSHER_CLUSTER;

  useEffect(() => {
    if (!roomCode || !pusherKey) {
      return undefined;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe(`chat-room-${roomCode}`);

    // --- أولاً: الاستماع لرسائل الشات العادية ---
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

    // --- ثانياً: الاستماع لإشارات المكالمة الصوتية (WebRTC) ---
    channel.bind('webrtc-signal', async (data) => {
      const { signal } = data;
      
      // نتخطى الإشارات التي قمنا نحن بإرسالها
      if (signal.senderId === userId) return;

      if (signal.type === 'offer') {
        await handleOffer(signal);
      } else if (signal.type === 'answer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal));
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`chat-room-${roomCode}`);
      pusher.disconnect();
    };
  }, [roomCode, pusherKey, pusherCluster, userId]);

  // --- دوال الـ WebRTC للمكالمة الصوتية ---
  
  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // تمرير المايك المحلي داخل الاتصال
    localStreamRef.current.getTracks().forEach(track => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    // تبادل الـ ICE Candidates تلقائياً عبر السيرفر وبوشر
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalToBackend({ ...event.candidate.toJSON(), senderId: userId });
      }
    };

    // تشغيل صوت الطرف الآخر فور استقبال الـ Track
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };
  };

  const startAudioCall = async () => {
    setInCall(true);
    // الحصول على صلاحية المايك
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
    setupPeerConnection();

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    
    sendSignalToBackend({ type: offer.type, sdp: offer.sdp, senderId: userId });
  };

  const handleOffer = async (offer) => {
    setInCall(true);
    if (!peerConnectionRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setupPeerConnection();
    }

    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    
    sendSignalToBackend({ type: answer.type, sdp: answer.sdp, senderId: userId });
  };

  const sendSignalToBackend = async (signalData) => {
    await fetch('/api/v1/signal', { // تأكد من مطابقة هذا الـ Route بالباك إند
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, signalData })
    });
  };

  const hangUp = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setInCall(false);
    window.location.reload();
  };

  // --- دالة إرسال الشات القديمة كما هي ---
  const sendMessage = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

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
          {/* أزرار التحكم في المكالمة الصوتية داخل الـ Header */}
          <div>
            {!inCall ? (
              <button onClick={startAudioCall} className='primary-button' style={{ backgroundColor: '#28a745' }}>
                Call 📞
              </button>
            ) : (
              <button onClick={hangUp} className='primary-button' style={{ backgroundColor: '#dc3545' }}>
                End ❌
              </button>
            )}
          </div>
        </header>

        {/* عنصر الـ Audio لاستقبال صوت الطرف الآخر (مخفي) */}
        <audio ref={remoteAudioRef} autoPlay />

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