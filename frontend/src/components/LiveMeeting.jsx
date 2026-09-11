import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Radio,
  Clock3,
  Users,
} from "lucide-react";

import AgendaUpload from "./AgendaUpload";
import { createAudioWebSocket, generateMom } from "../api";

function LiveMeeting({
  agenda,
  meeting,
  onAgendaUploaded,
  onMomGenerated,
  onError,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [generating, setGenerating] = useState(false);

  const websocketRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => stopRecording();
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [isRecording]);

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const remaining = (seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${remaining}`;
  }

  function convertFloat32ToInt16(float32Array) {
    const pcm16 = new Int16Array(float32Array.length);

    for (let index = 0; index < float32Array.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, float32Array[index]));
      pcm16[index] = sample < 0 ? sample * 32768 : sample * 32767;
    }

    return pcm16;
  }

  async function startRecording() {
    if (!meeting?.id) {
      onError("Upload an agenda before starting the meeting.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const websocket = createAudioWebSocket(meeting.id);

      websocket.binaryType = "arraybuffer";

      websocket.onopen = async () => {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        const audioContext = new AudioContextClass({
          sampleRate: 16000,
        });

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
          if (websocket.readyState !== WebSocket.OPEN) return;

          const input = event.inputBuffer.getChannelData(0);
          const pcm16 = convertFloat32ToInt16(input);

          websocket.send(pcm16.buffer);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        streamRef.current = stream;
        websocketRef.current = websocket;
        audioContextRef.current = audioContext;
        processorRef.current = processor;
        sourceRef.current = source;

        setElapsedSeconds(0);
        setIsRecording(true);
      };

      websocket.onmessage = (event) => {
        const transcript = JSON.parse(event.data);

        if (!transcript.text?.trim()) return;

        setTranscripts((previous) => [
          ...previous,
          {
            ...transcript,
            id: crypto.randomUUID(),
          },
        ]);
      };

      websocket.onerror = () => {
        onError("The audio WebSocket connection failed.");
        stopRecording();
      };

      websocket.onclose = () => {
        setIsRecording(false);
      };
    } catch (error) {
      onError(`Microphone error: ${error.message}`);
    }
  }

  function stopRecording() {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();

    audioContextRef.current?.close();

    streamRef.current?.getTracks().forEach((track) => track.stop());

    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.close();
    }

    processorRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;
    websocketRef.current = null;

    setIsRecording(false);
  }

  async function handleGenerateMom() {
    if (!meeting?.id || transcripts.length === 0) {
      onError("Record some audio before generating the MoM.");
      return;
    }

    setGenerating(true);

    try {
      const response = await generateMom(meeting.id);
      onMomGenerated(response);
    } catch (error) {
      onError(error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="workspace-grid">
      <div className="main-column">
        <AgendaUpload
          agenda={agenda}
          onUploaded={onAgendaUploaded}
          onError={onError}
        />

        <div className="card live-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">STEP 2</p>
              <h3>Live transcription</h3>
              <p className="muted">
                Audio is streamed to the backend and transcribed in real time.
              </p>
            </div>

            <div className={`live-indicator ${isRecording ? "active" : ""}`}>
              <span />
              {isRecording ? "Recording" : "Ready"}
            </div>
          </div>

          <div className="meeting-controls">
            <button
              className={`record-button ${
                isRecording ? "record-button-stop" : ""
              }`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!meeting}
            >
              {isRecording ? <Square size={20} /> : <Mic size={20} />}
              <span>{isRecording ? "Stop recording" : "Start recording"}</span>
            </button>

            <div className="meeting-stat">
              <Clock3 size={17} />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>

            <div className="meeting-stat">
              <Radio size={17} />
              <span>{transcripts.length} transcript segments</span>
            </div>
          </div>

          <div className="transcript-panel">
            {transcripts.length === 0 ? (
              <div className="empty-state">
                <Mic size={30} />
                <strong>No transcript yet</strong>
                <span>
                  Upload an agenda and start recording to see the transcript.
                </span>
              </div>
            ) : (
              transcripts.map((item) => (
                <div className="transcript-row" key={item.id}>
                  <div className="speaker-badge">
                    {(item.speaker || "S").slice(-1)}
                  </div>

                  <div className="transcript-content">
                    <div className="transcript-meta">
                      <strong>{item.speaker || "Speaker"}</strong>
                      <span>
                        {item.timestamp
                          ? new Date(item.timestamp * 1000).toLocaleTimeString()
                          : "Now"}
                      </span>
                    </div>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">STEP 3</p>
              <h3>Generate meeting minutes</h3>
              <p className="muted">
                Create structured minutes, decisions, and action items.
              </p>
            </div>
            <Sparkles className="card-icon" size={23} />
          </div>

          <button
            className="primary-button full-width"
            onClick={handleGenerateMom}
            disabled={!meeting || transcripts.length === 0 || generating}
          >
            {generating ? (
              <>
                <span className="button-spinner" />
                Generating minutes...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate MoM
              </>
            )}
          </button>
        </div>
      </div>

      <aside className="side-column">
        <div className="card meeting-info-card">
          <div className="side-card-title">
            <Users size={18} />
            <h3>Current meeting</h3>
          </div>

          <div className="meeting-title">
            {meeting?.title || "No meeting created"}
          </div>

          <div className="info-row">
            <span>Status</span>
            <strong className={isRecording ? "text-danger" : "text-success"}>
              {isRecording ? "Live" : "Not recording"}
            </strong>
          </div>

          <div className="info-row">
            <span>Agenda items</span>
            <strong>{agenda?.agenda_items?.length || 0}</strong>
          </div>

          <div className="info-row">
            <span>Transcript segments</span>
            <strong>{transcripts.length}</strong>
          </div>
        </div>

        <div className="card workflow-card">
          <h3>Workflow</h3>

          <div className="workflow-step workflow-step-done">
            <span>1</span>
            <div>
              <strong>Upload agenda</strong>
              <p>Provide meeting context.</p>
            </div>
          </div>

          <div
            className={`workflow-step ${
              transcripts.length > 0 ? "workflow-step-done" : ""
            }`}
          >
            <span>2</span>
            <div>
              <strong>Record and transcribe</strong>
              <p>Capture the discussion.</p>
            </div>
          </div>

          <div className="workflow-step">
            <span>3</span>
            <div>
              <strong>Generate MoM</strong>
              <p>Extract decisions and actions.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default LiveMeeting;