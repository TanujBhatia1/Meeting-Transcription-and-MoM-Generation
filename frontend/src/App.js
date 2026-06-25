// frontend/src/App.js
import React, { useRef, useEffect, useState } from 'react';

function App() {
  const [connected, setConnected] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const ws = useRef(null);
  const mediaRecorder = useRef(null);

  useEffect(() => {
    // Prompt for microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Set up WebSocket to backend
        ws.current = new WebSocket("ws://localhost:8000/api/ws/asr", "token=YOUR_TOKEN_HERE");
        ws.current.onopen = () => {
          console.log("WebSocket opened");
          setConnected(true);
          // Start sending audio via MediaRecorder (PCM/webm)
          mediaRecorder.current = new MediaRecorder(stream, {mimeType: 'audio/webm'});
          mediaRecorder.current.addEventListener('dataavailable', (e) => {
            if (ws.current.readyState === WebSocket.OPEN && e.data.size > 0) {
              ws.current.send(e.data);
            }
          });
          mediaRecorder.current.start(200); // send every 200ms
        };
        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          // Append transcript line
          setTranscripts(prev => [...prev, data]);
        };
      })
      .catch(err => console.error("getUserMedia error:", err));
    
    return () => {
      if (mediaRecorder.current) mediaRecorder.current.stop();
      if (ws.current) ws.current.close();
    };
  }, []);

  return (
    <div>
      <h1>Live Meeting Transcription</h1>
      {connected ? <p>Connected. Transcribing...</p> : <p>Connecting to server...</p>}
      <div style={{whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '1em'}}>
        {transcripts.map((t,i) => (
          <div key={i}>
            [{t.speaker}] {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
