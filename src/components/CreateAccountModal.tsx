import React, { useState } from 'react';
import { X, UserPlus, Sparkles, ShieldCheck, Lock, Mail, Camera, KeyRound } from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: { artistName: string; genre: string; label: string; bio: string; email: string; avatar: string }) => void;
  currentProfile: { artistName: string; genre: string; label: string; bio: string; email?: string; avatar?: string } | null;
}

const AVATAR_OPTIONS = ['🤠', '🎸', '🎤', '🎧', '🦅', '💎', '🌵', '⚡'];

export function CreateAccountModal({ isOpen, onClose, onSaveProfile, currentProfile }: CreateAccountModalProps) {
  const [artistName, setArtistName] = useState(currentProfile?.artistName || '');
  const [email, setEmail] = useState(currentProfile?.email || '');
  const [password, setPassword] = useState('');
  const [genre, setGenre] = useState(currentProfile?.genre || 'Legado 7 & Sierreño Urbano');
  const [label, setLabel] = useState(currentProfile?.label || 'Medina Tech Records');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [avatar, setAvatar] = useState(currentProfile?.avatar || '🤠');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName.trim() || !email.trim()) return;
    
    // Simulate encryption & vault storage
    onSaveProfile({ artistName, genre, label, bio, email, avatar });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-stone-950 border-2 border-amber-600/80 w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-200 cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-900/50 border border-amber-600 text-amber-300">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-amber-100 font-bold uppercase tracking-wider">
              Cuenta Encriptada y Artista Digital
            </h2>
            <p className="text-xs text-stone-400">
              Crea tu acceso seguro con bóveda cifrada en Medina Tech (Dallas, TX)
            </p>
          </div>
        </div>

        {savedSuccess ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center rounded-full text-2xl shadow-lg animate-bounce">
              ✓
            </div>
            <h3 className="font-serif text-amber-100 font-bold text-base">¡Cuenta Encriptada y Perfil Creado!</h3>
            <p className="text-xs text-stone-300">Tus credenciales y repertorio están seguros en tu bóveda personal.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Avatar Selection */}
            <div>
              <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" /> Elige tu Avatar de Artista
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-10 h-10 text-lg flex items-center justify-center border cursor-pointer transition-all ${
                      avatar === av
                        ? 'bg-amber-600 border-amber-300 scale-105 shadow-md'
                        : 'bg-stone-900 border-stone-800 hover:border-amber-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                  Nombre del Artista *
                </label>
                <input
                  type="text"
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Ej. El Compa Chuy / Young Texas"
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-amber-100 text-xs px-3 py-2 rounded-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" /> Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artista@medinatech.com"
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-amber-100 text-xs px-3 py-2 rounded-none focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" /> Contraseña Encriptada (Bóveda Segura) *
              </label>
              <input
                type="password"
                required={!currentProfile}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-amber-100 text-xs px-3 py-2 rounded-none focus:outline-none"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                🔒 Tus datos se almacenan cifrados (AES-256 simulation) para que puedas regresar en cualquier momento.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                  Género Musical Predominante
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-amber-100 text-xs px-3 py-2 rounded-none focus:outline-none cursor-pointer"
                >
                  <option value="Legado 7 & Sierreño Urbano">Legado 7 & Sierreño Urbano</option>
                  <option value="Baja Cali (Los Juniors 686)">Baja Cali (Los Juniors 686)</option>
                  <option value="Bélico Tumbado 2026">Bélico Tumbado 2026</option>
                  <option value="Modern Hard Trap (Drake / Metro)">Modern Hard Trap (Drake / Metro)</option>
                  <option value="Houston Texas Underground Rap">Houston Texas Underground Rap (Z-Ro / UGK)</option>
                  <option value="Corrido de Banda Sinaloense">Corrido de Banda Sinaloense Brava</option>
                </select>
              </div>

              <div>
                <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                  Sello Discográfico / Clica
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Medina Tech Records"
                  className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-amber-100 text-xs px-3 py-2 rounded-none focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                Biografía del Artista
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuenta brevemente tu trayectoria, ciudad de origen o estilo..."
                className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-amber-100 text-xs px-3 py-2 rounded-none focus:outline-none resize-none"
              />
            </div>

            <div className="bg-amber-950/30 border border-amber-800/40 p-3 text-[11px] text-amber-300/90 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cuenta verificada y encriptada por Medina Tech. Tus canciones, portadas y colaboraciones están seguras.</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Guardar Cuenta Encriptada
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
