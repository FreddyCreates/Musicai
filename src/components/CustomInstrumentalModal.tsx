import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Music, Play, Pause, X, CheckCircle2, Sparkles, Sliders, 
  Trash2, RefreshCw, FileAudio, Disc, Flame, Shield, ArrowRight, Clock, Zap
} from 'lucide-react';
import { CustomAudioTrack, CorridoData } from '../types';
import { customAudioStorage } from '../utils/customAudioStorage';
import { AppLanguage, translations } from '../utils/i18n';

interface CustomInstrumentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onLoadTrackToStudio: (corrido: CorridoData) => void;
  onComposeLyricsForBeat?: (track: CustomAudioTrack) => void;
}

export const CustomInstrumentalModal: React.FC<CustomInstrumentalModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoadTrackToStudio,
  onComposeLyricsForBeat
}) => {
  const t = translations[language];

  // State
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'demos'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewTrack, setPreviewTrack] = useState<CustomAudioTrack | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [savedTracks, setSavedTracks] = useState<CustomAudioTrack[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Form Fields
  const [trackTitle, setTrackTitle] = useState('');
  const [tempoBpm, setTempoBpm] = useState<number>(142);
  const [musicalKey, setMusicalKey] = useState<string>('G');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Load saved tracks when modal opens or library tab selected
  useEffect(() => {
    if (isOpen) {
      loadSavedTracks();
    } else {
      stopPreview();
    }
  }, [isOpen]);

  const loadSavedTracks = async () => {
    setIsLoadingSaved(true);
    try {
      const tracks = await customAudioStorage.getAllCustomTracks();
      setSavedTracks(tracks);
    } catch (e) {
      console.warn('Failed to load saved tracks:', e);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const stopPreview = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
    setIsPlayingPreview(false);
  };

  const handleTogglePreview = (audioUrl: string) => {
    if (!audioUrl) return;

    if (isPlayingPreview && audioPreviewRef.current) {
      stopPreview();
      return;
    }

    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(audioUrl);
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.src = audioUrl;
    }

    audioPreviewRef.current.play()
      .then(() => setIsPlayingPreview(true))
      .catch((err) => console.warn('Preview play blocked:', err));
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    stopPreview();
    setSelectedFile(file);
    setIsAnalyzing(true);

    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    setTrackTitle(cleanTitle);

    try {
      const analysis = await customAudioStorage.analyzeAudioFile(file);
      const audioUrl = URL.createObjectURL(file);

      const track: CustomAudioTrack = {
        id: `temp_${Date.now()}`,
        title: cleanTitle,
        artistName: 'Artista Independiente',
        fileName: file.name,
        fileSize: file.size,
        duration: analysis.duration,
        detectedBpm: analysis.bpm,
        musicalKey: 'G',
        timeSignature: '3/4 (Vals Corrido)',
        audioUrl,
        peaks: analysis.peaks,
        createdAt: Date.now()
      };

      setPreviewTrack(track);
      setTempoBpm(analysis.bpm);
    } catch (err) {
      console.error('Error analyzing file:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndOpenStudio = async () => {
    if (!selectedFile && !previewTrack) return;

    stopPreview();
    try {
      let finalTrack: CustomAudioTrack;

      if (selectedFile) {
        finalTrack = await customAudioStorage.saveCustomTrack(
          selectedFile,
          trackTitle || selectedFile.name,
          tempoBpm,
          musicalKey
        );
      } else if (previewTrack) {
        finalTrack = previewTrack;
      } else {
        return;
      }

      const corridoProject = customAudioStorage.createCorridoFromCustomTrack(finalTrack);
      onLoadTrackToStudio(corridoProject);
      onClose();
    } catch (err) {
      console.error('Error saving and loading custom track:', err);
    }
  };

  const handleComposeLyricsWithBeat = async () => {
    if (!selectedFile && !previewTrack) return;

    stopPreview();
    try {
      let finalTrack: CustomAudioTrack;

      if (selectedFile) {
        finalTrack = await customAudioStorage.saveCustomTrack(
          selectedFile,
          trackTitle || selectedFile.name,
          tempoBpm,
          musicalKey
        );
      } else if (previewTrack) {
        finalTrack = previewTrack;
      } else {
        return;
      }

      if (onComposeLyricsForBeat) {
        onComposeLyricsForBeat(finalTrack);
      } else {
        const corridoProject = customAudioStorage.createCorridoFromCustomTrack(finalTrack);
        onLoadTrackToStudio(corridoProject);
      }
      onClose();
    } catch (err) {
      console.error('Error preparing track for lyrics:', err);
    }
  };

  const handleDeleteSavedTrack = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await customAudioStorage.deleteCustomTrack(id);
    loadSavedTracks();
  };

  const handleLoadSampleDemo = (demoType: 'belico_tumbado' | 'sierreno_campirano' | 'trap_corrido') => {
    stopPreview();
    const demoTrack = customAudioStorage.createSampleDemoTrack(demoType);
    const corridoProject = customAudioStorage.createCorridoFromCustomTrack(demoTrack);
    onLoadTrackToStudio(corridoProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#10131a] border border-amber-500/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-[#222838] flex items-center justify-between bg-gradient-to-r from-[#171b26] to-[#10131a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500">
                  MelodyCraft Pro Studio
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded-full uppercase border border-amber-500/30">
                  Custom Audio DAW
                </span>
              </div>
              <h3 className="font-serif text-lg font-black text-amber-100 uppercase tracking-wide">
                {language === 'en' ? 'Bring Your Own Instrumental / Music' : 'Traer Mi Propia Instrumental / Pistas'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#1a1f2e] text-stone-400 hover:text-white hover:bg-[#252c42] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#222838] bg-[#0c0e14] px-5 pt-3 gap-2">
          <button
            onClick={() => {
              stopPreview();
              setActiveTab('upload');
            }}
            className={`pb-2.5 px-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'upload'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Upload Audio (MP3/WAV)' : 'Subir Archivo de Audio'}</span>
          </button>

          <button
            onClick={() => {
              stopPreview();
              setActiveTab('library');
              loadSavedTracks();
            }}
            className={`pb-2.5 px-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'library'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'My Saved Beats' : 'Mis Pistas Guardadas'} ({savedTracks.length})</span>
          </button>

          <button
            onClick={() => {
              stopPreview();
              setActiveTab('demos');
            }}
            className={`pb-2.5 px-3 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'demos'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Sample Beats' : 'Pistas Demo'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'upload' && (
            <>
              {/* Dropzone */}
              {!previewTrack ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                    isDragging
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-[#2c344a] hover:border-amber-500/50 bg-[#141824]/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mp3,audio/wav,audio/m4a,audio/flac,audio/ogg,audio/aac,.mp3,.wav,.m4a,.flac,.ogg,.aac"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {isAnalyzing ? (
                    <div className="py-6 flex flex-col items-center">
                      <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mb-3" />
                      <p className="font-serif font-bold text-amber-200 text-sm uppercase tracking-wide">
                        {language === 'en' ? 'Analyzing Audio & Detecting BPM...' : 'Analizando Audio y Detectando BPM...'}
                      </p>
                      <span className="text-[11px] text-stone-400 mt-1 font-mono">
                        {language === 'en' ? 'Extracting waveform peaks & transients' : 'Extrayendo ondas y transientes rítmicos'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
                        <Upload className="w-7 h-7" />
                      </div>

                      <div>
                        <h4 className="font-serif text-base font-bold text-amber-100">
                          {language === 'en' ? 'Click to select or drag & drop your audio track' : 'Haz clic o arrastra tu pista de audio aquí'}
                        </h4>
                        <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                          {language === 'en' 
                            ? 'Compatible with MP3, WAV, M4A, FLAC, OGG. Perfect for beats, requinto riffs, acoustic guitars, and full backing tracks.' 
                            : 'Compatible con MP3, WAV, M4A, FLAC, OGG. Ideal para beats de corrido, requintos, guitarras y pistas completas.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-stone-400">
                        <span className="px-2 py-0.5 bg-[#1b2133] rounded">MP3 / WAV</span>
                        <span className="px-2 py-0.5 bg-[#1b2133] rounded">BPM Detección Automática</span>
                        <span className="px-2 py-0.5 bg-[#1b2133] rounded">Web Audio Stems</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Selected Audio Track Preview & Parameter Customizer */
                <div className="space-y-4">
                  <div className="bg-[#141926] border border-amber-500/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Music className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-amber-500 uppercase font-bold">
                            {previewTrack.fileName}
                          </span>
                          <h4 className="font-serif font-black text-white text-sm">
                            {trackTitle || previewTrack.title}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTogglePreview(previewTrack.audioUrl)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                          isPlayingPreview
                            ? 'bg-amber-500 text-stone-950 scale-105'
                            : 'bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950'
                        }`}
                        title="Escuchar audio"
                      >
                        {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                    </div>

                    {/* Waveform Visualizer */}
                    <div className="h-14 bg-[#0d1017] rounded-lg p-2 flex items-center gap-0.5 overflow-hidden">
                      {previewTrack.peaks && previewTrack.peaks.length > 0 ? (
                        previewTrack.peaks.map((p, i) => (
                          <div
                            key={i}
                            className={`flex-1 transition-all rounded-full ${
                              isPlayingPreview ? 'bg-amber-400 animate-pulse' : 'bg-amber-600/70 hover:bg-amber-400'
                            }`}
                            style={{ height: `${Math.max(10, p * 100)}%` }}
                          />
                        ))
                      ) : (
                        <div className="w-full text-center text-[10px] text-stone-500 font-mono">
                          Waveform Preview
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {Math.floor(previewTrack.duration / 60)}:
                        {String(Math.floor(previewTrack.duration % 60)).padStart(2, '0')} min
                      </span>
                      <span>
                        {(previewTrack.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <button
                        onClick={() => {
                          stopPreview();
                          setSelectedFile(null);
                          setPreviewTrack(null);
                        }}
                        className="text-red-400 hover:text-red-300 text-[11px] underline cursor-pointer"
                      >
                        {language === 'en' ? 'Choose another file' : 'Cambiar archivo'}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Tuning Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-mono font-bold uppercase text-amber-400 mb-1">
                        {language === 'en' ? 'Song Title' : 'Título del Tema'}
                      </label>
                      <input
                        type="text"
                        value={trackTitle}
                        onChange={(e) => setTrackTitle(e.target.value)}
                        placeholder="Nombre de la canción..."
                        className="w-full px-3 py-2 bg-[#141926] border border-[#2b3348] text-white text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-amber-400 mb-1 flex items-center justify-between">
                        <span>Tempo (BPM)</span>
                        <span className="text-amber-300">{tempoBpm} BPM</span>
                      </label>
                      <input
                        type="range"
                        min={100}
                        max={165}
                        value={tempoBpm}
                        onChange={(e) => setTempoBpm(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-500 bg-stone-800 h-2 rounded cursor-pointer mt-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-amber-400 mb-1">
                        {language === 'en' ? 'Musical Key' : 'Tonalidad'}
                      </label>
                      <select
                        value={musicalKey}
                        onChange={(e) => setMusicalKey(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141926] border border-[#2b3348] text-amber-300 text-xs rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                      >
                        <option value="G">G Mayor (Sol Mayor)</option>
                        <option value="Am">A Menor (La Menor)</option>
                        <option value="C">C Mayor (Do Mayor)</option>
                        <option value="D">D Mayor (Re Mayor)</option>
                        <option value="Em">E Menor (Mi Menor)</option>
                        <option value="F">F Mayor (Fa Mayor)</option>
                        <option value="Bb">Bb Mayor (Si bemol)</option>
                        <option value="F#m">F# Menor (Fa sostenido)</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleSaveAndOpenStudio}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>{language === 'en' ? 'Open in Studio DAW Now' : 'Abrir en Studio DAW Ahora'}</span>
                    </button>

                    <button
                      onClick={handleComposeLyricsWithBeat}
                      className="w-full py-3 px-4 bg-[#181e2c] hover:bg-[#20273a] border border-amber-500/50 text-amber-300 font-serif font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{language === 'en' ? 'AI Lyrics for this Beat' : 'Generar Letra IA para Esta Pista'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'library' && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {isLoadingSaved ? (
                <div className="py-8 text-center text-amber-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="font-serif text-xs">{language === 'en' ? 'Loading saved tracks...' : 'Cargando pistas guardadas...'}</span>
                </div>
              ) : savedTracks.length === 0 ? (
                <div className="text-center py-12 border border-[#232a3d] rounded-xl p-6 bg-[#121622]">
                  <Music className="w-8 h-8 text-stone-500 mx-auto mb-2" />
                  <p className="font-serif text-sm text-stone-300 font-bold">
                    {language === 'en' ? 'No saved custom beats yet' : 'No tienes pistas guardadas todavía'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    {language === 'en' ? 'Upload an audio file in the upload tab to save and reuse your instrumentals anytime.' : 'Sube tu archivo de audio en la pestaña de subida para guardarlo y usarlo cuando quieras.'}
                  </p>
                </div>
              ) : (
                savedTracks.map((trk) => (
                  <div
                    key={trk.id}
                    className="p-3 bg-[#131722] hover:bg-[#181d2c] border border-[#242c3e] hover:border-amber-500/40 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleTogglePreview(trk.audioUrl)}
                        className="w-9 h-9 rounded-lg bg-stone-900 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-stone-950 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      >
                        {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      <div className="truncate">
                        <h5 className="font-serif font-bold text-amber-100 text-xs truncate">
                          {trk.title}
                        </h5>
                        <p className="text-[10px] text-stone-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{trk.detectedBpm || 140} BPM</span>
                          <span>•</span>
                          <span>{trk.musicalKey || 'G'}</span>
                          <span>•</span>
                          <span>{Math.floor(trk.duration / 60)}:{String(Math.floor(trk.duration % 60)).padStart(2, '0')}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          stopPreview();
                          const project = customAudioStorage.createCorridoFromCustomTrack(trk);
                          onLoadTrackToStudio(project);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-serif font-black uppercase rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>{language === 'en' ? 'Load in Studio' : 'Cargar en Studio'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteSavedTrack(trk.id, e)}
                        className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar pista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'demos' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 leading-relaxed">
                {language === 'en' 
                  ? 'Don’t have an instrumental file ready? Pick one of our pre-arranged studio templates to start producing immediately.'
                  : '¿No tienes un archivo a la mano? Elige una de nuestras pistas maestras pre-arregladas para empezar a producir al instante.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    id: 'belico_tumbado' as const,
                    title: 'Bélico Tumbado 2026',
                    bpm: '142 BPM',
                    key: 'Am',
                    desc: 'Trombón de vara cortado, docerolas veloces y tarolas militares.',
                    icon: '🔥'
                  },
                  {
                    id: 'sierreno_campirano' as const,
                    title: 'Sierreño 12 Cuerdas',
                    bpm: '130 BPM',
                    key: 'G',
                    desc: 'Requintos campiranos en terceras y bajo eléctrico pulsante.',
                    icon: '🎸'
                  },
                  {
                    id: 'trap_corrido' as const,
                    title: 'Beat 808 Trap Corrido',
                    bpm: '128 BPM',
                    key: 'D',
                    desc: 'Sub-bass 808 retumbante con hi-hats de trap y requintos.',
                    icon: '⚡'
                  }
                ].map((demo) => (
                  <div
                    key={demo.id}
                    onClick={() => handleLoadSampleDemo(demo.id)}
                    className="p-4 bg-[#141824] hover:bg-[#1a2030] border border-[#273044] hover:border-amber-500/60 rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{demo.icon}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                          {demo.bpm}
                        </span>
                      </div>
                      <h4 className="font-serif font-black text-white text-xs group-hover:text-amber-300 transition-colors">
                        {demo.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                        {demo.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="w-full py-1.5 bg-stone-900 group-hover:bg-amber-500 group-hover:text-stone-950 text-amber-300 font-serif font-bold text-[10px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span>{language === 'en' ? 'Use Template' : 'Usar en Studio'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-[#0a0c12] border-t border-[#1e2333] flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'Private client-side processing & full copyright ownership' : 'Procesamiento privado en navegador y 100% derechos de autor'}</span>
          </span>
          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-200 uppercase font-mono text-[10px] cursor-pointer"
          >
            {language === 'en' ? 'Cancel' : 'Cancelar'}
          </button>
        </div>

      </div>
    </div>
  );
};
