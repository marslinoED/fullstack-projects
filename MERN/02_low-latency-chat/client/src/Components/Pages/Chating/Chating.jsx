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
  
  // الحالات الجديدة الخاصة بالمكالمة الصوتية والـ Notification
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // لتخزين الـ Offer المستلم
  const [showModal, setShowModal] = useState(false);     // لإظهار نافذة الاتصال الوارد

  // استخدام useRef للحفاظ على استقرار الـ Streams والاتصال عبر الـ Renders
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

    // --- 1. الاستماع لرسائل الشات العادية ---
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

    // --- 2. الاستماع لإشارات الـ WebRTC (الصوت) ---
    channel.bind('webrtc-signal', async (data) => {
      const { signal } = data;
      
      // نتخطى الإشارات المرسلة منا لتجنب الحلقة اللانهائية (Loop)
      if (signal.senderId === userId) return;

      if (signal.type === 'offer') {
        // بدلاً من الفتح التلقائي، نخزن الـ Offer ونفتح الـ Modal للمستقبل
        setIncomingCall(signal);
        setShowModal(true);
      } else if (signal.type === 'answer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        // لا نضيف الـ Candidates إلا لو كان الـ Connection تم إنشاؤه فعلياً
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal));
        }
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`chat-room-${roomCode}`);
      pusher.disconnect();
    };
  }, [roomCode, pusherKey, pusherCluster, userId]);

  // --- دوال وإعدادات الـ WebRTC ---

  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // سيرفر مجاني لجلب الـ IP
    });

    // تمرير مسار المايك المحلي داخل أنبوب الاتصال
    localStreamRef.current.getTracks().forEach(track => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    // تبادل الـ ICE Candidates فور توليدها من المتصفح
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalToBackend({ ...event.candidate.toJSON(), senderId: userId });
      }
    };

    // تشغيل صوت الطرف الآخر فور التقاط الـ Track
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };
  };

  // عندما يضغط المستخدم الأول على زر "Call"
  const startAudioCall = async () => {
    setInCall(true);
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
    setupPeerConnection();

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    
    sendSignalToBackend({ type: offer.type, sdp: offer.sdp, senderId: userId });
  };

  // عندما يضغط الطرف الثاني على زر "قبول" من الـ Notification
  const acceptCall = async () => {
    setShowModal(false);
    setInCall(true);

    // فتح المايك للطرف المستقبل بعد الموافقة
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
    setupPeerConnection();

    // معالجة الـ Offer المخزن وصناعة الـ Answer
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingCall));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    
    // إرسال الـ Answer للطرف الأول
    sendSignalToBackend({ type: answer.type, sdp: answer.sdp, senderId: userId });
  };

  // عندما يضغط الطرف الثاني على زر "رفض"
  const rejectCall = () => {
    setShowModal(false);
    setIncomingCall(null);
  };

  // دالة تمرير الإشارات للباك إند ومنها لبوشر
  const sendSignalToBackend = async (signalData) => {
    await fetch('/api/v1/signals', { // تأكد من إنشاء هذا الـ Route في Express
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, signalData })
    });
  };

  // إنهاء المكالمة وإغلاق المايك تماماً
  const hangUp = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setInCall(false);
    window.location.reload(); // لإعادة تصفير الـ States
  };

  // دالة إرسال رسائل الشات القديمة كما هي
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

        {/* عنصر الـ Audio لاستقبال وتشغيل صوت الطرف الآخر (مخفي) */}
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

      {/* نافذة الاتصال الوارد (Pop-up Notification Modal) */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ margin: '0 0 10px 0' }}>اتصال صوتي وارد... 📞</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>هناك مستخدم يحاول الاتصال بك في هذه الغرفة.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={acceptCall} style={{ ...btnStyle, backgroundColor: '#28a745' }}>
                قبول ✅
              </button>
              <button onClick={rejectCall} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>
                رفض ❌
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// تنسيقات الـ Modal المضمنة (سريعة للاختبار)
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalBoxStyle = {
  backgroundColor: '#fff', padding: '25px 40px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontFamily: 'sans-serif'
};
const btnStyle = {
  padding: '8px 20px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold'
};