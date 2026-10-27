import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Download, FileText, X } from 'lucide-react';
import { CorridoData } from '../types';

interface CommercialLicenseBadgeProps {
  song: CorridoData;
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialLicenseBadge: React.FC<CommercialLicenseBadgeProps> = ({
  song,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-amber-500/60 rounded-2xl p-6 sm:p-8 text-stone-100 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-400 bg-stone-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Layout */}
        <div className="border-4 border-double border-amber-500/50 p-6 rounded-xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-center">
          
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-full text-amber-400">
              <Award className="w-10 h-10" />
            </div>
          </div>

          <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-black">
            El Rey del Corrido AI Studio • Sello Oficial
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-200 mt-1 mb-2">
            Certificado de Licencia Comercial
          </h2>
          <p className="text-xs text-stone-400 max-w-md mx-auto mb-6">
            Este certificado otorga los derechos de uso comercial, transmisión pública, sincronización y distribución digital completa de la obra musical.
          </p>

          <div className="bg-stone-950/80 border border-amber-500/30 rounded-lg p-4 text-left space-y-2.5 font-sans text-xs mb-6">
            <div className="flex justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-400">Título de la Obra:</span>
              <span className="font-bold text-amber-200 text-sm">{song.title}</span>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-400">Identificador Único (Hash):</span>
              <span className="font-mono text-amber-400 font-bold">{song.songHash || '#CORR-MASTER-01'}</span>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-400">Arreglo / Estilo:</span>
              <span className="text-stone-200 font-medium">{song.style || 'Modern Banda Bélico 144 BPM'}</span>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-400">Tonalidad & Tempo:</span>
              <span className="text-stone-200">{song.musicalKey || 'A Major'} • {song.tempo || '144 BPM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Estado de Derechos:</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Libre de Regalías (Royalty-Free)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left text-[11px] text-stone-400 mb-6 bg-stone-900/50 p-3 rounded-lg border border-stone-800">
            <div>
              <span className="font-bold text-stone-200 block mb-1">✓ Permitido:</span>
              <ul className="space-y-1">
                <li>• Spotify, Apple Music, YouTube Music</li>
                <li>• Redes Sociales (TikTok, Instagram, YouTube)</li>
                <li>• Radio, TV y Shows en Vivo</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-stone-200 block mb-1">✓ Garantía de Originalidad:</span>
              <p>Generado con motores de audio IA de alta fidelidad. Sin muestras protegidas de terceros.</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePrintCertificate}
              className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
            >
              <FileText className="w-4 h-4" /> Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
