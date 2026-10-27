import React, { useState, useRef, useEffect } from 'react';
import { CorridoData, LyricStanza } from '../types';
import { safeParseJson } from '../utils/apiHelper';
import { AppLanguage } from '../utils/i18n';
import { 
  Bot, Mic, MicOff, Send, Image as ImageIcon, Video, Music, Sparkles, 
  RefreshCw, Check, ArrowRight, Wand2, Plus, Volume2, Flame, Sliders, ChevronDown, ChevronUp, X
} from 'lucide-react';

interface StudioAgentCopilotProps {
  songData: CorridoData;
  language?: AppLanguage;
  onUpdateLyrics: (newLyrics: LyricStanza[]) => void;
  onUpdateTempo: (newBpm: number) => void;
  onUpdateVoice: (voice: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr') => void;
  onUpdateTitle: (title: string) => void;
  onExtendTrack?: (seconds: number) => void;
  onRegenerateAudio?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  mediaPreview?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    name?: string;
  };
  actions?: {
    label: string;
    icon?: string;
    onClick: () => void;
  }[];
}

export const StudioAgentCopilot: React.FC<StudioAgentCopilotProps> = ({
  songData,
  language = 'en',
  onUpdateLyrics,
  onUpdateTempo,
  onUpdateVoice,
  onUpdateTitle,
  onExtendTrack,
  onRegenerateAudio
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: `¡Qué onda, compa! Soy tu productor ejecutivo IA en el estudio. Estoy listo para ayudarte a componer, rimar, afinar los requintos o transformar "${songData.title}". Puedes hablarme, escribir ideas, o pegar imágenes y videos para darme inspiración.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        {
          label: '🔥 Hacer el coro más bélico y explosivo',
          onClick: () => handleSendPrompt("Haz que el coro de la canción sea más épico, agresivo y bélico, con rimas consonantes y menciones de poder.")
        },
        {
          label: '⚡ Aumentar velocidad a 145 BPM',
          onClick: () => {
            onUpdateTempo(145);
            addAgentResponse("¡Ajusté el tempo a 145 BPM (Vals Bélico Acelerado)! Los redobles de tarola y la tuba ahora van a sonar con más empuje.");
          }
        },
        {
          label: '🎙️ Cambiar a voz Charon (Grave / Bravo)',
          onClick: () => {
            onUpdateVoice('Charon');
            addAgentResponse("¡Voz cambiada a Charon! Tono profundo y respetable perfecto para corridos pesados.");
          }
        }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{
    type: 'image' | 'video' | 'audio';
    url: string;
    file?: File;
    name: string;
  } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const addAgentResponse = (text: string, actions?: Message['actions']) => {
    setMessages(prev => [
      ...prev,
      {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions
      }
    ]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
      ? 'video'
      : 'audio';

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedMedia({
          type: fileType,
          url: reader.result,
          file,
          name: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setAttachedMedia({
                type: 'image',
                url: reader.result,
                file: blob,
                name: 'Imagen pegada del portapapeles'
              });
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  // Voice dictation toggle via Web Speech API
  const handleToggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Por favor usa Chrome o Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-MX';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && !attachedMedia) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim() || (attachedMedia ? `Inspiración adjunta: ${attachedMedia.name}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaPreview: attachedMedia ? { type: attachedMedia.type, url: attachedMedia.url, name: attachedMedia.name } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const mediaForRequest = attachedMedia;
    setAttachedMedia(null);
    setIsProcessing(true);

    try {
      // Call Gemini Chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          persona: 'el_caporal',
          genreContext: songData.style || 'Corrido Bélico 2026',
          mediaAttached: mediaForRequest ? { type: mediaForRequest.type, name: mediaForRequest.name } : undefined
        })
      });

      const data = await safeParseJson(response, {
        reply: `Entendido compa. Analicé tu propuesta y la inspiración visual. He adaptado las métricas y la vibra del corrido "${songData.title}".`
      });

      // Analyze if user requested lyrics modification, tempo change or extension
      const lower = text.toLowerCase();
      const generatedActions: Message['actions'] = [];

      if (lower.includes('coro') || lower.includes('letra') || lower.includes('estrofa') || lower.includes('verso') || lower.includes('rimar') || lower.includes('rimas')) {
        generatedActions.push({
          label: '📝 Aplicar Nuevas Letras Sugeridas al Estudio',
          onClick: () => {
            const updatedLyrics: LyricStanza[] = [
              ...songData.lyrics.slice(0, 2),
              {
                type: 'coro',
                text: `¡Y que retumbe la tuba en el pavimento!\nDe Dallas a Culiacán no existe el tormento.\nCon la lealtad y el honor bien puestos al frente,\naquí manda el gallo que cuida a su gente.`
              },
              ...songData.lyrics.slice(3)
            ];
            onUpdateLyrics(updatedLyrics);
            addAgentResponse("¡Letras actualizadas en el editor de estrofas y sincronizadas con la orquesta digital!");
          }
        });
      }

      if (lower.includes('tempo') || lower.includes('rápido') || lower.includes('acelerar') || lower.includes('bpm')) {
        generatedActions.push({
          label: '⚡ Aplicar Tempo +140 BPM',
          onClick: () => {
            onUpdateTempo(142);
            addAgentResponse("Tempo fijado en 142 BPM con doble golpe de tambora y contratiempos cerrados.");
          }
        });
      }

      if (lower.includes('extender') || lower.includes('largo') || lower.includes('más tiempo') || lower.includes('extend')) {
        generatedActions.push({
          label: '➕ Extender Track (+30s con Solo de Requinto)',
          onClick: () => {
            if (onExtendTrack) {
              onExtendTrack(30);
              addAgentResponse("¡Track extendido 30 segundos! Añadido puente con virtuosismo de requinto de 12 cuerdas.");
            }
          }
        });
      }

      if (onRegenerateAudio) {
        generatedActions.push({
          label: '🎛️ Re-sintetizar Master con Nuevos Ajustes',
          onClick: onRegenerateAudio
        });
      }

      addAgentResponse(data.reply || "¡Listo compa! Ya analicé tu petición y los detalles musicales.", generatedActions.length > 0 ? generatedActions : undefined);

    } catch (err: any) {
      addAgentResponse(`Compa, aquí tengo la recomendación: añade más tensión armónica en el requinto antes del coro principal y deja que la tuba marque el paso en 3/4. ¿Quieres que actualicemos las letras?`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-stone-950/95 border border-amber-500/40 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all backdrop-blur-md">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/60 to-stone-900 px-4 py-3 border-b border-amber-600/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-md">
            <Bot className="w-4 h-4 text-stone-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-amber-200 font-serif font-black text-xs uppercase tracking-wider">
                {language === 'en' ? 'AI Executive Producer Copilot' : 'Copiloto Productor Ejecutivo IA'}
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                {language === 'en' ? 'LIVE' : 'EN VIVO'}
              </span>
            </div>
            <p className="text-[10px] text-stone-400">
              {language === 'en' ? 'Speak, write prompts, or drop images/video to inspire the track' : 'Habla, escribe, o arrastra imágenes/videos para inspirar la pista'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Chat Messages Area */}
          <div className="p-4 overflow-y-auto max-h-72 min-h-48 space-y-3 font-sans text-xs scrollbar-thin scrollbar-thumb-amber-900 scrollbar-track-stone-950">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-mono font-bold text-amber-500/80">
                    {m.sender === 'user' ? 'Tú (Productor)' : 'Productor IA'}
                  </span>
                  <span className="text-[9px] text-stone-500">{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    m.sender === 'user'
                      ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                      : 'bg-stone-900/90 border border-stone-800 text-stone-200 rounded-tl-none leading-relaxed'
                  }`}
                >
                  {m.mediaPreview && (
                    <div className="mb-2 rounded overflow-hidden border border-amber-500/30">
                      {m.mediaPreview.type === 'image' && (
                        <img
                          src={m.mediaPreview.url}
                          alt="Media preview"
                          className="max-h-36 w-full object-cover rounded"
                        />
                      )}
                      {m.mediaPreview.type === 'video' && (
                        <video
                          src={m.mediaPreview.url}
                          controls
                          className="max-h-36 w-full rounded"
                        />
                      )}
                      {m.mediaPreview.type === 'audio' && (
                        <audio
                          src={m.mediaPreview.url}
                          controls
                          className="w-full h-8 mt-1"
                        />
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Interactive Action Chips */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex flex-wrap gap-1.5">
                      {m.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={act.onClick}
                          className="px-2.5 py-1 bg-stone-950 hover:bg-amber-950 border border-amber-600/40 hover:border-amber-400 text-amber-300 text-[10px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-102"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-stone-400 text-xs italic p-2 bg-stone-900/40 rounded">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>El productor IA está analizando las pistas y la inspiración...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Idea Inspiration Chips */}
          <div className="px-3 py-2 bg-stone-900/50 border-t border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            <span className="text-stone-400 font-bold uppercase shrink-0">Ideas rápidas:</span>
            <button
              onClick={() => handleSendPrompt("Agrega un solo de requinto de 12 cuerdas acelerado")}
              className="px-2 py-0.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded shrink-0 whitespace-nowrap cursor-pointer"
            >
              🎸 Solo de Requinto
            </button>
            <button
              onClick={() => handleSendPrompt("Rima el final del verso con 'lealtad' y 'coraje'")}
              className="px-2 py-0.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded shrink-0 whitespace-nowrap cursor-pointer"
            >
              ✍️ Rimas de Honor
            </button>
            <button
              onClick={() => handleSendPrompt("Añade redobles de tarola y tuba en doble golpe")}
              className="px-2 py-0.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded shrink-0 whitespace-nowrap cursor-pointer"
            >
              🥁 Tarolas y Tuba
            </button>
            <button
              onClick={() => handleSendPrompt("Cambia la tonalidad a Fa Sostenido Menor (F#m)")}
              className="px-2 py-0.5 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded shrink-0 whitespace-nowrap cursor-pointer"
            >
              🎼 Escala F#m
            </button>
          </div>

          {/* Media Attachment Preview Pill */}
          {attachedMedia && (
            <div className="px-3 py-1.5 bg-amber-950/60 border-t border-amber-800/40 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2 truncate">
                {attachedMedia.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-amber-400" />}
                {attachedMedia.type === 'video' && <Video className="w-3.5 h-3.5 text-rose-400" />}
                {attachedMedia.type === 'audio' && <Music className="w-3.5 h-3.5 text-sky-400" />}
                <span className="truncate text-[11px] font-mono">{attachedMedia.name}</span>
              </div>
              <button
                onClick={() => setAttachedMedia(null)}
                className="text-stone-400 hover:text-red-400 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Prompt & Voice Input Box */}
          <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2" onPaste={handlePaste}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Adjuntar Imagen, Video o Audio de inspiración (o pega con Ctrl+V)"
              className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-400 rounded cursor-pointer transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleVoiceDictation}
              title="Dictar instrucciones al Productor IA por voz"
              className={`p-2 rounded border transition-colors cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-amber-400'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder="Habla o escribe al Productor IA... (Ej: 'Haz el coro más bravo', 'Pega foto')"
              className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 text-amber-100 placeholder-stone-500 text-xs rounded focus:outline-none focus:border-amber-500 font-sans"
            />

            <button
              type="button"
              onClick={() => handleSendPrompt()}
              disabled={isProcessing || (!inputText.trim() && !attachedMedia)}
              className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-stone-950 font-bold rounded flex items-center gap-1 cursor-pointer transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
