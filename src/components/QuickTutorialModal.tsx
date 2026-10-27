import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, Feather, Film, ArrowRight, ArrowLeft, Check, X, HelpCircle, Bot, Play, Video, Music, Lightbulb } from 'lucide-react';

interface QuickTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgentsHub?: () => void;
  onScrollToForm?: () => void;
  onOpenVeoStudio?: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
  description: string;
  points: { title: string; desc: string }[];
  actionLabel?: string;
  actionHandler?: () => void;
}

export const QuickTutorialModal: React.FC<QuickTutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenAgentsHub,
  onScrollToForm,
  onOpenVeoStudio,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: 'Paso 1: Configurar tu Artista Digital',
      subtitle: 'Memoria y Personalidad del Compositor',
      icon: <Bot className="w-6 h-6 text-amber-400" />,
      tag: 'ARTISTA & MEMORIA .MD',
      description: 'Crea o selecciona un Agente de Artista Digital. Cada agente guarda su identidad, biografía, catálogo de lanzamientos y estilo característico en su bóveda de memoria digital.',
      points: [
        {
          title: 'Bóveda de Memoria',
          desc: 'Gestiona la trayectoria de tu artista con archivos .MD persistentes y visión creativa.'
        },
        {
          title: 'Voz Masculina Regional',
          desc: 'Elige entre Fenrir (El Comandante), Charon (Barítono Bravo), Puck (Tenor Bélico) o Zephyr (Campirano).'
        }
      ],
      actionLabel: onOpenAgentsHub ? 'Abrir Centro de Artistas' : undefined,
      actionHandler: onOpenAgentsHub ? () => { onClose(); onOpenAgentsHub(); } : undefined
    },
    {
      id: 2,
      title: 'Paso 2: Generar y Afinar la Letra',
      subtitle: 'Métrica Octosílaba y Rap Corrido',
      icon: <Feather className="w-6 h-6 text-amber-400" />,
      tag: 'COMPOSICIÓN & RIMAS',
      description: 'Escribe el nombre del protagonista y su historia real. Elige entre estilos como Rap Corrido Mexicano (Santa Fe Klan / Alemán), Bélico Tumbado o Banda Pesada con requintos de 12 cuerdas.',
      points: [
        {
          title: 'Harness Estructural 1:1',
          desc: 'Letras estructuradas con métrica octosílaba, rimas consonantes y remate de corrido auténtico.'
        },
        {
          title: 'Asistente de Rimas Inteligente',
          desc: 'Ajusta versos y rimas en tiempo real en la consola de producción de estudio.'
        }
      ],
      actionLabel: onScrollToForm ? 'Ir al Formulario de Creación' : undefined,
      actionHandler: onScrollToForm ? () => { onClose(); onScrollToForm(); } : undefined
    },
    {
      id: 3,
      title: 'Paso 3: Exportar el Video Musical',
      subtitle: 'Veo Video Studio & Exportador YouTube 1080p',
      icon: <Film className="w-6 h-6 text-amber-400" />,
      tag: 'PRODUCCIÓN & EXPORTACIÓN',
      description: 'Convierte tu corrido o rap corrido en un videoclip cinemático listo para plataformas digitales, redes sociales y canales oficiales.',
      points: [
        {
          title: 'Veo AI Music Video Studio',
          desc: 'Genera secuencias cinemáticas realistas en 1080p sincronizadas con el beat del requinto y 808s.'
        },
        {
          title: 'Paquete de Lanzamiento Master',
          desc: 'Descarga simultánea de audio WAV masterizado, video MP4 en alta definición y portada de álbum.'
        }
      ],
      actionLabel: onOpenVeoStudio ? 'Ver Veo Video Studio' : undefined,
      actionHandler: onOpenVeoStudio ? () => { onClose(); onOpenVeoStudio(); } : undefined
    }
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-stone-950 border border-amber-500/40 rounded-xl shadow-2xl shadow-amber-950/40 overflow-hidden"
        >
          {/* Top accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Modal Header */}
          <div className="p-6 pb-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-amber-100 text-lg uppercase tracking-wide">
                  Tutorial Rápido
                </h3>
                <p className="text-xs text-stone-400 font-mono">
                  Guía paso a paso para dominar Corrido AI
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Progress Dots */}
          <div className="px-6 pt-4 flex items-center justify-between gap-2">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : idx < currentStep
                    ? 'bg-amber-700/60'
                    : 'bg-stone-800'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[11px] font-mono font-bold tracking-wider">
                {current.tag}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                Paso {currentStep + 1} de {steps.length}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-stone-900 border border-amber-500/30 shrink-0">
                {current.icon}
              </div>
              <div>
                <h4 className="font-serif font-bold text-amber-200 text-base">
                  {current.title}
                </h4>
                <p className="text-xs text-amber-400/80 font-mono">
                  {current.subtitle}
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-300 leading-relaxed">
              {current.description}
            </p>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {current.points.map((pt, i) => (
                <div key={i} className="p-3 bg-stone-900/80 border border-stone-800 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{pt.title}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-normal pl-5">
                    {pt.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Action shortcut button if available */}
            {current.actionLabel && current.actionHandler && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={current.actionHandler}
                  className="w-full py-2.5 px-4 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/60 hover:border-amber-500 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{current.actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer Navigation */}
          <div className="p-6 pt-4 border-t border-stone-800/80 bg-stone-900/40 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`px-3 py-2 text-xs font-mono rounded-lg border transition-all flex items-center gap-1.5 ${
                currentStep === 0
                  ? 'opacity-30 border-transparent text-stone-600 cursor-not-allowed'
                  : 'border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-md shadow-amber-950 transition-all flex items-center gap-1.5"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-md shadow-amber-950 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>¡Entendido, Empezar!</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
