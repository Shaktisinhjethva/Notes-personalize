
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, X, Sparkles, Activity, Check, User, Bot, Zap } from 'lucide-react';

interface LiveVoiceSessionProps {
  onTranscription: (text: string) => void;
  onClose: () => void;
}

interface ChatTurn {
  role: 'user' | 'ai';
  text: string;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveVoiceSession: React.FC<LiveVoiceSessionProps> = ({ onTranscription, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'error'>('connecting');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentInput, currentOutput]);

  useEffect(() => {
    const startSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = inputAudioContext;
        outputAudioContextRef.current = outputAudioContext;
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setStatus('listening');
              const source = inputAudioContext.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              // Handle User Transcription
              if (message.serverContent?.inputTranscription) {
                setCurrentInput(prev => prev + message.serverContent!.inputTranscription!.text);
              }
              
              // Handle AI Transcription
              if (message.serverContent?.outputTranscription) {
                setCurrentOutput(prev => prev + message.serverContent!.outputTranscription!.text);
              }

              // Handle AI Audio Output
              const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64EncodedAudioString && outputAudioContextRef.current) {
                const outCtx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outCtx, 24000, 1);
                const source = outCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outCtx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }

              // Detect turn complete to finalize history
              if (message.serverContent?.turnComplete) {
                setHistory(prev => [
                  ...prev,
                  { role: 'user', text: currentInput },
                  { role: 'ai', text: currentOutput }
                ].filter(t => t.text.trim().length > 0) as ChatTurn[]);
                setCurrentInput('');
                setCurrentOutput('');
              }

              // Handle model interruptions
              if (message.serverContent?.interrupted) {
                for (const source of sourcesRef.current.values()) {
                  try { source.stop(); } catch(e) {}
                  sourcesRef.current.delete(source);
                }
                nextStartTimeRef.current = 0;
              }
            },
            onerror: (e) => {
              console.error('Live error:', e);
              setStatus('error');
            },
            onclose: () => {
              onClose();
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: "You are Error404, a sophisticated AI companion. Be concise, helpful, and high-energy. You are having a real-time conversation. If the user stops talking, you should respond naturally."
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error('Failed to start live session:', err);
        setStatus('error');
      }
    };

    startSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, []);

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
  };

  const handleEndSession = () => {
    const finalTranscript = history.map(h => `${h.role === 'user' ? 'You' : 'AI'}: ${h.text}`).join('\n');
    if (finalTranscript.trim()) onTranscription(finalTranscript);
    onClose();
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column z-50 bg-black animate-in fade-in overflow-hidden">
      {/* Dynamic Background Pulse */}
      <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 opacity-20" 
           style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(100px)' }}></div>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-4 z-10">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary rounded-pill p-2 text-white animate-pulse">
            <Zap size={20} />
          </div>
          <div>
            <h5 className="fw-black text-white text-uppercase tracking-tighter mb-0">Live Intelligence</h5>
            <span className="text-muted small fw-bold uppercase tracking-widest opacity-50" style={{ fontSize: '0.6rem' }}>
              {status === 'connecting' ? 'Calibrating...' : 'Sync Active'}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="btn btn-dark rounded-circle border border-white border-opacity-10 p-2 text-white hover:bg-danger transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Main Experience */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-4 overflow-hidden position-relative">
        
        {/* The AI Orb */}
        <div className="mb-5 position-relative">
            <div className={`orb-outer ${status === 'listening' ? 'active' : ''}`}></div>
            <div className={`orb-inner ${status === 'listening' ? 'active' : ''}`}>
                <Sparkles size={40} className="text-white opacity-80" />
            </div>
        </div>

        {/* Conversation Stream */}
        <div className="w-100 flex-grow-1 overflow-y-auto custom-scrollbar px-3 pb-5" style={{ maxWidth: '700px' }}>
          <div className="d-flex flex-column gap-4">
            {history.map((turn, i) => (
              <div key={i} className={`d-flex gap-3 animate-in slide-in-from-bottom-2 ${turn.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-circle ${turn.role === 'user' ? 'bg-secondary bg-opacity-20' : 'bg-primary bg-opacity-20'}`} style={{ height: 'fit-content' }}>
                  {turn.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-primary" />}
                </div>
                <div className={`glass-card p-3 py-2 rounded-4 border-0 ${turn.role === 'user' ? 'bg-white bg-opacity-5' : 'bg-primary bg-opacity-5'}`}>
                  <p className={`small mb-0 ${turn.role === 'user' ? 'text-white text-opacity-80' : 'text-primary'}`} style={{ lineHeight: '1.5' }}>
                    {turn.text}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Real-time Ticker */}
            {currentInput && (
              <div className="d-flex gap-3 flex-row-reverse animate-in fade-in">
                <div className="p-2 rounded-circle bg-secondary bg-opacity-20" style={{ height: 'fit-content' }}>
                  <User size={16} className="text-white opacity-50" />
                </div>
                <div className="p-3 py-2 rounded-4 border border-dashed border-white border-opacity-10">
                  <p className="small mb-0 text-white text-opacity-40 italic">{currentInput}...</p>
                </div>
              </div>
            )}
            
            {currentOutput && (
              <div className="d-flex gap-3 animate-in fade-in">
                <div className="p-2 rounded-circle bg-primary bg-opacity-20" style={{ height: 'fit-content' }}>
                  <Bot size={16} className="text-primary animate-pulse" />
                </div>
                <div className="glass-card p-3 py-2 rounded-4 border-0 bg-primary bg-opacity-10">
                  <p className="small mb-0 text-primary fw-bold">{currentOutput}</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-black bg-opacity-50 backdrop-blur-xl border-top border-white border-opacity-10 d-flex justify-content-center z-10">
        <button 
          onClick={handleEndSession}
          className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-black text-uppercase d-flex align-items-center gap-3 shadow-2xl hover:scale-105 transition-all"
        >
          <Check size={20} /> Terminate & Save Note
        </button>
      </div>

      <style>{`
        .orb-outer {
            width: 140px;
            height: 140px;
            background: linear-gradient(45deg, #3b82f6, #6366f1);
            border-radius: 50%;
            filter: blur(20px);
            opacity: 0.4;
            transition: all 0.5s ease;
        }
        .orb-outer.active {
            animation: orb-pulse 2s infinite ease-in-out;
        }
        .orb-inner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 50px rgba(59, 130, 246, 0.5);
        }
        .orb-inner.active {
            animation: inner-float 4s infinite ease-in-out;
        }
        @keyframes orb-pulse {
            0% { transform: scale(1); opacity: 0.4; filter: blur(20px); }
            50% { transform: scale(1.4); opacity: 0.6; filter: blur(40px); }
            100% { transform: scale(1); opacity: 0.4; filter: blur(20px); }
        }
        @keyframes inner-float {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -60%) scale(1.05); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};
