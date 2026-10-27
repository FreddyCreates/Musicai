import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, Music, Play, ChevronUp, User } from 'lucide-react';
import { ComposerInputs, CorridoData } from '../types';
import { safeParseJson } from '../utils/apiHelper';

interface GeminiChatbotProps {
  onFillAndSubmit?: (inputs: ComposerInputs) => void;
  activeCorrido?: CorridoData | null;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  suggestedAction?: {
    label: string;
    inputs: ComposerInputs;
  };
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ onFillAndSubmit, activeCorrido }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Qué onda compa! Soy **El Caporal AI**, tu asistente oficial de **Corrido AI**, diseñado por **Medina Tech** en Dallas, Texas. 🤠\n\n¿Quieres que te arme una historia legendaria, te sugiera un estilo tumbado o componga un corrido sobre tu vida?'
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/voice-agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, corridoContext: activeCorrido })
      });

      const data = await safeParseJson(res, { replyText: '¡Arriba el corrido compa! ¿Qué otra historia te gustaría componer?' });
      const botReplyText = data?.replyText || '¡Arriba el corrido compa! ¿Qué otra historia te gustaría componer?';

      // Check if user asked to make/compose a corrido or rap song
      let suggestedAction: { label: string; inputs: ComposerInputs } | undefined = undefined;
      
      const lowerQuery = query.toLowerCase();
      const isHoustonRequested = lowerQuery.includes('houston') || lowerQuery.includes('ugk') || lowerQuery.includes('z-ro') || lowerQuery.includes('trae') || lowerQuery.includes('screw') || lowerQuery.includes('slab') || (lowerQuery.includes('rap') && (lowerQuery.includes('slow') || lowerQuery.includes('texas') || lowerQuery.includes('down south') || lowerQuery.includes('south')));
      const isRapRequested = !isHoustonRequested && (lowerQuery.includes('rap') || lowerQuery.includes('trap') || lowerQuery.includes('hip hop'));

      if (lowerQuery.includes('hazme') || lowerQuery.includes('crea') || lowerQuery.includes('compon') || lowerQuery.includes('corrido') || lowerQuery.includes('cancion') || lowerQuery.includes('canta') || lowerQuery.includes('make') || lowerQuery.includes('song') || isRapRequested || isHoustonRequested) {
        // Extract topic or name
        const cleanName = query.replace(/(hazme|crea|compon|un|corrido|de|sobre|para|cancion|canta|make|a|rap|trap|song|about|for|houston|ugk|z-ro)/gi, '').trim() || (isHoustonRequested ? 'The Lone Star King' : isRapRequested ? 'The Dallas Hustler' : 'El Valiente de Dallas');
        const formattedTitle = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        if (isHoustonRequested) {
          suggestedAction = {
            label: `⚡ Compose Houston Rap: "${formattedTitle.substring(0, 28)}"!`,
            inputs: {
              name: formattedTitle || 'The Lone Star Real',
              story: `A slow-rolling, authentic Houston Texas underground street rap track about ${cleanName}, holding it down with day ones, deep 808s, soulful keys, and staying loyal to the soil.`,
              partner: 'The Texas Day Ones',
              style: 'Houston Texas Rap (UGK & Z-Ro Style / Slow Rolling 808s)',
              instrument: 'Heavy Houston 808s & Soulful Texas Keys',
              bandInspiration: 'Houston Texas Underground Rap (UGK / Bun B / Z-Ro / Trae tha Truth / Scarface Style)',
              storyTheme: 'Honor, Lealtad y Código de Amigos',
              locationSetting: 'Houston y Sur de Texas (H-Town / 713)',
              slangHook: 'Holding it down for Texas, real recognize real!',
              tempoBpm: 74
            }
          };
        } else if (isRapRequested) {
          suggestedAction = {
            label: `⚡ Compose English Rap/Trap: "${formattedTitle.substring(0, 28)}"!`,
            inputs: {
              name: formattedTitle || 'The Hustler',
              story: `An upbeat modern American trap anthem about ${cleanName} working hard, staying loyal to the crew, and winning big.`,
              partner: 'The Day One Crew',
              style: 'Rap / Trap (English Hip Hop Instrumental)',
              instrument: '808 Sub-Bass & Synth Beats',
              bandInspiration: 'Modern English Rap & Upbeat Trap (Metro Boomin / Travis Scott / Drake Beat Style)',
              storyTheme: 'Superación Personal y Salir de Abajo',
              locationSetting: 'Dallas y Norte de Texas (DFW / 214)',
              slangHook: 'Yeah, we run the city!',
              tempoBpm: 130
            }
          };
        } else {
          suggestedAction = {
            label: `⚡ ¡Componer Corrido Ahora: "${formattedTitle.substring(0, 28)}"!`,
            inputs: {
              name: formattedTitle || 'El Protagonista',
              story: `Un corrido épico de alta energía sobre ${cleanName} con valentía, respeto y honor.`,
              partner: 'La clica de confianza',
              style: lowerQuery.includes('tumbado') ? 'Bélico Tumbado 2026' : lowerQuery.includes('mente') ? 'Grupo Mente Maestra (Bélico Estratégico, Requintos Dobles y Tarolas 2026)' : 'Modern Banda/Bélico (Requintos 12 Cuerdas, Metales en Vivo y Tamborazo)',
              instrument: lowerQuery.includes('requinto') ? 'Requinto 12 Cuerdas, Metales en Vivo y Tambora' : 'Requinto 12 Cuerdas, Metales en Vivo y Tambora',
              bandInspiration: 'Modern Banda / Bélico en Vivo (Requintos 12 Cuerdas, Metales de Concierto y Tamborazos)',
              storyTheme: 'Superación Personal y Salir de Abajo',
              locationSetting: 'Culiacán (Clave 667 / Tres Ríos / El Humaya)',
              slangHook: '¡Que truene la banda en vivo y retumbe el requinto, viejo!',
              tempoBpm: 144
            }
          };
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReplyText,
        suggestedAction
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: '¡Ánimo compa! Aquí ando listo en Corrido AI por Medina Tech. ¿En qué estilo quieres componer hoy?'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-stone-950 border border-amber-800/40 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-lg"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 p-3.5 border-b border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  🤠
                </div>
                <div>
                  <h3 className="text-amber-100 font-serif font-bold text-sm flex items-center gap-1.5">
                    El Caporal AI <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono border border-amber-500/30">MEDINA TECH</span>
                  </h3>
                  <p className="text-[10px] text-stone-400">Asistente de composición Corrido AI • Dallas, TX</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-amber-200 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-stone-950/90 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-1 text-[10px] text-stone-500 font-mono">
                    {msg.sender === 'bot' ? (
                      <>
                        <Bot className="w-3 h-3 text-amber-500" /> Corrido AI Assistant
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-amber-400" /> Tú
                      </>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg max-w-[88%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-800/80 text-amber-50 border border-amber-600/50 rounded-tr-none'
                        : 'bg-stone-900 text-stone-200 border border-stone-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Auto-Trigger Creation Button */}
                    {msg.suggestedAction && onFillAndSubmit && (
                      <button
                        onClick={() => {
                          onFillAndSubmit(msg.suggestedAction!.inputs);
                          setIsOpen(false);
                        }}
                        className="mt-2.5 w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {msg.suggestedAction.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-amber-500/80 text-xs italic font-serif">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> El Caporal AI está escribiendo...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2 bg-stone-900/60 border-t border-stone-800/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              {[
                '🤠 Corrido de Valentía',
                '🔥 Estilo Tumbado',
                '🪗 Dame una idea'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-700/50 text-stone-300 hover:text-amber-300 rounded whitespace-nowrap transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pregúntale a El Caporal AI..."
                className="flex-1 bg-stone-900 border border-stone-800 focus:border-amber-600/70 text-amber-100 text-xs px-3 py-2 rounded outline-none placeholder:text-stone-600"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 rounded font-bold transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-extrabold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-amber-400/40 text-xs uppercase tracking-wider cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-stone-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="font-serif">Corrido AI Assistant</span>
        </motion.button>
      )}
    </div>
  );
};
