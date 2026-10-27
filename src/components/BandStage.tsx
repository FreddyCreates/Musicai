import React, { useState } from 'react';
import { CorridoStyle } from '../types';
import { Disc, Flame, Volume2, Sparkles, Zap, Radio, Eye, Award } from 'lucide-react';

interface BandStageProps {
  style: CorridoStyle;
  isPlaying: boolean;
  currentLyricIndex: number;
}

type StageLightingMode = 'gold_arena' | 'cyber_neon' | 'palenque' | 'dark_trap' | 'laser_red' | 'nashville_sunset' | 'rock_voltage';

export const BandStage: React.FC<BandStageProps> = ({ style, isPlaying, currentLyricIndex }) => {
  const [lightingMode, setLightingMode] = useState<StageLightingMode>('gold_arena');
  const [isolatedSoloIndex, setIsolatedSoloIndex] = useState<number | null>(null);
  const [activeFx, setActiveFx] = useState<string | null>(null);

  // Band composition according to style and persona
  const getBandMembers = () => {
    const s = (style as string || '').toLowerCase();
    
    // Country & Americana
    if (s.includes('country') || s.includes('americana') || s.includes('bluegrass') || s.includes('whispering') || s.includes('nashville') || s.includes('folk')) {
      return [
        {
          role: 'Lead Singer & Acoustic Guitar',
          name: 'Colt Hardin',
          instrument: '1954 Martin D-28 Dreadnought Acoustic + Shure SM7B',
          icon: '🤠',
          badge: 'Lead Vocal',
          signature: 'Heartland Baritone & Honest Storytelling',
          eqProfile: 'Warm Chest Resonance / 120Hz Body'
        },
        {
          role: 'Pedal Steel Guitarist',
          name: 'Sho-Bud Master',
          instrument: 'Sho-Bud Pro 10-String Pedal Steel (Weeping Swells)',
          icon: '🎸',
          badge: 'Pedal Steel',
          signature: 'Crying Slides & Volume Pedal Swells',
          eqProfile: 'Smooth Mids 1.2kHz / Analog Spring Reverb'
        },
        {
          role: 'Banjo & Fiddle Virtuoso',
          name: 'Nashville Fiddler',
          instrument: 'Gibson Mastertone 5-String Banjo & Antique Fiddle',
          icon: '🎻',
          badge: 'Fiddle & Banjo',
          signature: 'High-Spirited Offbeat Rolls & Double Stops',
          eqProfile: 'Crisp Highs 6kHz / Stereo Panning'
        },
        {
          role: 'Acoustic Rhythm & Upright Bass',
          name: 'Heartland Rhythm',
          instrument: 'Vintage Upright Bass & Brushed Snare Drum Kit',
          icon: '🥁',
          badge: 'Acoustic Groove',
          signature: 'Train Beat & Warm Upright Thump',
          eqProfile: 'Snare Brushes / Deep Wood Bass 60Hz'
        },
      ];
    }

    // Modern Rock & Alternative
    if (s.includes('rock') || s.includes('grunge') || s.includes('metal') || s.includes('alternative') || s.includes('punk')) {
      return [
        {
          role: 'Lead Rock Vocalist & Frontman',
          name: 'Damon Cross',
          instrument: 'Telefunken U47 Live + Tube Preamp Overdrive',
          icon: '⚡',
          badge: 'Lead Tenor',
          signature: 'High-Energy Raspy Tenor & Arena Anthems',
          eqProfile: 'Upper Mid Presence 3.5kHz / Tube Saturation'
        },
        {
          role: 'Lead Guitarist & Riff Master',
          name: 'Voltage Guitarist',
          instrument: 'Gibson Les Paul Custom + Marshall JCM800 Half-Stack',
          icon: '🎸',
          badge: 'Lead Riffs',
          signature: 'Overdriven Power Chords & Blistering Solos',
          eqProfile: 'Bite 2.8kHz / Analog Delay 350ms'
        },
        {
          role: 'Heavy Bassist',
          name: 'Thunder Bass',
          instrument: 'Fender Precision Bass + Ampeg SVT 8x10 Tube Rig',
          icon: '🎻',
          badge: 'Driving Bass',
          signature: 'Pick-Driven Driving 8th Notes',
          eqProfile: 'Sub Punch 80Hz / Growl 900Hz'
        },
        {
          role: 'Heavy Arena Drummer',
          name: 'Crash Drummer',
          instrument: 'DW Collector’s 24" Kick + Zildjian Custom Cymbals',
          icon: '🥁',
          badge: 'Heavy Drums',
          signature: 'Explosive Crash Accents & Cracking Snare',
          eqProfile: 'Kick Thump 55Hz / Snare Crack 2kHz'
        },
      ];
    }

    // Mariachi de Gala & Ranchera
    if (s.includes('mariachi') || s.includes('ranchera') || s.includes('gala') || s.includes('jalisco') || s.includes('charro')) {
      return [
        {
          role: 'Tenor Ranchero Solista',
          name: 'Don Armando Villa',
          instrument: 'Voz Monumental de Mariachi con Grito Ranchero',
          icon: '🐎',
          badge: 'Voz Monumental',
          signature: 'Vibrato de Gala & Dicción Impecable',
          eqProfile: 'Presence 2.5kHz / Lexicon Hall Reverb'
        },
        {
          role: 'Sección de Violines de Gala',
          name: 'Los Violines de Oro',
          instrument: '6 Violines Clásicos en Terceras y Quintas',
          icon: '🎻',
          badge: 'Cuerdas de Gala',
          signature: 'Arreglos Orquestales & Melodías Apasionadas',
          eqProfile: 'High String Sheen 10kHz'
        },
        {
          role: 'Trompetas de Mariachi',
          name: 'Trompetas de Jalisco',
          instrument: '2 Trompetas en Si Bemol con Sordina Opcional',
          icon: '🎺',
          badge: 'Metales Brillantes',
          signature: 'Fanfarrias Triunfales & Acentos de Gala',
          eqProfile: 'Brass Cut 4kHz / Dynamic Range'
        },
        {
          role: 'Guitarrón & Vihuela Rítmica',
          name: 'Base Vernácula',
          instrument: 'Guitarrón Acústico Mexicano + Vihuela de Paracho',
          icon: '🪕',
          badge: 'Base Rítmica',
          signature: 'Rasgueo Tradicional 3/4 & Bajos Profundos',
          eqProfile: 'Guitarrón Fundamental 40Hz / Vihuela Attack'
        },
      ];
    }

    // Latin Urban / Dembow / Reggaeton
    if (s.includes('reggaeton') || s.includes('dembow') || s.includes('perreo') || s.includes('urban') || s.includes('latin urban')) {
      return [
        {
          role: 'Lead MC & Urban Hitmaker',
          name: 'Santana Flow',
          instrument: 'Sony C-800G + Autotune Evo Boutique',
          icon: '🌴',
          badge: 'Lead Flow',
          signature: 'Coros Pegajosos & Rimas Bilingües',
          eqProfile: 'Air Band 12kHz / Opto Compressor'
        },
        {
          role: '808 Bass & Sub Programmer',
          name: 'San Juan Bassmaker',
          instrument: 'Roland TR-808 Tuned Sub-Bass + Saturation',
          icon: '🎛️',
          badge: 'Sub-Bass 808',
          signature: 'Bajos Profundos y Deslizantes',
          eqProfile: 'Deep Sub 40Hz / Saturation Harmonics'
        },
        {
          role: 'Dembow Rhythm Engine',
          name: 'Dembow 3:2 Riddim',
          instrument: 'Caja Seca Sincopada + Hi-Hats Rápidos',
          icon: '🥁',
          badge: 'Groove 3:2',
          signature: 'Compás Sincopado de Dembow Callejero',
          eqProfile: 'Snare Mid Punch / Crisp Shakers'
        },
        {
          role: 'Synth Plucks & Vocal Chops',
          name: 'Atmospheric Keys',
          instrument: 'Serum Lead Plucks + Vocal Sampling Engine',
          icon: '🎹',
          badge: 'Melodic Synth',
          signature: 'Plucks Menores & Chops Espaciales',
          eqProfile: 'Stereo Widener / Reverb Wash'
        },
      ];
    }

    // Houston Texas Rap, Trap & Hip-Hop
    if (s.includes('houston') || s.includes('rap') || s.includes('trap') || s.includes('street') || s.includes('hip hop') || s.includes('drill')) {
      return [
        {
          role: 'Lead MC & Lyricist',
          name: 'Houston Street OG (King Tray)',
          instrument: 'Vocal Micro Shure SM7B + Neve 1073 Preamp',
          icon: '👑',
          badge: 'Flow Lead',
          signature: 'Multi-Syllabic Rhymes & Baritone Texas Drawl',
          eqProfile: 'Punchy Mids / Crisp Highs / Direct Presence'
        },
        {
          role: '808 Bass & Beat Programmer',
          name: 'MPC Metro Beatmaker',
          instrument: 'Akai MPC 3000 + Roland TR-808 Sub-Bass',
          icon: '🎛️',
          badge: 'Low-End Sub',
          signature: 'Sliding 808s & 32nd Note Hi-Hats',
          eqProfile: 'Sub-Bass 35Hz / Sidechain Compression'
        },
        {
          role: 'DJ & Turntablist',
          name: 'DJ Screw Screamer',
          instrument: 'Technics SL-1200MK7 + Vinyl Scratches',
          icon: '🎧',
          badge: 'Scratch & Chops',
          signature: 'Chopped & Screwed Pitch Drops',
          eqProfile: 'Vinyl Warmth / Pitch Bend'
        },
        {
          role: 'Keyboardist & Melody Synthesist',
          name: 'Dark Trap Keys',
          instrument: 'Vintage Fender Rhodes + Minor Bell Arpeggios',
          icon: '🎹',
          badge: 'Melodic Stabs',
          signature: 'Minor 9th Chords & Soulful Accents',
          eqProfile: 'Reverb Decay / Spatial Stereo'
        },
      ];
    } else if (s.includes('banda') || s.includes('sinaloense')) {
      return [
        {
          role: 'Vocalista Banda Brava',
          name: 'Don Salvador Lizárraga',
          instrument: 'Voz Potente y Bragada con Gritos Sinaloenses',
          icon: '🎺',
          badge: 'Voz Principal',
          signature: 'Sonoridad Bravía & Afinación Natural de Palenque',
          eqProfile: 'Presence 3kHz / Dynamic Limiter'
        },
        {
          role: 'Tuba & Sousafón',
          name: 'Don Pancho',
          instrument: 'Sousafón de Fibra en Si Bemol (Bajo Chuntata)',
          icon: '🪈',
          badge: 'Bajo Metálico',
          signature: 'Chuntata Rítmica & Bajos Caminados',
          eqProfile: 'Deep Tuba Bass 50Hz'
        },
        {
          role: 'Trombón y Clarinete',
          name: 'Compa Beto',
          instrument: '3 Trombones de Vara & Clarinete Culiacán',
          icon: '🎺',
          badge: 'Metales Altos',
          signature: 'Contrapunto Melódico & Adornos Rápidos',
          eqProfile: 'Brass Clarity / Horn Stabs'
        },
        {
          role: 'Tarola y Tambora',
          name: 'El Güero',
          instrument: 'Tambora de Concierto 28" & Tarola Militar Seca',
          icon: '🥁',
          badge: 'Percusión Pesada',
          signature: 'Platillazos en Seco & Redobles de Poder',
          eqProfile: 'Snare Crack / Heavy Kick Impact'
        },
      ];
    } else if (s.includes('686') || s.includes('mexicali') || s.includes('juniors') || s.includes('tumbado') || s.includes('bélico') || s.includes('tech') || s.includes('callejero')) {
      return [
        {
          role: 'Vocalista Bélico & Flow Urbano',
          name: 'El Gavilán / Belmont',
          instrument: 'Voz Regional Urbana con Autotune Sutil de Estudio',
          icon: '🦅',
          badge: 'Lead Vocal',
          signature: 'Versos Octosílabos en Síncopa Callejera',
          eqProfile: 'Warm Tube Saturation'
        },
        {
          role: 'Requinto de 12 Cuerdas Lead',
          name: 'Compa Peso Requintero',
          instrument: 'Docerola Takamine TC132SC (Doble Plumilleo Rápido)',
          icon: '🎸',
          badge: 'Cuerdas Lead',
          signature: 'Escalas Menores Rápidas & Arpegios Punzantes',
          eqProfile: 'Crisp Acoustic Highs 8kHz'
        },
        {
          role: 'Tololoche Chicoteado & Bajo',
          name: 'Bajo Pesado',
          instrument: 'Tololoche de Madera + Sub-Bass 808 Sintético',
          icon: '🎻',
          badge: 'Slap Bass',
          signature: 'Chicoteo Percusivo & Fondos Sólidos',
          eqProfile: 'Slap Attack / Deep Fundamental 45Hz'
        },
        {
          role: 'Charchetas & Trombón Cortado',
          name: 'Compa Tito Metales',
          instrument: 'Alto Horn Mib + Trombón de Varas Cortado',
          icon: '🎺',
          badge: 'Metales Urbanos',
          signature: 'Cortes Sincopados & Respuestas Dinámicas',
          eqProfile: 'Mid Punch / Horn Resonance'
        },
      ];
    } else if (s.includes('sierren') || s.includes('sierra')) {
      return [
        {
          role: 'Dúo Vocal Principal',
          name: 'Don Faustino Mendoza',
          instrument: 'Armonía Vocal en Terceras Campiranas',
          icon: '🤠',
          badge: 'Dúo Armónico',
          signature: 'Canto Sierreño Sentido y Sentimental de Honor',
          eqProfile: 'Harmonic Warmth'
        },
        {
          role: 'Requinto Campirano 12 Cuerdas',
          name: 'Ariel Jr.',
          instrument: 'Requinto de Cedro Solo de Palo Santo',
          icon: '🎸',
          badge: 'Solo Campirano',
          signature: 'Punteos Agudos & Remates Melancólicos',
          eqProfile: 'High End Clarity'
        },
        {
          role: 'Docerola Acústica Rítmica',
          name: 'Nacho',
          instrument: 'Docerola Acústica de Acompañamiento en 3/4',
          icon: '🪕',
          badge: 'Rasgueo 3/4',
          signature: 'Ritmo Valsado y Marcado Sólido',
          eqProfile: 'Acoustic Body 250Hz'
        },
        {
          role: 'Bajo Campirano Eléctrico',
          name: 'Bajo Rústico',
          instrument: 'Bajo Acústico de 5 Cuerdas Activo',
          icon: '🎻',
          badge: 'Bajo Profundo',
          signature: 'Marcación de Notas Raíz y Deslices',
          eqProfile: 'Low Rumble Control'
        },
      ];
    } else {
      // Corrido Norteño Clásico / Tarolas
      return [
        {
          role: 'Vocalista Norteño',
          name: 'Don Vicente',
          instrument: 'Voz Barítono Norteño de Honor',
          icon: '🎤',
          badge: 'Trovador',
          signature: 'Dicción Impecable & Sentimiento Tradicional',
          eqProfile: 'Classic Vocal Warmth'
        },
        {
          role: 'Acordeón Diatónico de Botones',
          name: 'Compa Chente',
          instrument: 'Acordeón Hohner Corona II (Sol/Do/Fa)',
          icon: '🪗',
          badge: 'Acordeón Lead',
          signature: 'Adornos Clásicos Norteños en 2da y 3ra',
          eqProfile: 'Bellows Air / Reed Resonance'
        },
        {
          role: 'Bajo Sexto Norteño',
          name: 'Guillermo',
          instrument: 'Bajo Sexto Artesanal de Paracho Michoacán',
          icon: '🎸',
          badge: 'Armonía & Ritmo',
          signature: 'Golpe de Taconazo & Acordes Robustos',
          eqProfile: 'Rhythmic Mid-Low'
        },
        {
          role: 'Tarola Norteña y Batería',
          name: 'El Güero',
          instrument: 'Tarola Ludwig Vintage con Escobillas y Baquetas',
          icon: '🥁',
          badge: 'Tiempo Polka',
          signature: 'Rimshots & Acentos en Redoblante',
          eqProfile: 'Snare Snap 2.5kHz'
        },
      ];
    }
  };

  const members = getBandMembers();

  const handleTriggerFx = (fxName: string) => {
    setActiveFx(fxName);
    setTimeout(() => setActiveFx(null), 1800);
  };

  // Dynamic stage lighting theme classes
  const getLightingStyle = () => {
    switch (lightingMode) {
      case 'cyber_neon':
        return 'from-cyan-950/40 via-purple-950/30 to-stone-950 border-cyan-500/40';
      case 'palenque':
        return 'from-amber-900/50 via-orange-950/40 to-stone-950 border-amber-500/60';
      case 'dark_trap':
        return 'from-red-950/50 via-stone-950 to-stone-950 border-red-900/60';
      case 'laser_red':
        return 'from-rose-950/40 via-red-950/30 to-stone-950 border-rose-500/50';
      case 'nashville_sunset':
        return 'from-amber-800/40 via-orange-950/40 to-stone-950 border-amber-500/60';
      case 'rock_voltage':
        return 'from-violet-950/40 via-blue-950/40 to-stone-950 border-blue-500/60';
      case 'gold_arena':
      default:
        return 'from-amber-950/40 via-stone-900/60 to-stone-950 border-amber-600/50';
    }
  };

  return (
    <div id="band-stage-container" className={`bg-stone-950 border-2 transition-all duration-500 p-5 md:p-6 shadow-2xl relative overflow-hidden mb-8 ${getLightingStyle()}`}>
      {/* Dynamic Animated Stage Spotlights & Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isPlaying && (
          <>
            <div className={`absolute -top-24 left-1/4 w-72 h-96 blur-3xl opacity-30 animate-pulse ${
              lightingMode === 'cyber_neon' ? 'bg-cyan-500' : lightingMode === 'dark_trap' ? 'bg-red-600' : 'bg-amber-400'
            }`} />
            <div className={`absolute -top-24 right-1/4 w-72 h-96 blur-3xl opacity-30 animate-pulse delay-500 ${
              lightingMode === 'cyber_neon' ? 'bg-purple-600' : lightingMode === 'laser_red' ? 'bg-rose-500' : 'bg-amber-500'
            }`} />
          </>
        )}
      </div>

      {/* FX Trigger Overlay Notification */}
      {activeFx && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-stone-950 font-serif font-black px-4 py-1.5 uppercase text-xs tracking-widest shadow-2xl animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{activeFx}</span>
        </div>
      )}

      {/* Stage Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-stone-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-500 flex items-center justify-center">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-black text-amber-100 uppercase tracking-wider flex items-center gap-2">
              <span>Escenario Orquesta IA & Flow En Vivo</span>
              <span className="text-[10px] px-2 py-0.5 bg-stone-900 border border-amber-700/60 text-amber-400 font-mono">
                {style}
              </span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Monitoreo interactivo de músicos, niveles por canal y efectos de tarima en tiempo real.
            </p>
          </div>
        </div>

        {/* Interactive Lighting Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-mono uppercase">Luces:</span>
          <div className="inline-flex bg-stone-900 border border-stone-800 p-0.5">
            {[
              { id: 'gold_arena', label: 'Oro Concierto' },
              { id: 'palenque', label: 'Palenque' },
              { id: 'cyber_neon', label: 'Cyber Trap' },
              { id: 'dark_trap', label: 'Dark Room' },
              { id: 'nashville_sunset', label: 'Sunset Country' },
              { id: 'rock_voltage', label: 'Rock Voltage' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setLightingMode(mode.id as StageLightingMode)}
                className={`px-2 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  lightingMode === mode.id
                    ? 'bg-amber-500 text-stone-950 font-black shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Playing Status Pill */}
          <span className={`text-[11px] font-mono px-3 py-1 font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isPlaying ? 'bg-amber-500 text-stone-950 animate-pulse' : 'bg-stone-900 text-stone-400 border border-stone-800'
          }`}>
            <Disc className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
            {isPlaying ? 'En Vivo' : 'Listo'}
          </span>
        </div>
      </div>

      {/* Live Band Performers Grid (4 Performers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {members.map((member, idx) => {
          const isSoloist = isPlaying && (isolatedSoloIndex === idx || (isolatedSoloIndex === null && currentLyricIndex % members.length === idx));
          const isIsolated = isolatedSoloIndex === idx;

          return (
            <div
              key={member.name}
              onClick={() => setIsolatedSoloIndex(isolatedSoloIndex === idx ? null : idx)}
              className={`p-4 border transition-all duration-300 relative flex flex-col justify-between cursor-pointer group select-none ${
                isSoloist
                  ? 'bg-gradient-to-b from-amber-950/90 via-stone-900 to-stone-950 border-amber-400 shadow-xl shadow-amber-950/60 scale-[1.02] ring-1 ring-amber-400'
                  : isPlaying
                  ? 'bg-stone-900/80 border-stone-800 hover:border-amber-700/60'
                  : 'bg-stone-950/80 border-stone-800 text-stone-500 hover:border-stone-700'
              }`}
            >
              {/* Highlight badge for soloist */}
              {isSoloist && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 shadow flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  {isIsolated ? 'Aislado / Solo Manual' : 'Solo Principal'}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl p-2 bg-stone-950 border border-stone-800 rounded group-hover:scale-110 transition-transform">
                    {member.icon}
                  </span>
                  <div className="text-right">
                    <span className={`text-[9px] font-mono px-2 py-0.5 block font-bold uppercase ${
                      isSoloist
                        ? 'bg-amber-400 text-stone-950 font-black'
                        : isPlaying
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-stone-900 text-stone-600'
                    }`}>
                      {isPlaying ? (isSoloist ? '★ SOLO ON' : 'TOCANDO') : 'STANDBY'}
                    </span>
                    <span className="text-[9px] text-stone-500 font-mono mt-0.5 block">{member.badge}</span>
                  </div>
                </div>

                <h4 className="font-serif font-black text-stone-100 text-sm group-hover:text-amber-300 transition-colors">
                  {member.name}
                </h4>
                <p className="text-amber-500 text-[11px] font-bold uppercase tracking-wide mt-0.5">{member.role}</p>
                <p className="text-stone-300 text-[10px] mt-1 italic leading-tight">{member.instrument}</p>

                <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-[10px] text-stone-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Firma Sonora:</span>
                    <span className="text-stone-300 font-medium truncate max-w-[140px]">{member.signature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Perfil EQ:</span>
                    <span className="text-amber-400 font-mono text-[9px]">{member.eqProfile}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic VU Meter & Equalizer Bar */}
              <div className="mt-4 pt-3 border-t border-stone-800/70 flex items-center justify-between">
                <div className="flex items-end gap-1 h-5">
                  {[45, 80, 35, 95, 60].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 transition-all duration-200 ${
                        isSoloist ? 'bg-amber-400' : isPlaying ? 'bg-amber-600' : 'bg-stone-800'
                      }`}
                      style={{
                        height: isPlaying ? `${Math.max(20, (h * (isSoloist ? 1.3 : 0.75)) % 100)}%` : '15%',
                        animation: isPlaying ? `pulse 0.${3 + i}s infinite alternate` : 'none'
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {isPlaying ? (isSoloist ? '100% Master' : '75% Bus') : '0 dB'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Stage FX Soundboard & Atmosphere Triggers */}
      <div className="mt-5 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10 bg-stone-900/60 p-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="font-serif text-xs font-black text-amber-300 uppercase tracking-wider">
            Atmósfera & Efectos de Escenario:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleTriggerFx('📢 ¡OVACIÓN DEL PÚBLICO (GRITOS Y APLAUSOS)!')}
            className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-stone-300 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
          >
            <span>👏 Ovación Crowd</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerFx('🔥 DISPARO DE FUEGO & HUMO DE ESCENARIO')}
            className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-stone-300 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
          >
            <span>🔥 Pyro & Humo</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerFx('⚡ SUB-BASS 808 DROP & PLATILLAZO SECO')}
            className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-stone-300 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
          >
            <span>⚡ 808 Drop / Tarolazo</span>
          </button>

          {isolatedSoloIndex !== null && (
            <button
              type="button"
              onClick={() => setIsolatedSoloIndex(null)}
              className="px-2.5 py-1 bg-amber-600 text-stone-950 text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              <span>Restablecer Toda la Banda</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
