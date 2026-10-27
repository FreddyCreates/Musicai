import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Radio, RefreshCw, X } from 'lucide-react';
import { safeParseJson } from '../utils/apiHelper';

interface VoiceAgentProps {
  onClose?: () => void;
  onComposeFromVoice?: (heroName: string, story: string) => void;
}

export const VoiceAgent: React.FC<VoiceAgentProps> = ({ onClose, onComposeFromVoice }) => {
  const [selectedVoice, setSelectedVoice] = useState<'Fenrir' | 'Charon' | 'Puck' | 'Zephyr'>('Fenrir');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    {
      sender: 'agent',
      text: '¡Qué hubo, compa! Soy El Rey del Corrido. Habla conmigo por voz: cuéntame tu historia o el nombre de tu héroe y te ayudaré a componer un corrido inmortal.'
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
        audioElemRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'es-MX'; // Mexican Spanish

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        rec.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Speak agent response using browser SpeechSynthesis with Mexican Spanish voice
  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.95; // Slightly measured, dramatic bard pacing
    utterance.pitch = 0.9; // Lower warm voice

    const voices = synthRef.current.getVoices();
    const mxVoice = voices.find(v => v.lang.includes('es-MX') || v.lang.includes('es_MX')) || voices.find(v => v.lang.startsWith('es'));
    if (mxVoice) {
      utterance.voice = mxVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleStartListening = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Could not start recognition:", e);
      }
    } else {
      alert("El reconocimiento de voz no está disponible en este navegador. Puedes escribir tu mensaje.");
    }
  };

  const handleStopListeningAndSend = async () => {
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }

    const messageToSend = transcript.trim();
    if (!messageToSend) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: messageToSend }]);
    setTranscript('');

    try {
      const res = await fetch('/api/voice-agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: messageToSend, voice: selectedVoice })
      });
      const data = await safeParseJson<{ replyText?: string; audioUrl?: string | null; rawPCM?: string | null; voice?: string }>(res, { replyText: "¡Arre! Esa es una gran historia, compa. Vamos a convertirla en canción." });
      const reply = data?.replyText || "¡Arre! Esa es una gran historia, compa. Vamos a convertirla en canción.";

      setMessages(prev => [...prev, { sender: 'agent', text: reply }]);

      if (data?.audioUrl) {
        if (audioElemRef.current) {
          audioElemRef.current.pause();
        }
        const audio = new Audio(data.audioUrl);
        audioElemRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          speakText(reply);
        };
        audio.play().catch(() => {
          speakText(reply);
        });
      } else {
        speakText(reply);
      }
    } catch (err) {
      console.error(err);
      const fallbackReply = "¡Apariente! Te escucho fuerte y claro. ¡Hagamos cantar a las guitarras con tu leyenda!";
      setMessages(prev => [...prev, { sender: 'agent', text: fallbackReply }]);
      speakText(fallbackReply);
    }
  };

  return (
    <div className="bg-stone-900 border-2 border-amber-800 p-6 shadow-2xl relative max-w-xl mx-auto my-6 text-amber-100">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-stone-400 hover:text-amber-400 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/40 border border-amber-800/30 text-amber-400 text-xs tracking-wider uppercase mb-2">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" /> Agente de Voz Interactivo
        </div>
        <h3 className="font-serif text-2xl font-black uppercase text-amber-100">
          Habla con El Rey del Corrido
        </h3>
        <p className="text-stone-400 text-xs mt-1">
          Presiona el micrófono y platícale por voz tu historia, héroe o aventura.
        </p>
      </div>

      {/* Avatar Display */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all ${
          isSpeaking 
            ? 'border-amber-500 shadow-lg shadow-amber-600/40 scale-105 bg-amber-950/40' 
            : isListening 
            ? 'border-red-600 shadow-lg shadow-red-700/40 animate-pulse bg-red-950/20' 
            : 'border-stone-800 bg-stone-950'
        }`}>
          <span className="text-4xl select-none">🤠</span>
        </div>

        <div className="mt-2 text-[11px] font-black tracking-widest uppercase text-amber-500 flex items-center gap-1.5">
          {isSpeaking && <><Volume2 className="w-3.5 h-3.5 animate-bounce" /> El Rey Hablando...</>}
          {isListening && <><Mic className="w-3.5 h-3.5 animate-ping text-red-500" /> Escuchando Tu Voz...</>}
          {!isSpeaking && !isListening && <span>Listo para Escuchar</span>}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-stone-950 border border-stone-800 p-4 h-48 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 max-w-[85%] text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-amber-900/30 border border-amber-800/50 text-amber-100 ml-auto rounded-none text-right'
                : 'bg-stone-900 border border-stone-800 text-stone-200 mr-auto rounded-none'
            }`}
          >
            <span className="block text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">
              {m.sender === 'user' ? 'Tú (Voz)' : 'El Rey del Corrido'}
            </span>
            {m.text}
          </div>
        ))}

        {transcript && (
          <div className="p-2 bg-red-950/20 border border-red-800/40 text-red-200 text-xs italic">
            Escuchando: "{transcript}"
          </div>
        )}
      </div>

      {/* Voice Selection Selector */}
      <div className="mb-4">
        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 flex items-center justify-between">
          <span>Modelo de Voz del Agente (Gemini TTS):</span>
          <span className="text-amber-400">{selectedVoice}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(['Fenrir', 'Charon', 'Puck', 'Zephyr'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSelectedVoice(v)}
              className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all text-center ${
                selectedVoice === v
                  ? 'bg-amber-600 border-amber-400 text-stone-950 font-black shadow-sm'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-amber-200 hover:border-stone-700'
              }`}
            >
              {v === 'Fenrir' && 'Comandante'}
              {v === 'Charon' && 'Don Vicente'}
              {v === 'Puck' && 'El Gavilán'}
              {v === 'Zephyr' && 'El Centauro'}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {!isListening ? (
          <button
            onClick={handleStartListening}
            className="w-full sm:flex-1 py-3.5 bg-red-700 hover:bg-red-600 text-stone-100 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 border-red-900"
          >
            <Mic className="w-4 h-4" /> Hablar por Micrófono
          </button>
        ) : (
          <button
            onClick={handleStopListeningAndSend}
            className="w-full sm:flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Enviar Mi Mensaje
          </button>
        )}

        {transcript && (
          <button
            onClick={handleStopListeningAndSend}
            className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-bold uppercase cursor-pointer"
          >
            Enviar
          </button>
        )}
      </div>
    </div>
  );
};
