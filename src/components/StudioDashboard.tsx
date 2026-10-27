import React, { useState, useEffect, useRef } from 'react';
import { CorridoData, UserLicenseState, LyricStanza } from '../types';
import { audioSynth, CorridoGenre } from '../utils/audioSynth';
import { BandStage } from './BandStage';
import { FullTrackPlayer } from './FullTrackPlayer';
import { PreviewClipPlayer } from './PreviewClipPlayer';
import { YouTubeVideoExporter } from './YouTubeVideoExporter';
import { StudioAudioVisualizer } from './StudioAudioVisualizer';
import { VeoMusicVideoStudio } from './VeoMusicVideoStudio';
import { LyricRhymeAssistant } from './LyricRhymeAssistant';
import { StudioAgentCopilot } from './StudioAgentCopilot';
import { MarketingSeparationModal } from './MarketingSeparationModal';
import { GiftDedicationModal } from './GiftDedicationModal';
import { executeReleasePackage } from '../utils/releasePackage';
import { isSongUnlocked } from '../utils/billingStorage';
import { safeParseJson } from '../utils/apiHelper';
import { AppLanguage, translations } from '../utils/i18n';
import { Play, Pause, Volume2, HelpCircle, Download, Disc, ArrowLeft, RefreshCw, Mic, Square, Sparkles, Music, Sliders, Radio, VolumeX, Video, X, UserPlus, Copy, Check, Package, Layers, CreditCard, Award, Rocket, Share2, Film, Clapperboard, Edit3, Feather, CornerDownLeft, BookOpen, Megaphone, ChevronDown, CheckCircle2, FolderArchive, Headphones, FileText, SlidersHorizontal } from 'lucide-react';

interface StudioDashboardProps {
  data: CorridoData;
  language?: AppLanguage;
  onBack: () => void;
  licenseState?: UserLicenseState;
  onOpenBilling?: () => void;
  onOpenLicense?: () => void;
  onOpenDeploy?: () => void;
  onOpenChannels?: () => void;
  onOpenDistribution?: () => void;
  onOpenInstrumentalLab?: () => void;
}

const SLANG_GLOSSARY: Record<string, string> = {
  compa: "Abreviatura de 'compadre', usado cariñosamente para un amigo leal o compañero de aventuras.",
  hazaña: "Una acción heroica, ilustre o de gran esfuerzo que merece ser recordada.",
  corrido: "Género musical mexicano que narra la historia real o legendaria de un personaje o acontecimiento popular.",
  valiente: "Persona que demuestra coraje y honor al enfrentar grandes desafíos u obstáculos.",
  acordeón: "Instrumento musical de viento típico del norte de México, alma de las melodías campiranas.",
  tumbado: "Subgénero moderno de corrido con ritmos rápidos, guitarras percusivas y letras urbanas de la calle.",
  ranchero: "Estilo musical tradicional mexicano, lento y apasionado, que evoca los sentimientos del campo.",
  leyenda: "Una narración popular que se transmite y se convierte en parte del honor colectivo de un pueblo.",
};

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  data,
  language = 'en',
  onBack,
  licenseState,
  onOpenBilling,
  onOpenLicense,
  onOpenDeploy,
  onOpenChannels,
  onOpenDistribution,
  onOpenInstrumentalLab,
}) => {
  const t = translations[language];
  const isEn = language === 'en';
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStanza, setActiveStanza] = useState(0);

  // Dynamic tempo control: initialized from song tempo data (or 128 BPM default), range 110-160 BPM
  const initialTempoNum = data.tempo ? parseInt(data.tempo.match(/\d+/)?.[0] || '128', 10) : 128;
  const [dynamicTempo, setDynamicTempo] = useState<number>(Math.min(160, Math.max(110, initialTempoNum || 128)));
  const [playbackSpeed, setPlaybackSpeed] = useState(dynamicTempo); // BPM for synth engine

  const getInitialGenre = (styleStr?: string): CorridoGenre => {
    const s = (styleStr || '').toLowerCase();
    if (s.includes('mente maestra') || s.includes('mente')) return 'grupo_mente_maestra';
    if (s.includes('gerardo') || s.includes('ortiz') || s.includes('pesad') || s.includes('progresivo')) return 'gerardo_ortiz';
    if (s.includes('sierren') || s.includes('sierreño') || s.includes('sierra')) return 'sierreno';
    if (s.includes('norten') || s.includes('norteño')) return 'norteno';
    if (s.includes('banda')) return 'banda';
    return 'tumbado';
  };
  const [selectedGenre, setSelectedGenre] = useState<CorridoGenre>(getInitialGenre(data.style));

  // Multi-Track Faders - Punchy drums and crisp requinto by default
  const [requintoVol, setRequintoVol] = useState(85);
  const [accordionVol, setAccordionVol] = useState(55);
  const [brassVol, setBrassVol] = useState(75);
  const [bassVol, setBassVol] = useState(85);
  const [drumsVol, setDrumsVol] = useState(85); // Heavy tambora & tarolas
  const [vocalVol, setVocalVol] = useState(90);

  // Stems Multi-Track Export States (Drums, Bass, Melody, Vocals)
  const [isStemsModalOpen, setIsStemsModalOpen] = useState(false);
  const [isExportingStems, setIsExportingStems] = useState(false);
  const [stemsExportProgress, setStemsExportProgress] = useState<string | null>(null);
  const [stemsData, setStemsData] = useState<{
    drums: { name: string; url: string; filename: string };
    bass: { name: string; url: string; filename: string };
    melody: { name: string; url: string; filename: string };
    vocals: { name: string; url: string; filename: string };
    zipUrl: string;
  } | null>(null);

  // Solo & Mute States for In-DAW Multi-Track Channel Board
  const [soloTrack, setSoloTrack] = useState<string | null>(null);
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set());
  const [trackPans, setTrackPans] = useState<Record<string, number>>({
    vocal: 0,
    requinto: -15,
    accordion: 20,
    brass: 25,
    bass: 0,
    drums: 0
  });

  // In-DAW Master FX Rack States (Analog Tape Saturation, Room Reverb, Stereo Widener, Limiter)
  const [tapeSaturation, setTapeSaturation] = useState(65);
  const [roomReverb, setRoomReverb] = useState(40);
  const [stereoWidth, setStereoWidth] = useState(135);
  const [limiterCeiling, setLimiterCeiling] = useState(-0.1);
  const [isStemSoloMode, setIsStemSoloMode] = useState(false);

  // Release Package State (Concurrent MP4 + MP3 Downloads)
  const [isExportingReleasePackage, setIsExportingReleasePackage] = useState(false);
  const [releasePackageProgress, setReleasePackageProgress] = useState<string | null>(null);

  // AI Male Voice states (MEN ONLY)
  const [selectedVoice, setSelectedVoice] = useState<'Fenrir' | 'Charon' | 'Puck' | 'Zephyr'>(
    (data.selectedVoice as any) && ['Fenrir', 'Charon', 'Puck', 'Zephyr'].includes(data.selectedVoice)
      ? (data.selectedVoice as any)
      : 'Fenrir'
  );
  const [isGeneratingVocal, setIsGeneratingVocal] = useState(false);
  const [isAIVoiceEnabled, setIsAIVoiceEnabled] = useState(true);
  const [vocalSingingAudioUrl, setVocalSingingAudioUrl] = useState<string | null>(data.vocalAudioUrl || null);
  const [isGeneratingSinging, setIsGeneratingSinging] = useState(false);

  // Lyria & Master Player States (Independent triggers & audio URLs)
  const [lyriaProAudioUrl, setLyriaProAudioUrl] = useState<string | null>(data.proAudioUrl || null);
  const [lyriaClipAudioUrl, setLyriaClipAudioUrl] = useState<string | null>(data.clipAudioUrl || data.audioUrl || null);
  const [lyriaTake2AudioUrl, setLyriaTake2AudioUrl] = useState<string | null>(data.take2AudioUrl || null);
  const [isGeneratingPro, setIsGeneratingPro] = useState(false);
  const [isGeneratingClip, setIsGeneratingClip] = useState(false);
  const [isExportingWav, setIsExportingWav] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [copiedSunoPrompt, setCopiedSunoPrompt] = useState(false);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const fullTrackTriggerRef = useRef<(() => Promise<string | null>) | null>(null);

  // Multi-voice Stanza TTS Audios cached by [voice]_[stanzaIndex]
  const [stanzaAudios, setStanzaAudios] = useState<Record<string, { audioUrl?: string; rawPCM?: string }>>({});
  const [activeAudioSource, setActiveAudioSource] = useState<any>(null);
  const [activeAudioCtx, setActiveAudioCtx] = useState<AudioContext | null>(null);

  // Cover image settings
  const [useAICover, setUseAICover] = useState(!!data.imageUrl);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [aiCoverUrl, setAICoverUrl] = useState<string | undefined>(data.imageUrl);

  // Modal slang lookup
  const [selectedSlang, setSelectedSlang] = useState<{ word: string; definition: string } | null>(null);
  const [showYouTubeExporter, setShowYouTubeExporter] = useState(false);
  const [showVeoStudio, setShowVeoStudio] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [collabLink, setCollabLink] = useState('');
  const [copiedCollab, setCopiedCollab] = useState(false);
  const [activeStudioMenu, setActiveStudioMenu] = useState<'video' | 'distribution' | 'tools' | 'account' | null>(null);

  // Lyric Editing and Rhyme Assistant States
  const [isLyricEditingMode, setIsLyricEditingMode] = useState(true);
  const [lyricsList, setLyricsList] = useState<LyricStanza[]>(data.lyrics || []);
  const [editingStanzaIdx, setEditingStanzaIdx] = useState<number | null>(null);
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const stanzaRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [detectedTargetWords, setDetectedTargetWords] = useState<Record<number, { word: string; line: string; lineIdx: number }>>({});

  // Auto-scroll active karaoke stanza into view
  useEffect(() => {
    if (stanzaRefs.current[activeStanza]) {
      stanzaRefs.current[activeStanza]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeStanza]);

  // Rhyme Assistant Modal State
  const [isRhymeAssistantOpen, setIsRhymeAssistantOpen] = useState(false);
  const [rhymeTarget, setRhymeTarget] = useState<{
    stanzaIndex: number;
    targetWord: string;
    selectedLine: string;
    lineIndex: number;
  } | null>(null);
  const [regeneratingStanzaIdx, setRegeneratingStanzaIdx] = useState<number | null>(null);

  // Sync lyricsList when data changes
  useEffect(() => {
    if (data.lyrics && data.lyrics.length > 0) {
      setLyricsList(data.lyrics);
    }
  }, [data.title, data.songHash]);

  const handleUpdateStanzaText = (stanzaIdx: number, newText: string) => {
    setLyricsList((prev) => {
      const next = [...prev];
      if (next[stanzaIdx]) {
        next[stanzaIdx] = { ...next[stanzaIdx], text: newText };
      }
      return next;
    });
    if (data.lyrics && data.lyrics[stanzaIdx]) {
      data.lyrics[stanzaIdx].text = newText;
    }
  };

  const getFallbackTargetWord = (text: string): string => {
    const lines = (text || '').split('\n').filter(l => l.trim().length > 0);
    const lastLine = lines[lines.length - 1] || text;
    const words = lastLine.replace(/[.,;:!?¡¿"'\-–—()]/g, ' ').trim().split(/\s+/).filter(Boolean);
    return words[words.length - 1] || 'honor';
  };

  const updateTargetWordForStanza = (stanzaIdx: number) => {
    const el = textareaRefs.current[stanzaIdx];
    const stanzaText = lyricsList[stanzaIdx]?.text || '';
    const lines = stanzaText.split('\n');

    let activeLine = '';
    let lineIdx = 0;
    let word = '';

    if (el) {
      const start = el.selectionStart;
      const beforeCursor = stanzaText.slice(0, start);
      lineIdx = beforeCursor.split('\n').length - 1;
      activeLine = lines[lineIdx] || lines[lines.length - 1] || '';

      // Check if user has explicit selection
      if (el.selectionEnd > el.selectionStart) {
        const selectedText = stanzaText.slice(el.selectionStart, el.selectionEnd).trim();
        if (selectedText) {
          const selWords = selectedText.replace(/[.,;:!?¡¿"'\-–—()]/g, ' ').trim().split(/\s+/).filter(Boolean);
          word = selWords[selWords.length - 1] || '';
        }
      }

      if (!word) {
        const lineWords = activeLine.replace(/[.,;:!?¡¿"'\-–—()]/g, ' ').trim().split(/\s+/).filter(Boolean);
        word = lineWords[lineWords.length - 1] || '';
      }
    }

    if (!word) {
      const nonEmpty = lines.filter(l => l.trim().length > 0);
      activeLine = nonEmpty[nonEmpty.length - 1] || lines[0] || '';
      lineIdx = lines.indexOf(activeLine);
      const cleanWords = activeLine.replace(/[.,;:!?¡¿"'\-–—()]/g, ' ').trim().split(/\s+/).filter(Boolean);
      word = cleanWords[cleanWords.length - 1] || 'honor';
    }

    setDetectedTargetWords(prev => ({
      ...prev,
      [stanzaIdx]: { word, line: activeLine, lineIdx: Math.max(0, lineIdx) }
    }));
  };

  const handleOpenRhymeAssistantForStanza = (stanzaIdx: number) => {
    const el = textareaRefs.current[stanzaIdx];
    const stanzaText = lyricsList[stanzaIdx]?.text || '';
    const lines = stanzaText.split('\n');

    let targetWord = '';
    let selectedLine = '';
    let lineIdx = 0;

    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const beforeCursor = stanzaText.slice(0, start);
      lineIdx = beforeCursor.split('\n').length - 1;
      selectedLine = lines[lineIdx] || lines[lines.length - 1] || '';

      if (end > start) {
        const selection = stanzaText.slice(start, end).trim();
        if (selection.includes(' ')) {
          selectedLine = selection;
          const words = selection.replace(/[.,;:!?¡¿"'\-–—()]/g, ' ').trim().split(/\s+/).filter(Boolean);
          targetWord = words[words.length - 1] || '';
        } else {
          targetWord = selection.replace(/[.,;:!?¡¿"'\-–—()]/g, '').trim();
        }
      }

      if (!targetWord) {
        const words = selectedLine.replace(/[.,;:!?¡¿"'\-–—()]/g, ' ').trim().split(/\s+/).filter(Boolean);
        targetWord = words[words.length - 1] || '';
      }
    }

    if (!targetWord) {
      const nonEmpty = lines.filter(l => l.trim().length > 0);
      selectedLine = nonEmpty[nonEmpty.length - 1] || lines[0] || '';
      lineIdx = Math.max(0, lines.indexOf(selectedLine));
      const words = selectedLine.replace(/[.,;:!?¡¿"'\-–—()]/g, ' ').trim().split(/\s+/).filter(Boolean);
      targetWord = words[words.length - 1] || 'honor';
    }

    setRhymeTarget({
      stanzaIndex: stanzaIdx,
      targetWord,
      selectedLine,
      lineIndex: Math.max(0, lineIdx)
    });
    setIsRhymeAssistantOpen(true);
  };

  const handleInsertRhyme = (rhymeWord: string) => {
    if (!rhymeTarget) return;
    const { stanzaIndex, lineIndex } = rhymeTarget;
    const currentStanzaText = lyricsList[stanzaIndex]?.text || '';
    const lines = currentStanzaText.split('\n');

    const targetIdx = lineIndex >= 0 && lineIndex < lines.length ? lineIndex : lines.length - 1;
    if (lines[targetIdx] !== undefined) {
      const line = lines[targetIdx];
      const words = line.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        words[words.length - 1] = rhymeWord;
        lines[targetIdx] = words.join(' ');
      } else {
        lines[targetIdx] = rhymeWord;
      }
      const newText = lines.join('\n');
      handleUpdateStanzaText(stanzaIndex, newText);
      setDetectedTargetWords(prev => ({
        ...prev,
        [stanzaIndex]: { word: rhymeWord, line: lines[targetIdx], lineIdx: targetIdx }
      }));
    }
  };

  const handleInsertPhrase = (newPhrase: string) => {
    if (!rhymeTarget) return;
    const { stanzaIndex, lineIndex } = rhymeTarget;
    const currentStanzaText = lyricsList[stanzaIndex]?.text || '';
    const lines = currentStanzaText.split('\n');

    const targetIdx = lineIndex >= 0 && lineIndex < lines.length ? lineIndex : lines.length - 1;
    lines.splice(targetIdx + 1, 0, newPhrase);
    const newText = lines.join('\n');
    handleUpdateStanzaText(stanzaIndex, newText);
  };

  const handleRegenerateStanza = async (stanzaIdx: number) => {
    setRegeneratingStanzaIdx(stanzaIdx);
    try {
      const res = await fetch('/api/regenerate-stanza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          storySummary: data.storySummary,
          currentStanzaText: lyricsList[stanzaIdx]?.text || '',
          stanzaType: lyricsList[stanzaIdx]?.type || 'verso',
          customInstruction: 'Mejorar rimas consonantes y métrica octosílaba de corrido mexicano'
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.newStanzaText) {
          handleUpdateStanzaText(stanzaIdx, json.newStanzaText);
        }
      }
    } catch (err) {
      console.error('Failed to regenerate stanza:', err);
    } finally {
      setRegeneratingStanzaIdx(null);
    }
  };

  const handleOpenInvite = () => {
    const uniqueToken = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}${window.location.pathname}#collab=${encodeURIComponent(data.title.replace(/\s+/g, '_'))}_${uniqueToken}`;
    setCollabLink(link);
    setCopiedCollab(false);
    setIsInviteModalOpen(true);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eqCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playbackTimerRef = useRef<any>(null);
  const eqAnimFrameRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      // Pre-load voices on mount
      if (synthRef.current) {
        synthRef.current.getVoices();
        synthRef.current.onvoiceschanged = () => {
          if (synthRef.current) synthRef.current.getVoices();
        };
      }
    }
  }, []);

  // Redraw canvas whenever title or name changes or fallback is shown
  useEffect(() => {
    if (canvasRef.current) {
      drawCoverOnCanvas(canvasRef.current, data.title, data.storySummary);
    }
  }, [data.title, data.storySummary, useAICover]);

  // Helper to compute effective track volume with Solo & Mute awareness
  const getEffectiveTrackVolume = (trackId: string, baseVol: number) => {
    if (soloTrack !== null) {
      return soloTrack === trackId ? baseVol : 0;
    }
    if (mutedTracks.has(trackId)) {
      return 0;
    }
    return baseVol;
  };

  // Toggle Solo for an individual track
  const toggleSolo = (trackId: string) => {
    setSoloTrack(prev => (prev === trackId ? null : trackId));
  };

  // Toggle Mute for an individual track
  const toggleMute = (trackId: string) => {
    setMutedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  // Handle multi-track instrument volumes with active Solo & Mute routing
  useEffect(() => {
    audioSynth.setVolume('vocal', getEffectiveTrackVolume('vocal', vocalVol) / 100);
    audioSynth.setVolume('requinto', getEffectiveTrackVolume('requinto', requintoVol) / 100);
    audioSynth.setVolume('accordion', getEffectiveTrackVolume('accordion', accordionVol) / 100);
    audioSynth.setVolume('brass', getEffectiveTrackVolume('brass', brassVol) / 100);
    audioSynth.setVolume('bass', getEffectiveTrackVolume('bass', bassVol) / 100);
    audioSynth.setVolume('drums', getEffectiveTrackVolume('drums', drumsVol) / 100);
  }, [soloTrack, mutedTracks, vocalVol, requintoVol, accordionVol, brassVol, bassVol, drumsVol]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioSynth.stop();
      stopActiveAIVoice();
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (eqAnimFrameRef.current) cancelAnimationFrame(eqAnimFrameRef.current);
    };
  }, []);

  // Spectrum Equalizer Visualizer
  useEffect(() => {
    const drawEQ = () => {
      if (!eqCanvasRef.current || !audioSynth.analyserNode) return;
      const canvas = eqCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = audioSynth.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      audioSynth.analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#d97706'; // Amber gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      eqAnimFrameRef.current = requestAnimationFrame(drawEQ);
    };

    if (isPlaying) {
      drawEQ();
    } else {
      if (eqAnimFrameRef.current) cancelAnimationFrame(eqAnimFrameRef.current);
    }
  }, [isPlaying]);

  // Playback timeline scheduler
  useEffect(() => {
    if (isPlaying) {
      // Rotate active stanzas every 6.5 seconds to sync with rhythm
      playbackTimerRef.current = setInterval(() => {
        setActiveStanza((prev) => {
          const next = (prev + 1) % data.lyrics.length;
          if (isAIVoiceEnabled) {
            speakOrPlayStanza(next);
          }
          return next;
        });
      }, 6500);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      stopActiveAIVoice();
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, isAIVoiceEnabled, stanzaAudios, selectedVoice]);

  // Speak text using browser speech synth as robust fallback or play PCM
  const speakTextBrowser = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    // Distinct male pitch and cadence for each voice
    if (selectedVoice === 'Fenrir') {
      utterance.pitch = 0.75; // Low, raspy, heavy
      utterance.rate = 1.05;
    } else if (selectedVoice === 'Charon') {
      utterance.pitch = 0.80; // Deep solemn baritone
      utterance.rate = 0.92;
    } else if (selectedVoice === 'Puck') {
      utterance.pitch = 1.15; // Higher, punchy tenor
      utterance.rate = 1.10;
    } else if (selectedVoice === 'Zephyr') {
      utterance.pitch = 0.98; // Smooth, lyrical melodic tenor
      utterance.rate = 1.00;
    }
    utterance.volume = vocalVol / 100;

    const voices = synthRef.current.getVoices();
    const esVoices = voices.filter(v => v.lang.includes('es') || v.lang.includes('ES'));
    // Prioritize male voices in browser speech synthesis
    const maleVoice = esVoices.find(v => {
      const name = v.name.toLowerCase();
      return name.includes('male') || name.includes('jorge') || name.includes('diego') || name.includes('carlos') || name.includes('juan') || name.includes('raul') || name.includes('miguel');
    }) || esVoices.find(v => {
      const name = v.name.toLowerCase();
      return !name.includes('female') && !name.includes('sabina') && !name.includes('monica') && !name.includes('helena') && !name.includes('paulina');
    }) || esVoices[0];

    if (maleVoice) utterance.voice = maleVoice;

    synthRef.current.speak(utterance);
  };

  // Play vocal audio with robust multi-mode playback (Direct Audio element -> AudioContext PCM -> Browser Synth)
  const playVocalAudio = (audioUrl?: string, rawPCM?: string) => {
    stopActiveAIVoice();

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.volume = vocalVol / 100;
        audio.play().catch(e => {
          console.warn("Direct vocal audio playback fallback:", e);
          if (rawPCM) playRawPCM(rawPCM);
        });
        return;
      } catch (e) {
        console.warn("HTML5 audio playback initialization failed, using PCM:", e);
      }
    }

    if (rawPCM) {
      playRawPCM(rawPCM);
    }
  };

  const playRawPCM = (base64Data: string, sampleRate = 24000) => {
    try {
      stopActiveAIVoice();
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check if data is already a WAV file (starts with RIFF)
      if (bytes.length > 44 && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF') {
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        audio.volume = vocalVol / 100;
        audio.play().catch(e => console.warn("Blob audio playback warning:", e));
        return;
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
      const buffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
      buffer.getChannelData(0).set(float32Array);

      const source = audioCtx.createBufferSource();
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(vocalVol / 100, audioCtx.currentTime);

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      source.start(0);

      setActiveAudioSource(source);
      setActiveAudioCtx(audioCtx);
    } catch (err) {
      console.error("PCM playback failed:", err);
    }
  };

  const stopActiveAIVoice = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (activeAudioSource) {
      try { activeAudioSource.stop(); } catch (e) {}
      setActiveAudioSource(null);
    }
    if (activeAudioCtx) {
      try { activeAudioCtx.close(); } catch (e) {}
      setActiveAudioCtx(null);
    }
  };

  const speakOrPlayStanza = async (index: number) => {
    const textToSpeak = (lyricsList && lyricsList[index]?.text) || data.lyrics[index]?.text;
    if (!textToSpeak) return;

    const textSignature = textToSpeak.trim().slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    const cacheKey = `${selectedVoice}_${data.songHash || data.title || 'song'}_${index}_${textSignature}`;
    const audioData = stanzaAudios[cacheKey];
    if (audioData && (audioData.audioUrl || audioData.rawPCM)) {
      playVocalAudio(audioData.audioUrl, audioData.rawPCM);
      return;
    }

    // Fast on-demand fetch directly from Gemini TTS in response time
    try {
      const res = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, voice: selectedVoice })
      });
      if (res.ok) {
        const resData = await safeParseJson(res, { audioUrl: null, rawPCM: null });
        if (resData && (resData.audioUrl || resData.rawPCM)) {
          setStanzaAudios(prev => ({
            ...prev,
            [cacheKey]: { audioUrl: resData.audioUrl, rawPCM: resData.rawPCM }
          }));
          playVocalAudio(resData.audioUrl, resData.rawPCM);
          return;
        }
      }
    } catch (e) {
      console.warn("TTS on-demand response-time fetch failed:", e);
    }

    // Fall back to browser speech only if network completely unavailable
    speakTextBrowser(textToSpeak);
  };

  // Pre-fetch AI Vocals for all stanzas using selected singer with concurrent batching
  const fetchAllVocalTTS = async (voiceToUse?: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr') => {
    const voiceParam = voiceToUse || selectedVoice;
    setIsGeneratingVocal(true);

    try {
      const activeLyrics = (lyricsList && lyricsList.length > 0) ? lyricsList : data.lyrics;
      const fetchPromises = activeLyrics.map(async (stanza, i) => {
        const textSignature = (stanza.text || '').trim().slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
        const cacheKey = `${voiceParam}_${data.songHash || data.title || 'song'}_${i}_${textSignature}`;
        if (stanzaAudios[cacheKey]) return; // Already cached!

        try {
          const res = await fetch('/api/tts/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: stanza.text, voice: voiceParam })
          });
          if (res.ok) {
            const resData = await safeParseJson(res, { audioUrl: null, rawPCM: null });
            if (resData && (resData.audioUrl || resData.rawPCM)) {
              setStanzaAudios(prev => ({
                ...prev,
                [cacheKey]: { audioUrl: resData.audioUrl, rawPCM: resData.rawPCM }
              }));
            }
          }
        } catch (e) {
          console.warn(`TTS generation verse ${i} failed:`, e);
        }
      });

      await Promise.all(fetchPromises);
      setIsAIVoiceEnabled(true);
    } catch (err) {
      console.error("Failed to generate TTS vocals:", err);
      setIsAIVoiceEnabled(true);
    } finally {
      setIsGeneratingVocal(false);
    }
  };

  // Switch Voice Model - changes voice in response time, preserves multi-voice cache, and plays immediately
  const handleVoiceChange = (newVoice: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr') => {
    setSelectedVoice(newVoice);
    setVocalSingingAudioUrl(null);
    stopActiveAIVoice();

    const activeKey = `${newVoice}_${activeStanza}`;
    if (stanzaAudios[activeKey]) {
      // Instant switch with zero delay!
      playVocalAudio(stanzaAudios[activeKey].audioUrl, stanzaAudios[activeKey].rawPCM);
    } else {
      // Fetch active stanza first in response time so voice changes immediately
      const textToSpeak = data.lyrics[activeStanza]?.text;
      if (textToSpeak) {
        fetch('/api/tts/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSpeak, voice: newVoice })
        })
          .then(res => res.ok ? safeParseJson<{ audioUrl?: string | null; rawPCM?: string | null }>(res, { audioUrl: null, rawPCM: null }) : null)
          .then(resData => {
            if (resData && (resData.audioUrl || resData.rawPCM)) {
              setStanzaAudios(prev => ({
                ...prev,
                [activeKey]: { audioUrl: resData.audioUrl, rawPCM: resData.rawPCM }
              }));
              playVocalAudio(resData.audioUrl, resData.rawPCM);
            }
          })
          .catch(e => console.warn("Response time voice switch error:", e));
      }
    }

    // Pre-fetch remaining stanzas concurrently
    fetchAllVocalTTS(newVoice);
  };

  // Generate full master song sung exclusively by the selected male vocalist
  const handleGenerateFullSongVocal = async () => {
    setIsGeneratingSinging(true);
    try {
      const activeLyrics = (lyricsList && lyricsList.length > 0) ? lyricsList : data.lyrics;
      const res = await fetch('/api/tts/singing-vocals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          lyrics: activeLyrics,
          voice: selectedVoice,
          style: data.style
        })
      });
      if (!res.ok) {
        const errData = await safeParseJson(res, { error: 'Error al generar canto con IA.' });
        throw new Error(errData?.error || 'Error al generar canto con IA.');
      }
      const resData = await safeParseJson(res, { audioUrl: null, rawPCM: null });
      if (resData && resData.audioUrl) {
        setVocalSingingAudioUrl(resData.audioUrl);
        // Play an immediate sample confirmation
        playVocalAudio(resData.audioUrl, resData.rawPCM);
      }
    } catch (err: any) {
      console.error('Error generating full singing vocals:', err);
    } finally {
      setIsGeneratingSinging(false);
    }
  };

  // Master audio element for real AI generated track playback
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);

  // Toggle Playback - Always prioritizes the authentic generated AI audio recording with Web Audio API fallback & context resume
  const handleTogglePlay = () => {
    // Ensure Web Audio context is initialized and resumed on user interaction
    audioSynth.init();

    const effectiveAudioUrl = lyriaProAudioUrl || lyriaClipAudioUrl || data.proAudioUrl || data.clipAudioUrl || data.audioUrl || vocalSingingAudioUrl;

    if (isPlaying) {
      if (masterAudioRef.current) {
        masterAudioRef.current.pause();
      }
      audioSynth.stop();
      stopActiveAIVoice();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (effectiveAudioUrl) {
        if (!masterAudioRef.current) {
          masterAudioRef.current = new Audio();
          masterAudioRef.current.crossOrigin = "anonymous";
        }
        masterAudioRef.current.src = effectiveAudioUrl;
        masterAudioRef.current.onended = () => setIsPlaying(false);
        masterAudioRef.current.onerror = (e) => {
          console.warn("Audio element load error, falling back to procedural synth:", e);
          audioSynth.play(data.timeSignature || '3/4', data.musicalKey || 'G', playbackSpeed, selectedGenre);
          speakOrPlayStanza(activeStanza);
        };
        masterAudioRef.current.play().catch(err => {
          console.warn("Real audio playback interrupted or blocked, falling back to synth:", err);
          audioSynth.play(data.timeSignature || '3/4', data.musicalKey || 'G', playbackSpeed, selectedGenre);
          speakOrPlayStanza(activeStanza);
        });
      } else {
        // If no master track exists yet, trigger generation and provide live synth
        if (fullTrackTriggerRef.current) {
          fullTrackTriggerRef.current();
        }
        audioSynth.play(data.timeSignature || '3/4', data.musicalKey || 'G', playbackSpeed, selectedGenre);
        speakOrPlayStanza(activeStanza);
      }
    }
  };

  // Handle Genre Change
  const handleGenreSelect = (genre: CorridoGenre) => {
    setSelectedGenre(genre);
    let defaultBpm = 142;
    if (genre === 'gerardo_ortiz') defaultBpm = 144;
    if (genre === 'tumbado') defaultBpm = 136;
    if (genre === 'norteno') defaultBpm = 126;
    if (genre === 'banda') defaultBpm = 140;
    if (genre === 'sierreno') defaultBpm = 128;
    setPlaybackSpeed(defaultBpm);
    setDynamicTempo(defaultBpm);

    if (isPlaying) {
      audioSynth.stop();
      audioSynth.play(data.timeSignature, data.musicalKey, defaultBpm, genre);
    }
  };

  // Helper to convert Base64 Data URL to binary Blob URL for seamless browser playback
  const convertDataUrlToBlobUrl = (dataUrl: string): string => {
    if (!dataUrl.startsWith('data:')) return dataUrl;
    try {
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'audio/wav';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn("Failed to convert data URL to blob URL, returning original:", e);
      return dataUrl;
    }
  };

  // Sync audio URLs and reset vocal caches when song data changes
  useEffect(() => {
    setLyriaProAudioUrl(data.proAudioUrl || null);
    setLyriaClipAudioUrl(data.clipAudioUrl || data.audioUrl || null);
    setLyriaTake2AudioUrl(data.take2AudioUrl || null);
    setVocalSingingAudioUrl(data.vocalAudioUrl || null);
    setStanzaAudios({});
    setActiveStanza(0);
    if (data.lyrics && data.lyrics.length > 0) {
      setLyricsList(data.lyrics);
    }
  }, [data.id, data.songHash, data.title, data.proAudioUrl, data.clipAudioUrl, data.audioUrl, data.take2AudioUrl, data.vocalAudioUrl]);

  // Master Full Track Generator Trigger for Header Action
  const handleGenerateProTrack = async () => {
    if (fullTrackTriggerRef.current) {
      await fullTrackTriggerRef.current();
    }
  };

  // Extend 45s Preview Clip to Full 2-3 Minute Master via FullTrackPlayer independent trigger
  const handleExtendClipToPro = async () => {
    console.log("[StudioDashboard] Extending 45s clip to full 2-3 min master track via FullTrackPlayer...");
    if (fullTrackTriggerRef.current) {
      await fullTrackTriggerRef.current();
    }
  };

  // Export Master Audio File (Lyria 3 Pro Master or Synthesized WAV)
  const handleDownloadWav = async () => {
    setIsExportingWav(true);
    try {
      if (lyriaProAudioUrl) {
        const a = document.createElement('a');
        a.href = lyriaProAudioUrl;
        a.download = `${data.title.replace(/\s+/g, '_')}_Lyria3Pro_Master.mp3`;
        a.click();
        return;
      }
      if (lyriaClipAudioUrl) {
        const a = document.createElement('a');
        a.href = lyriaClipAudioUrl;
        a.download = `${data.title.replace(/\s+/g, '_')}_Lyria3Clip_45s.mp3`;
        a.click();
        return;
      }
      const wavBlob = await audioSynth.renderCorridoWav(data.timeSignature, data.musicalKey, playbackSpeed, selectedGenre, 45);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.title.replace(/\s+/g, '_')}_Master_Estudio.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting WAV:", err);
    } finally {
      setIsExportingWav(false);
    }
  };

  // Concurrent Release Package Export (MP4 Social Video + High-Bitrate Master MP3)
  const handleExportReleasePackage = async () => {
    setIsExportingReleasePackage(true);
    setReleasePackageProgress('Preparando Release Package...');
    try {
      const effectiveAudioUrl = lyriaProAudioUrl || lyriaClipAudioUrl || data.audioUrl || data.proAudioUrl;
      const effectiveCoverUrl = (useAICover && aiCoverUrl) || (canvasRef.current ? canvasRef.current.toDataURL('image/png') : data.imageUrl);

      await executeReleasePackage({
        title: data.title,
        artistTag: data.slangHook || 'El Gallo Negro • Alfredo Medina',
        style: data.style || 'Estilo Gerardo Ortiz (Banda Pesada)',
        tempo: dynamicTempo,
        musicalKey: data.musicalKey || 'Em',
        timeSignature: data.timeSignature || '3/4',
        genre: selectedGenre,
        coverImageUrl: effectiveCoverUrl,
        audioUrl: effectiveAudioUrl,
        onProgress: (msg) => {
          setReleasePackageProgress(msg);
        }
      });
      setTimeout(() => setReleasePackageProgress(null), 4500);
    } catch (err) {
      console.error("Error exporting release package:", err);
      setReleasePackageProgress('Error en exportación de release package');
      setTimeout(() => setReleasePackageProgress(null), 3500);
    } finally {
      setIsExportingReleasePackage(false);
    }
  };

  // Stem Export Handler (Drums, Bass, Melody, Vocals)
  const handleExportStems = async (format: 'zip' | 'json' = 'zip') => {
    setIsExportingStems(true);
    setStemsExportProgress(isEn ? 'Extracting 24-bit PCM stems (Drums, Bass, Melody, Vocals)...' : 'Extrayendo stems 24-bit PCM (Drums, Bass, Melody, Vocals)...');

    try {
      if (format === 'zip') {
        setStemsExportProgress(isEn ? 'Packaging 4 WAV Stems into ZIP Archive...' : 'Empaquetando 4 stems WAV en archivo ZIP...');
        const res = await fetch('/api/export-stems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            style: data.style || selectedGenre,
            tempo: dynamicTempo,
            musicalKey: data.musicalKey || 'G',
            songHash: data.songHash || 'CORR-STEMS',
            format: 'zip',
            durationSec: 120
          })
        });

        if (!res.ok) {
          throw new Error('Failed to create stems ZIP archive.');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = (data.title || 'Master_Track').replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `${cleanTitle}_4Stems_WAV_Pack.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStemsExportProgress(isEn ? 'Stems Archive Downloaded!' : '¡Paquete de Stems Descargado!');
        setTimeout(() => setStemsExportProgress(null), 3500);
      } else {
        const res = await fetch('/api/export-stems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            style: data.style || selectedGenre,
            tempo: dynamicTempo,
            musicalKey: data.musicalKey || 'G',
            songHash: data.songHash || 'CORR-STEMS',
            format: 'json',
            durationSec: 120
          })
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.stems) {
            setStemsData({
              drums: resData.stems.drums,
              bass: resData.stems.bass,
              melody: resData.stems.melody,
              vocals: resData.stems.vocals,
              zipUrl: resData.zipDownloadUrl
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Error exporting stems:', err);
      setStemsExportProgress(isEn ? 'Stem export failed.' : 'Error en exportación de stems.');
      setTimeout(() => setStemsExportProgress(null), 3000);
    } finally {
      setIsExportingStems(false);
    }
  };

  const handleDownloadSingleStem = (stemType: 'drums' | 'bass' | 'melody' | 'vocals') => {
    if (stemsData && stemsData[stemType]?.url) {
      const a = document.createElement('a');
      a.href = stemsData[stemType].url;
      a.download = stemsData[stemType].filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const cleanTitle = (data.title || 'Master_Track').replace(/[^a-zA-Z0-9_-]/g, '_');
      const a = document.createElement('a');
      a.href = `/api/stems/download-zip?title=${encodeURIComponent(cleanTitle)}&tempo=${dynamicTempo}&style=${encodeURIComponent(data.style || selectedGenre)}&key=${encodeURIComponent(data.musicalKey || 'G')}&hash=${encodeURIComponent(data.songHash || 'CORR')}`;
      a.download = `${cleanTitle}_4Stems_WAV_Pack.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Copy Prompt formatted for Suno v3.5 / Udio / AI Song Generators
  const handleCopySunoPrompt = () => {
    const sunoPromptText = `[Title: ${data.title}]
[Style: Regional Mexican, Mexican Corrido, ${selectedGenre.toUpperCase()}, 12-string requinto guitar solo, heavy tuba slap bass, Norteño accordion, male Mexican baritone lead vocal, ${data.tempo}, ${data.musicalKey}]

${data.lyrics.map(l => `[${l.type.toUpperCase()}]\n${l.text}`).join('\n\n')}`;

    navigator.clipboard.writeText(sunoPromptText);
    setCopiedSunoPrompt(true);
    setTimeout(() => setCopiedSunoPrompt(false), 3000);
  };
  // Generate Cover Image
  const handleGenerateAICover = async () => {
    setIsGeneratingCover(true);
    try {
      const res = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPrompt: data.coverPrompt, title: data.title })
      });
      if (res.ok) {
        const coverData = await safeParseJson(res, { imageUrl: '' });
        if (coverData && coverData.imageUrl) {
          setAICoverUrl(coverData.imageUrl);
          setUseAICover(true);
        }
      }
    } catch (err) {
      console.error("Failed to generate AI Cover image:", err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Draw Procedural Canvas Cover
  const drawCoverOnCanvas = (canvas: HTMLCanvasElement, title: string, summary: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const grad = ctx.createRadialGradient(200, 200, 40, 200, 200, 240);
    grad.addColorStop(0, '#5f2120');
    grad.addColorStop(1, '#1c1917');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 380, 380);

    ctx.font = '54px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🤠', 200, 140);

    ctx.font = 'bold 12px "Cinzel", "Playfair Display", serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('EL REY DEL CORRIDO AI - ESTUDIO', 200, 210);

    ctx.font = '900 22px "Cinzel", "Playfair Display", serif';
    ctx.fillStyle = '#fef3c7';
    const cleanTitle = title.replace(/^"|"$/g, '').toUpperCase();
    ctx.fillText(cleanTitle.substring(0, 24), 200, 250);

    ctx.font = 'italic 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#78716c';
    ctx.fillText(`${selectedGenre.toUpperCase()} | ${playbackSpeed} BPM | ${data.musicalKey}`, 200, 310);
  };

  // Download Cover Art
  const handleDownloadCover = () => {
    let downloadUrl = "";
    if (useAICover && aiCoverUrl) downloadUrl = aiCoverUrl;
    else if (canvasRef.current) downloadUrl = canvasRef.current.toDataURL('image/png');

    if (downloadUrl) {
      const link = document.createElement('a');
      link.download = `${data.title.replace(/\s+/g, '_')}_cover.png`;
      link.href = downloadUrl;
      link.click();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* Sleek DAW Studio Header Toolbar */}
      <div className="bg-stone-950 border border-stone-800/80 rounded-xl p-3 md:p-4 mb-6 shadow-2xl flex flex-wrap items-center justify-between gap-3 relative z-30">
        {/* Left: Back Link & Master Track Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-400 font-serif uppercase tracking-wider text-xs font-black rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? 'Back to Composer' : 'Volver al Compositor'}</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stone-900/60 border border-stone-800 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-stone-400 font-bold">MASTER:</span>
            <span className="text-amber-200 truncate max-w-[180px] font-semibold">{data.title}</span>
          </div>
        </div>

        {/* Right: Studio Action Center */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Action: Re-generate Audio */}
          <button
            onClick={handleGenerateProTrack}
            disabled={isGeneratingPro}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md disabled:opacity-50"
            title="Generar nueva pista de audio con el modelo Lyria 3 Pro usando las letras actuales"
          >
            {isGeneratingPro ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 fill-current text-stone-950" />
            )}
            <span>{isGeneratingPro ? (isEn ? 'Generating...' : 'Generando...') : (isEn ? 'Re-generate Audio' : 'Re-generar Audio')}</span>
          </button>

          {/* Primary Action: Release Package */}
          <button
            onClick={handleExportReleasePackage}
            disabled={isExportingReleasePackage}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-amber-500/60 text-amber-300 font-serif font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow hover:border-amber-400 disabled:opacity-50"
            title="Descargar paquete de lanzamiento completo (Video MP4 + Audio MP3)"
          >
            {isExportingReleasePackage ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Package className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isExportingReleasePackage ? (releasePackageProgress || 'Empaquetando...') : '📦 Release (MP4+MP3)'}</span>
          </button>

          {/* Grouped Dropdown: Video & Cinema */}
          <div className="relative">
            <button
              onClick={() => setActiveStudioMenu(activeStudioMenu === 'video' ? null : 'video')}
              className={`px-3 py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStudioMenu === 'video'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                  : 'bg-stone-900 border-stone-700 text-stone-200 hover:border-stone-500'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Video' : 'Video'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {activeStudioMenu === 'video' && (
              <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-amber-500/40 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <button
                  onClick={() => { setShowVeoStudio(true); setActiveStudioMenu(null); }}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-amber-200 cursor-pointer font-medium"
                >
                  <Clapperboard className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-stone-100">Veo 3.1 Fast Video Studio</div>
                    <div className="text-[10px] text-stone-400">Cinemática IA con letras y fotos</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowYouTubeExporter(true); setActiveStudioMenu(null); }}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-stone-200 cursor-pointer font-medium"
                >
                  <Video className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="font-bold text-stone-100">Video YouTube / Shorts</div>
                    <div className="text-[10px] text-stone-400">Exportador 16:9 y 9:16 vertical</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowVideoPlayer(true); setActiveStudioMenu(null); }}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-stone-200 cursor-pointer font-medium"
                >
                  <Film className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-bold text-stone-100">Vista Escenario en Vivo</div>
                    <div className="text-[10px] text-stone-400">Pantalla completa para shows</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Grouped Dropdown: Distribution & Marketing */}
          <div className="relative">
            <button
              onClick={() => setActiveStudioMenu(activeStudioMenu === 'distribution' ? null : 'distribution')}
              className={`px-3 py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStudioMenu === 'distribution'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                  : 'bg-stone-900 border-stone-700 text-stone-200 hover:border-stone-500'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? 'Distribution' : 'Distribución'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {activeStudioMenu === 'distribution' && (
              <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-emerald-500/40 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                {onOpenDeploy && (
                  <button
                    onClick={() => { onOpenDeploy(); setActiveStudioMenu(null); }}
                    className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-emerald-300 cursor-pointer font-medium"
                  >
                    <Rocket className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-stone-100">Distribuir en Canales</div>
                      <div className="text-[10px] text-stone-400">Spotify, YouTube, TikTok y 150+</div>
                    </div>
                  </button>
                )}
                {onOpenDistribution && (
                  <button
                    onClick={() => { onOpenDistribution(); setActiveStudioMenu(null); }}
                    className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-stone-200 cursor-pointer font-medium"
                  >
                    <Disc className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-stone-100">Motor DDEX / Splits & Banco</div>
                      <div className="text-[10px] text-stone-400">ISRC, UPC y regalías oficiales</div>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => { setIsMarketingModalOpen(true); setActiveStudioMenu(null); }}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-stone-200 cursor-pointer font-medium"
                >
                  <Megaphone className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold text-stone-100">Marketing & Separaciones</div>
                    <div className="text-[10px] text-stone-400">Estrategia, TikTok hooks y playlist pitch</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Top Standalone Action Button: Download Stems */}
          <button
            onClick={() => {
              setIsStemsModalOpen(true);
              handleExportStems('json');
            }}
            className="px-3 py-2 text-xs font-serif font-black uppercase tracking-wider rounded-lg border border-amber-500/70 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-400 text-stone-950 flex items-center gap-1.5 cursor-pointer shadow-lg transition-all hover:scale-105"
            title="Descargar Stems Separados (Drums, Bass, Melody, Vocals en WAV)"
          >
            <Layers className="w-4 h-4 text-stone-950" />
            <span>{isEn ? 'Download Stems' : 'Descargar Stems'}</span>
          </button>

          {/* Grouped Dropdown: Studio Tools & Master */}
          <div className="relative">
            <button
              onClick={() => setActiveStudioMenu(activeStudioMenu === 'tools' ? null : 'tools')}
              className={`px-3 py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStudioMenu === 'tools'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                  : 'bg-stone-900 border-stone-700 text-stone-200 hover:border-stone-500'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? 'Tools' : 'Herramientas'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {activeStudioMenu === 'tools' && (
              <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <button
                  onClick={() => {
                    setIsStemsModalOpen(true);
                    handleExportStems('json');
                    setActiveStudioMenu(null);
                  }}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-amber-300 cursor-pointer font-medium"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-stone-100">Exportar Stems (Drums, Bass, Melody, Vocals)</div>
                    <div className="text-[10px] text-stone-400">Pistas WAV 24-bit individuales o archivo ZIP</div>
                  </div>
                </button>
                {onOpenInstrumentalLab && (
                  <button
                    onClick={() => { onOpenInstrumentalLab(); setActiveStudioMenu(null); }}
                    className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-amber-300 cursor-pointer font-medium"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-stone-100">Laboratorio Instrumental IA</div>
                      <div className="text-[10px] text-stone-400">Aislar requintos, tubas y metales</div>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => { handleDownloadWav(); setActiveStudioMenu(null); }}
                  disabled={isExportingWav}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-stone-200 cursor-pointer font-medium"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-stone-100">Descargar Master WAV</div>
                    <div className="text-[10px] text-stone-400">Audio 44.1kHz 24-bit sin compresión</div>
                  </div>
                </button>
                <button
                  onClick={() => { handleCopySunoPrompt(); setActiveStudioMenu(null); }}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-stone-200 cursor-pointer font-medium"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-stone-100">{copiedSunoPrompt ? '¡Prompt Copiado!' : 'Exportar Prompt IA (DAW)'}</div>
                    <div className="text-[10px] text-stone-400">Formato para generadores externos</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Grouped Dropdown: Account & Collaborators */}
          <div className="relative">
            <button
              onClick={() => setActiveStudioMenu(activeStudioMenu === 'account' ? null : 'account')}
              className={`px-3 py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStudioMenu === 'account'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                  : 'bg-stone-900 border-stone-700 text-stone-200 hover:border-stone-500'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>{licenseState?.credits ?? 0} Cr</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {activeStudioMenu === 'account' && (
              <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                {onOpenChannels && (
                  <button
                    onClick={() => { onOpenChannels(); setActiveStudioMenu(null); }}
                    className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-emerald-300 cursor-pointer font-medium"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-stone-100">Mis Canales Conectados</div>
                      <div className="text-[10px] text-stone-400">Spotify & YouTube accounts</div>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => { handleOpenInvite(); setActiveStudioMenu(null); }}
                  className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-stone-200 cursor-pointer font-medium"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-stone-100">Invitar Colaborador</div>
                    <div className="text-[10px] text-stone-400">Enlace de sesión compartida</div>
                  </div>
                </button>
                {onOpenBilling && (
                  <button
                    onClick={() => { onOpenBilling(); setActiveStudioMenu(null); }}
                    className="w-full text-left p-2 hover:bg-stone-800 rounded-lg text-xs flex items-center gap-2 text-amber-300 cursor-pointer font-medium"
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-stone-100">{licenseState?.credits ?? 0} Créditos • Licencias</div>
                      <div className="text-[10px] text-stone-400">Comprar créditos y certificados</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-Studio Producer AI Copilot with Multimodal Chat */}
      <div className="mb-8">
        <StudioAgentCopilot
          songData={{
            ...data,
            lyrics: lyricsList
          }}
          language={language}
          onUpdateLyrics={(newLyrics) => {
            setLyricsList(newLyrics);
          }}
          onUpdateTempo={(newBpm) => {
            const clamped = Math.min(160, Math.max(110, newBpm));
            setDynamicTempo(clamped);
            setPlaybackSpeed(clamped);
          }}
          onUpdateVoice={(v) => {
            handleVoiceChange(v);
          }}
          onUpdateTitle={(newTitle) => {
            data.title = newTitle;
          }}
          onExtendTrack={(seconds) => {
            // Extend with a new energetic instrumental and lyrical stanza
            const extendedStanza: LyricStanza = {
              type: 'verso',
              text: `[Puente Instrumental: Requinto Virtuoso 12 Cuerdas]\nLa historia sigue viva y no se va a borrar,\nel nombre de la empresa siempre va a brillar.\nCon el apoyo firme de toda la plebada,\nla cima es nuestro trono y no la quita nada.`
            };
            setLyricsList(prev => [...prev, extendedStanza]);
          }}
          onRegenerateAudio={() => {
            handleGenerateFullSongVocal();
          }}
        />
      </div>

      {/* Primary Full AI Music Generation Hero Studio Bar with Two Dedicated Play Spots */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 border-2 border-amber-500 p-6 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-amber-900/50 pb-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-stone-950 text-[11px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Consola Dual de Producción Musical Lyria 3 AI
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-amber-100 font-black uppercase tracking-tight">
              {data.title}
            </h3>
            <p className="text-stone-300 text-xs mt-1 max-w-xl leading-relaxed">
              Dos canales independientes de producción conectadas directamente a los modelos <strong>Lyria 3 Pro</strong> (Canción Completa de 2 a 3 minutos) y <strong>Lyria 3 Clip</strong> (Muestra de 45 segundos), con transmisión por streaming HTTP directo sin desconexiones.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400 bg-stone-950/90 px-3 py-1.5 border border-amber-800/60 rounded">
              Estilo: <strong className="text-amber-200 uppercase">{selectedGenre === 'gerardo_ortiz' ? 'Estilo Gerardo Ortiz (Banda Pesada)' : selectedGenre}</strong>
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/90 px-3 py-1.5 border border-amber-700/80 rounded">
              Tempo: <strong className="text-amber-100">{dynamicTempo} BPM</strong> (125-155 BPM)
            </span>
          </div>
        </div>

        {/* Dynamic Tempo & Flow Studio Controller (110 - 160 BPM) */}
        <div className="bg-stone-950/90 border border-amber-800/60 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-500" />
              <span className="font-serif text-xs font-black uppercase tracking-wider text-amber-300">
                Ajuste Dinámico de Tempo y Flow (110 - 160 BPM)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950 px-2 py-0.5 border border-amber-800">
                {dynamicTempo} BPM
              </span>
              <span className="text-[11px] text-stone-400 font-mono">Rango: 110–160 BPM (Máx 160)</span>
            </div>
          </div>

          <input
            type="range"
            min={110}
            max={160}
            step={1}
            value={dynamicTempo}
            onChange={(e) => {
              const bpm = Math.min(160, Math.max(110, parseInt(e.target.value, 10)));
              setDynamicTempo(bpm);
              setPlaybackSpeed(bpm);
            }}
            className="w-full accent-amber-500 bg-stone-900 h-2 rounded cursor-pointer"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5">
            {[
              { bpm: 115, label: '115 BPM: Tumbado Lento' },
              { bpm: 128, label: '128 BPM: Flow Bélico Estándar' },
              { bpm: 144, label: '144 BPM: Banda Pesada / Ortiz' },
              { bpm: 160, label: '160 BPM: Mente Maestra / Furia (Máx 160)' }
            ].map((p) => (
              <button
                key={p.bpm}
                type="button"
                onClick={() => {
                  setDynamicTempo(p.bpm);
                  setPlaybackSpeed(p.bpm);
                }}
                className={`py-1 px-2 text-[10px] font-mono font-bold border transition-colors cursor-pointer text-center ${
                  dynamicTempo === p.bpm
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-amber-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Audio Player Channels: Separated into 2 distinct components with independent API triggers & loading indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Component 1: Full-Length Track Generation (Lyria 3 Pro, 2-3 Minutes) */}
          <FullTrackPlayer
            key={`full_${data.songHash || data.title}_${data.id || ''}`}
            title={data.title}
            lyrics={(lyricsList && lyricsList.length > 0) ? lyricsList : data.lyrics}
            style={data.style || (selectedGenre === 'tumbado' ? 'Bélico' : selectedGenre === 'sierreno' ? 'Sierreño' : selectedGenre === 'norteno' ? 'Norteño Moderno' : 'Banda Sinaloense')}
            tempo={dynamicTempo}
            storySummary={data.storySummary}
            songHash={data.songHash}
            initialAudioUrl={lyriaProAudioUrl}
            onAudioChange={(url) => {
              if (url !== lyriaProAudioUrl) setLyriaProAudioUrl(url);
            }}
            onLoadingChange={(loading) => {
              setIsGeneratingPro((prev) => (prev !== loading ? loading : prev));
            }}
            triggerRef={fullTrackTriggerRef}
            onOpenVideoExporter={() => setShowYouTubeExporter(true)}
            onOpenGiftModal={() => setIsGiftModalOpen(true)}
            onOpenBilling={onOpenBilling}
            onOpenLicense={onOpenLicense}
            onOpenDeploy={onOpenDeploy}
            isUnlocked={isSongUnlocked(data.songHash, licenseState)}
          />

          {/* Component 2: 45-Second Preview Clip (Lyria 3 Clip, 45 Seconds) */}
          <PreviewClipPlayer
            key={`clip_${data.songHash || data.title}_${data.id || ''}`}
            title={data.title}
            lyrics={(lyricsList && lyricsList.length > 0) ? lyricsList : data.lyrics}
            style={data.style || (selectedGenre === 'tumbado' ? 'Bélico' : selectedGenre === 'sierreno' ? 'Sierreño' : selectedGenre === 'norteno' ? 'Norteño Moderno' : 'Banda Sinaloense')}
            tempo={dynamicTempo}
            storySummary={data.storySummary}
            initialAudioUrl={lyriaClipAudioUrl}
            onAudioChange={(url) => {
              if (url !== lyriaClipAudioUrl) setLyriaClipAudioUrl(url);
            }}
            onTake2AudioChange={(url) => {
              if (url !== lyriaTake2AudioUrl) setLyriaTake2AudioUrl(url);
            }}
            onLoadingChange={(loading) => {
              setIsGeneratingClip((prev) => (prev !== loading ? loading : prev));
            }}
            onExtendToFull={handleExtendClipToPro}
            isParentGeneratingPro={isGeneratingPro}
          />
        </div>
      </div>

      {/* High-Precision Master Studio Audio Visualizer Component */}
      <StudioAudioVisualizer
        tempo={dynamicTempo}
        songTitle={data.title}
        style={data.style || 'Regional Mexicano'}
        isSynthPlaying={isPlaying}
      />

      {/* Virtual AI Band Members Stage */}
      <BandStage style={data.style || 'Corrido Norteño'} isPlaying={isPlaying} currentLyricIndex={activeStanza} />

      {/* Style / Genre Selector Tabs */}
      <div className="bg-stone-900 border border-amber-900/30 p-4 mb-8 shadow-xl">
        <span className="block font-serif text-amber-500 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
          <Disc className="w-4 h-4 text-amber-500 animate-spin" /> Selecciona el Arreglo Bélico de Banda en Vivo:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { id: 'modern_banda_belico', label: '🔥 Modern Banda Bélico', desc: 'Requintos 12 cuerdas + Metales en vivo + Tamborazo de concierto + Tarolas militares (144 BPM)' },
            { id: 'grupo_mente_maestra', label: '♟️ Grupo Mente Maestra', desc: 'Requintos dobles a doble púa + Tarola seca militar + Sousafón pesado (146 BPM)' },
            { id: 'gerardo_ortiz', label: '👑 Estilo Gerardo Ortiz', desc: 'Tambora con platillazos + Tarolas militares + Requinto picado en terceras + Tuba en doble golpe (144 BPM)' },
            { id: 'tumbado', label: '⚡ Bélico Tumbado 2026', desc: 'Trombón de vara cortante + Charchetas sincopadas + Docerola picada + Tololoche' },
            { id: 'banda', label: '🎺 Banda Sinaloense Brava', desc: 'Metales pesados + Tambora con platillazos + Tarola militar + Tuba en chuntata' },
            { id: 'sierreno', label: '⛰️ Sierreño Bélico', desc: 'Docerolas en terceras veloces + Batería pesada en vivo + Trombón + Bajo eléctrico' },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => handleGenreSelect(style.id as CorridoGenre)}
              className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                selectedGenre === style.id
                  ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-300 hover:border-stone-700'
              }`}
            >
              <span className="text-xs font-extrabold uppercase tracking-wide">{style.label}</span>
              <span className="text-[10px] text-stone-500 mt-1 leading-tight">{style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cover & Multi-Track Mixer Console (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 border border-amber-900/30 p-6 shadow-xl space-y-6">
          {/* Cover Art Box */}
          <div className="aspect-square w-full relative border border-stone-800 bg-stone-950 flex items-center justify-center overflow-hidden">
            {useAICover && aiCoverUrl ? (
              <img src={aiCoverUrl} alt="Album Art" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <canvas ref={canvasRef} className="w-full h-full" />
            )}

            {isGeneratingCover && (
              <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center text-center p-4">
                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-3" />
                <p className="font-serif text-sm font-bold text-amber-200">PINTANDO COVER CON IA...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-2">
            <button
              onClick={() => setUseAICover(!useAICover)}
              disabled={!aiCoverUrl}
              className="text-[11px] px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-amber-700 text-stone-300 disabled:opacity-50"
            >
              {useAICover ? 'Cover Clásico' : 'Cover de IA'}
            </button>
            <button
              onClick={handleGenerateAICover}
              disabled={isGeneratingCover}
              className="text-[11px] px-3 py-1.5 bg-amber-950/40 border border-amber-800 hover:border-amber-500 text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Pintar Portada IA
            </button>
            <button onClick={handleDownloadCover} className="p-2 bg-stone-950 border border-stone-800 text-stone-300 hover:text-amber-400">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Equalizer Visualizer */}
          <div className="bg-stone-950 border border-stone-800 p-3">
            <span className="block text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> Ecualizador de Espectro en Vivo
            </span>
            <canvas ref={eqCanvasRef} width={300} height={40} className="w-full h-10 bg-stone-900/50" />
          </div>

          {/* Release Package Quick Action Card */}
          <div className="bg-gradient-to-br from-amber-950/60 via-stone-950 to-stone-900 border border-amber-500/50 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" /> Paquete de Lanzamiento (Release Package)
              </span>
              <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.5 uppercase">
                MP4 + MP3
              </span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed mb-3">
              Descarga simultánea: <strong>Video MP4 (1080x1080)</strong> con portada oficial y audio para publicar en <strong>X (Twitter)</strong>, TikTok e Instagram, más el <strong>MP3 de alta fidelidad</strong> para tiendas digitales y streaming.
            </p>
            <button
              onClick={handleExportReleasePackage}
              disabled={isExportingReleasePackage}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md hover:scale-[1.02] disabled:opacity-50"
            >
              {isExportingReleasePackage ? (
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
              ) : (
                <Download className="w-4 h-4 text-stone-950" />
              )}
              <span>{isExportingReleasePackage ? (releasePackageProgress || 'Generando...') : 'Descargar Release Package (MP4 + MP3)'}</span>
            </button>
            {releasePackageProgress && (
              <p className="text-[10px] text-amber-400 mt-2 text-center font-mono animate-pulse">
                {releasePackageProgress}
              </p>
            )}
          </div>

          {/* Multi-Track DAW Mixer Console & Channel Board */}
          <div className="border-t border-stone-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-amber-400 text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" /> Consola Mezcladora Multi-Pista
                </h3>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                  {isEn ? 'Individual Stem Controls & Master FX Rack' : 'Controlador de Stems en Vivo y Mezcla Master'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {soloTrack !== null && (
                  <button
                    onClick={() => setSoloTrack(null)}
                    className="px-2 py-0.5 bg-amber-500 text-stone-950 font-mono text-[9px] font-bold uppercase rounded cursor-pointer animate-pulse"
                  >
                    Reset Solo
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsStemsModalOpen(true);
                    handleExportStems('json');
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-black text-[10px] uppercase rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow"
                >
                  <Layers className="w-3 h-3 text-stone-950" />
                  <span>Stems</span>
                </button>
              </div>
            </div>

            {/* Track Channel Strips */}
            <div className="space-y-3.5 bg-stone-950 p-3.5 border border-stone-800/80 rounded-xl">
              {[
                { id: 'vocal', label: '🎙️ Voz Principal (Cantante)', val: vocalVol, set: setVocalVol, pan: trackPans.vocal, stemKey: 'vocals' as const },
                { id: 'requinto', label: '🎸 Requinto y Guitarras', val: requintoVol, set: setRequintoVol, pan: trackPans.requinto, stemKey: 'melody' as const },
                { id: 'accordion', label: '🪗 Acordeón Norteño', val: accordionVol, set: setAccordionVol, pan: trackPans.accordion, stemKey: 'melody' as const },
                { id: 'brass', label: '🎺 Metales y Charchetas', val: brassVol, set: setBrassVol, pan: trackPans.brass, stemKey: 'melody' as const },
                { id: 'bass', label: '🔊 Tuba y Contrabajo', val: bassVol, set: setBassVol, pan: trackPans.bass, stemKey: 'bass' as const },
                { id: 'drums', label: '🥁 Tarola y Batería', val: drumsVol, set: setDrumsVol, pan: trackPans.drums, stemKey: 'drums' as const },
              ].map((track) => {
                const isSolo = soloTrack === track.id;
                const isMuted = mutedTracks.has(track.id);
                const effectiveVal = getEffectiveTrackVolume(track.id, track.val);

                return (
                  <div key={track.id} className={`p-2.5 bg-stone-900/90 border rounded-lg transition-all ${isSolo ? 'border-amber-500 shadow-md ring-1 ring-amber-500/50' : isMuted ? 'border-stone-800 opacity-60' : 'border-stone-800/80'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-stone-200 text-xs font-bold font-sans flex items-center gap-1.5">
                        {track.label}
                      </span>

                      <div className="flex items-center gap-1.5 font-mono text-[9px]">
                        {/* Solo [S] Button */}
                        <button
                          type="button"
                          onClick={() => toggleSolo(track.id)}
                          className={`px-2 py-0.5 font-bold uppercase rounded transition-colors cursor-pointer ${
                            isSolo ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                          title="Solo track"
                        >
                          S
                        </button>

                        {/* Mute [M] Button */}
                        <button
                          type="button"
                          onClick={() => toggleMute(track.id)}
                          className={`px-2 py-0.5 font-bold uppercase rounded transition-colors cursor-pointer ${
                            isMuted ? 'bg-red-600 text-white font-black' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                          title="Mute track"
                        >
                          M
                        </button>

                        <span className="text-amber-400 font-bold min-w-[28px] text-right">
                          {effectiveVal}%
                        </span>
                      </div>
                    </div>

                    {/* Fader & Dynamic Peak Level Meter */}
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.val}
                        onChange={(e) => track.set(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 accent-amber-500 bg-stone-950 rounded cursor-pointer"
                      />

                      {/* VU Level meter bar */}
                      <div className="h-1 bg-stone-950 rounded overflow-hidden flex items-center">
                        <div 
                          style={{ width: isPlaying && effectiveVal > 0 ? `${Math.min(100, Math.max(10, (effectiveVal / 100) * (60 + Math.random() * 40)))}%` : '0%' }}
                          className={`h-full transition-all duration-150 ${effectiveVal > 85 ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500' : 'bg-emerald-500'}`}
                        />
                      </div>

                      {/* Pan Slider & WAV Download */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span>Pan:</span>
                          <input
                            type="range"
                            min="-50"
                            max="50"
                            value={track.pan}
                            onChange={(e) => setTrackPans(prev => ({ ...prev, [track.id]: parseInt(e.target.value, 10) }))}
                            className="w-16 h-1 accent-cyan-400 bg-stone-950 rounded cursor-pointer"
                          />
                          <span className="text-cyan-400 font-bold">
                            {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(track.pan)}` : `R${track.pan}`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadSingleStem(track.stemKey)}
                          className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          title="Download Stem WAV"
                        >
                          ⬇ WAV
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* In-DAW Master FX Mastering Chain Rack */}
            <div className="bg-stone-950 p-3.5 border border-amber-900/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-serif font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Studio Master FX Chain
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  ● -14 LUFS Spotify Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Tape Saturation:</span>
                    <span className="text-amber-400 font-bold">{tapeSaturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tapeSaturation}
                    onChange={(e) => setTapeSaturation(parseInt(e.target.value, 10))}
                    className="w-full h-1 accent-amber-500 bg-stone-900 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Room Reverb:</span>
                    <span className="text-amber-400 font-bold">{roomReverb}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={roomReverb}
                    onChange={(e) => setRoomReverb(parseInt(e.target.value, 10))}
                    className="w-full h-1 accent-amber-500 bg-stone-900 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Stereo Width:</span>
                    <span className="text-cyan-400 font-bold">{stereoWidth}%</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="200"
                    value={stereoWidth}
                    onChange={(e) => setStereoWidth(parseInt(e.target.value, 10))}
                    className="w-full h-1 accent-cyan-400 bg-stone-900 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Brickwall Limiter:</span>
                    <span className="text-emerald-400 font-bold">-0.1 dB</span>
                  </div>
                  <div className="h-1 bg-emerald-500/80 rounded w-full mt-1.5" />
                </div>
              </div>
            </div>

          </div>

          {/* Voice Character Selection - MEN ONLY */}
          <div className="border-t border-stone-800 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif text-amber-400 text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Voz Masculina de Corrido (Solo Hombres)
              </h4>
              {isGeneratingVocal && (
                <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Cambiando voz...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Fenrir', name: 'El Comandante', badge: 'Bélico Pesado', desc: 'Voz ruda, rasposa y bélica' },
                { id: 'Charon', name: 'Don Vicente', badge: 'Barítono Grave', desc: 'Solemne, profundo y de honor' },
                { id: 'Puck', name: 'El Gavilán', badge: 'Tenor Norteño', desc: 'Enérgico, ágil con flow norteño' },
                { id: 'Zephyr', name: 'El Centauro', badge: 'Campirano', desc: 'Canto campirano melódico' },
              ].map((vc) => (
                <button
                  key={vc.id}
                  onClick={() => handleVoiceChange(vc.id as any)}
                  disabled={isGeneratingVocal}
                  className={`p-2.5 text-left border text-xs cursor-pointer transition-all ${
                    selectedVoice === vc.id
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="block font-bold">{vc.name}</span>
                    <span className="text-[9px] px-1 py-0.5 bg-stone-900 border border-stone-800 text-amber-400 font-mono">
                      {vc.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">{vc.desc}</span>
                </button>
              ))}
            </div>

            {/* Dedicated Button to Generate Full Song AI Singing with the Selected Male Singer */}
            <div className="mt-4 pt-3 border-t border-stone-800/80">
              <button
                type="button"
                disabled={isGeneratingSinging}
                onClick={handleGenerateFullSongVocal}
                className="w-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-black text-xs py-2.5 px-3 uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-500 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isGeneratingSinging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sintetizando Voz con {selectedVoice === 'Fenrir' ? 'El Comandante' : selectedVoice === 'Charon' ? 'Don Vicente' : selectedVoice === 'Puck' ? 'El Gavilán' : 'El Centauro'}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>🎤 Generar Canto con {selectedVoice === 'Fenrir' ? 'El Comandante' : selectedVoice === 'Charon' ? 'Don Vicente' : selectedVoice === 'Puck' ? 'El Gavilán' : 'El Centauro'}</span>
                  </>
                )}
              </button>

              {vocalSingingAudioUrl && (
                <div className="mt-3 p-3 bg-stone-950 border border-amber-600/70">
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-1.5">
                    <span>🎵 Pista Cantada: {data.title} ({selectedVoice})</span>
                    <a
                      href={vocalSingingAudioUrl}
                      download={`${data.title.replace(/\s+/g, '_')}_Voz_${selectedVoice}.mp3`}
                      className="text-[10px] text-amber-400 underline hover:text-amber-200"
                    >
                      Descargar
                    </a>
                  </div>
                  <audio controls src={vocalSingingAudioUrl} className="w-full h-8" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Lyrics Sheet & Live Recorder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Legend Summary */}
          <div className="bg-stone-900 border border-amber-900/20 p-5">
            <h4 className="font-serif text-amber-500 text-xs font-black tracking-widest uppercase mb-1">HISTORIA DE HONOR</h4>
            <p className="text-stone-300 text-sm italic leading-relaxed">"{data.storySummary}"</p>
          </div>

          {/* Lyrics Sheet & Studio Lyric Editor */}
          <div className="bg-stone-900 border border-amber-900/30 shadow-xl">
            <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-serif text-amber-200 font-extrabold text-sm uppercase flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-500 animate-pulse" /> Partitura y Letras
                </span>

                {/* View Switcher: Lyric Editor vs Karaoke */}
                <div className="inline-flex bg-stone-900 border border-stone-800 p-0.5">
                  <button
                    id="btn-toggle-editor"
                    onClick={() => setIsLyricEditingMode(true)}
                    className={`px-3 py-1 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isLyricEditingMode
                        ? 'bg-amber-600 text-stone-950 shadow font-black'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editor de Letras
                  </button>
                  <button
                    id="btn-toggle-karaoke"
                    onClick={() => setIsLyricEditingMode(false)}
                    className={`px-3 py-1 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                      !isLyricEditingMode
                        ? 'bg-amber-600 text-stone-950 shadow font-black'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Disc className="w-3.5 h-3.5" />
                    Karaoke En Vivo
                  </button>
                </div>

                {/* AI Rhyme Finder Quick Launch Button */}
                <button
                  id="btn-open-global-rhyme-finder"
                  type="button"
                  onClick={() => {
                    const fallbackWord = detectedTargetWords[activeStanza]?.word || getFallbackTargetWord(lyricsList[activeStanza]?.text || '');
                    const fallbackLine = detectedTargetWords[activeStanza]?.line || '';
                    setRhymeTarget({
                      stanzaIndex: activeStanza,
                      targetWord: fallbackWord,
                      selectedLine: fallbackLine,
                      lineIndex: detectedTargetWords[activeStanza]?.lineIdx || 0,
                    });
                    setIsRhymeAssistantOpen(true);
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-amber-400"
                  title="Abrir Asistente AI de Rimas Multi-Silábicas y Flow de Personas Rapper"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-950 animate-pulse" />
                  <span>AI Rhyme Finder</span>
                </button>

                {/* Veo 3.1 Fast Video from Lyrics */}
                <button
                  id="btn-open-veo-from-lyrics"
                  type="button"
                  onClick={() => setShowVeoStudio(true)}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-amber-300"
                  title="Generar Video Musical de Alta Producción con Veo 3.1 Fast a partir de estas letras"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-stone-950 fill-current" />
                  <span>🎬 Video Veo 3.1 (Letras / Foto)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 font-black uppercase">
                  {isPlaying ? '🎤 REPRODUCIENDO' : '⏸️ DETENIDO'}
                </span>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-6 max-h-[620px] overflow-y-auto custom-scrollbar bg-stone-900">
              {lyricsList.map((lyr, index) => {
                const isActive = activeStanza === index;
                const isSingleEditing = editingStanzaIdx === index;
                const isEditable = isLyricEditingMode || isSingleEditing;
                const targetWordInfo = detectedTargetWords[index] || {
                  word: getFallbackTargetWord(lyr.text),
                  line: '',
                  lineIdx: 0,
                };

                return (
                  <div
                    key={index}
                    ref={(el) => { stanzaRefs.current[index] = el; }}
                    onClick={() => {
                      setActiveStanza(index);
                      if (isPlaying && !isEditable) speakOrPlayStanza(index);
                    }}
                    className={`p-4 md:p-5 transition-all relative border ${
                      isActive
                        ? 'bg-amber-950/30 border-amber-500 shadow-xl ring-1 ring-amber-500/50 scale-[1.01]'
                        : 'bg-stone-950/40 border-stone-800/60'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-amber-500 text-stone-950 font-serif font-black text-[10px] uppercase tracking-wider rounded-full shadow flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping" />
                        🎤 Karaoke Sync (Cantando Ahora)
                      </div>
                    )}
                    {/* Stanza Header & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xs font-black text-amber-400 uppercase tracking-wider">
                          Sección {index + 1}
                        </span>
                        {lyr.type === 'coro' && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-600 text-stone-950 font-black uppercase tracking-wider">
                            CORO
                          </span>
                        )}
                        {lyr.type === 'verso' && (
                          <span className="text-[10px] px-2 py-0.5 bg-stone-800 text-stone-300 font-bold uppercase tracking-wider">
                            VERSO
                          </span>
                        )}
                        {lyr.type === 'outro' && (
                          <span className="text-[10px] px-2 py-0.5 bg-stone-900 text-amber-500 border border-amber-800 font-bold uppercase tracking-wider">
                            DESPEDIDA
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isLyricEditingMode && (
                          <button
                            id={`btn-edit-stanza-${index}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStanzaIdx(isSingleEditing ? null : index);
                            }}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400" />
                            {isSingleEditing ? 'Ver Karaoke' : 'Editar'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content: Either Editable Textarea with Suggest Rhymes Button OR Karaoke Typography */}
                    {isEditable ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                          {/* Lyric Textarea (8 cols on desktop) */}
                          <div className="lg:col-span-8">
                            <textarea
                              id={`lyric-textarea-${index}`}
                              ref={(el) => { textareaRefs.current[index] = el; }}
                              value={lyr.text}
                              onChange={(e) => {
                                handleUpdateStanzaText(index, e.target.value);
                                updateTargetWordForStanza(index);
                              }}
                              onFocus={() => {
                                setActiveStanza(index);
                                updateTargetWordForStanza(index);
                              }}
                              onKeyUp={() => updateTargetWordForStanza(index)}
                              onMouseUp={() => updateTargetWordForStanza(index)}
                              onSelect={() => updateTargetWordForStanza(index)}
                              rows={4}
                              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 p-3.5 font-serif text-base md:text-lg text-amber-100 leading-relaxed resize-y outline-none transition-all"
                              placeholder="Escribe los versos aquí (ej. octosílabos en rima consonante o asonante)..."
                            />
                            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                              <span>Métrica recomendada: 4 versos en métrica de corrido</span>
                              <span>{lyr.text.split('\n').filter(Boolean).length} líneas</span>
                            </div>
                          </div>

                          {/* Action Sidebar Next to Textarea (4 cols on desktop) */}
                          <div className="lg:col-span-4 bg-stone-950/70 border border-stone-800/80 p-3 space-y-2.5 flex flex-col justify-between">
                            <div>
                              {/* Prominent SUGGEST RHYMES Button */}
                              <button
                                id={`btn-suggest-rhymes-${index}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRhymeAssistantForStanza(index);
                                }}
                                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group"
                                title="Abrir asistente de rimas Gemini para la última palabra de la línea seleccionada"
                              >
                                <Sparkles className="w-4 h-4 text-stone-950 group-hover:rotate-12 transition-transform" />
                                <span>Sugerir Rimas</span>
                              </button>

                              {/* Target Word Preview Badge */}
                              <div className="mt-2 text-left bg-stone-900/90 border border-amber-900/30 p-2 text-xs">
                                <span className="text-[10px] text-stone-400 uppercase font-mono block mb-0.5">
                                  Última palabra detectada:
                                </span>
                                <div className="flex items-center justify-between">
                                  <span className="font-serif font-black text-amber-300 text-sm capitalize">
                                    "{targetWordInfo.word}"
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                                    Línea {(targetWordInfo.lineIdx || 0) + 1}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Additional AI Polish Helper */}
                            <button
                              id={`btn-rewrite-stanza-${index}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRegenerateStanza(index);
                              }}
                              disabled={regeneratingStanzaIdx === index}
                              className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-300 hover:text-amber-300 border border-stone-800 text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Reescribir esta estrofa manteniendo el estilo y puliendo la rima"
                            >
                              {regeneratingStanzaIdx === index ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                              ) : (
                                <RefreshCw className="w-3 h-3 text-amber-500" />
                              )}
                              <span>Reescribir con IA</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Karaoke Mode View */
                      <div className="cursor-pointer">
                        <p
                          className={`font-serif text-lg md:text-xl font-bold leading-relaxed whitespace-pre-line ${
                            isActive ? 'text-amber-100 font-black' : 'text-stone-400'
                          }`}
                        >
                          {lyr.text}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                          <span>Haz clic para escuchar o seleccionar esta sección</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRhymeAssistantForStanza(index);
                            }}
                            className="text-amber-500 hover:text-amber-400 text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" /> Sugerir Rimas
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Concert & Stage Show Interface Modal */}
      {showVideoPlayer && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 md:p-6 overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setShowVideoPlayer(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 text-stone-400 hover:text-amber-300 cursor-pointer bg-stone-900 border border-stone-800 hover:border-amber-500 z-30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full max-w-4xl bg-stone-950 border-2 border-amber-500 shadow-2xl p-5 md:p-8 text-center relative overflow-hidden my-auto">
            {/* Stage Light Simulation Beams */}
            <div className="absolute -top-16 left-1/4 w-80 h-80 bg-amber-500/15 blur-3xl pointer-events-none rounded-full animate-pulse" />
            <div className="absolute -top-16 right-1/4 w-80 h-80 bg-orange-600/15 blur-3xl pointer-events-none rounded-full animate-pulse delay-700" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-950/30 to-transparent pointer-events-none" />

            {/* Stage Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 border-b border-stone-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-600 text-amber-300 text-xs font-serif font-black uppercase tracking-widest shadow">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Show en Vivo • Medina Tech Concert Stage</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 bg-stone-900 border border-stone-700 text-amber-400 font-mono">
                  {dynamicTempo} BPM
                </span>
                <span className="text-[11px] px-2.5 py-0.5 bg-stone-900 border border-stone-700 text-stone-300 font-mono">
                  {data.musicalKey || 'Sol Mayor'}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 bg-amber-950 border border-amber-700 text-amber-300 font-mono font-bold">
                  {selectedVoice}
                </span>
              </div>
            </div>

            {/* Song Title & Hero Display */}
            <h2 className="font-serif text-2xl md:text-4xl text-amber-100 font-black uppercase mb-4 tracking-wide relative z-10 drop-shadow-md">
              {data.title}
            </h2>

            {/* Center Stage & Spinning Master Disc */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6 relative z-10">
              {/* Left Column: Visualizer & Vinyl Artwork (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="w-44 h-44 md:w-52 md:h-52 relative rounded-full border-4 border-amber-500/80 p-2 bg-stone-900 shadow-2xl overflow-hidden ring-4 ring-amber-950">
                  <div className={`w-full h-full rounded-full overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}>
                    {useAICover && aiCoverUrl ? (
                      <img src={aiCoverUrl} alt="Album Art" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-amber-950 via-stone-900 to-amber-900 flex items-center justify-center text-4xl">
                        🤠
                      </div>
                    )}
                  </div>
                </div>

                {/* Animated Spectrum Wave */}
                <div className="flex items-end justify-center gap-1 h-8 mt-4">
                  {[30, 70, 45, 90, 60, 100, 50, 85, 40, 95, 65, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 transition-all duration-200 ${isPlaying ? 'bg-amber-400' : 'bg-stone-800'}`}
                      style={{
                        height: isPlaying ? `${Math.max(20, (h * ((i % 3) + 1) * 0.4) % 100)}%` : '15%',
                        animation: isPlaying ? `pulse 0.${3 + (i % 5)}s infinite alternate` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Lyric Teleprompter (7 cols) */}
              <div className="md:col-span-7 bg-stone-900/90 border border-amber-900/50 p-5 text-left flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-500 font-mono uppercase mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      Teleprompter • Sección {activeStanza + 1} de {lyricsList.length}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 font-black">
                      {lyricsList[activeStanza]?.type.toUpperCase()}
                    </span>
                  </div>

                  <p className="font-serif text-lg md:text-2xl text-amber-200 font-black leading-relaxed italic animate-pulse">
                    "{lyricsList[activeStanza]?.text}"
                  </p>
                </div>

                {/* Stanza Quick Selector Pills */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-stone-800">
                  {lyricsList.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => {
                        setActiveStanza(sIdx);
                        if (isPlaying) speakOrPlayStanza(sIdx);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        activeStanza === sIdx
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-950 text-stone-400 border border-stone-800 hover:border-amber-700'
                      }`}
                    >
                      S{sIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Concert Stage Crowd Reaction Controls & Audio Player */}
            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-stone-800/80 relative z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-black uppercase text-xs md:text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-105"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pausar Show' : 'Iniciar Concierto'}</span>
                </button>

                <button
                  onClick={handleDownloadWav}
                  disabled={isExportingWav}
                  className="px-4 py-3 bg-stone-900 hover:bg-stone-800 border border-amber-700/70 text-amber-300 font-serif font-bold uppercase text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>Descargar WAV</span>
                </button>
              </div>

              {/* Crowd Reaction Sound FX Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-500 font-mono uppercase">Público:</span>
                <button
                  type="button"
                  onClick={() => audioSynth.playGrito('grito_belico')}
                  className="px-2.5 py-1.5 bg-stone-900 hover:bg-amber-950 border border-stone-800 hover:border-amber-600 text-amber-400 text-xs font-bold rounded cursor-pointer transition-colors"
                  title="Grito del Palenque"
                >
                  🤠 ¡Ajúa!
                </button>
                <button
                  type="button"
                  onClick={() => audioSynth.playGrito('grito_culiacan')}
                  className="px-2.5 py-1.5 bg-stone-900 hover:bg-amber-950 border border-stone-800 hover:border-amber-600 text-amber-400 text-xs font-bold rounded cursor-pointer transition-colors"
                  title="Grito Bélico"
                >
                  🔥 ¡Fuego!
                </button>
                <button
                  type="button"
                  onClick={() => audioSynth.playGrito('grito_frontera')}
                  className="px-2.5 py-1.5 bg-stone-900 hover:bg-amber-950 border border-stone-800 hover:border-amber-600 text-amber-400 text-xs font-bold rounded cursor-pointer transition-colors"
                  title="Ovación del Público"
                >
                  👏 Bravo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full YouTube & Shorts Video Exporter Modal */}
      <YouTubeVideoExporter
        isOpen={showYouTubeExporter}
        onClose={() => setShowYouTubeExporter(false)}
        title={data.title}
        storySummary={data.storySummary}
        lyrics={data.lyrics}
        coverImageUrl={useAICover && aiCoverUrl ? aiCoverUrl : undefined}
        audioUrl={lyriaProAudioUrl || lyriaClipAudioUrl || lyriaTake2AudioUrl}
        proAudioUrl={lyriaProAudioUrl}
        clipAudioUrl={lyriaClipAudioUrl}
        take2AudioUrl={lyriaTake2AudioUrl}
        style={selectedGenre}
        tempo={dynamicTempo}
        musicalKey={data.musicalKey || 'Sol Mayor'}
      />

      {/* Invite Collaborator Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-stone-950 border-2 border-amber-600 w-full max-w-md p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-amber-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-900/50 border border-amber-600 text-amber-300">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-amber-100 font-bold uppercase tracking-wider">
                  Invitar Colaborador
                </h3>
                <p className="text-xs text-stone-400">
                  Comparte este enlace para que otros productores o artistas vean este perfil y producción
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                  Enlace Único de Colaboración
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={collabLink}
                    className="w-full bg-stone-900 border border-stone-700 text-amber-100 text-xs px-3 py-2.5 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(collabLink);
                      setCopiedCollab(true);
                      setTimeout(() => setCopiedCollab(false), 2000);
                    }}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {copiedCollab ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCollab ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-amber-950/30 border border-amber-800/40 p-3 text-[11px] text-amber-300/80 leading-relaxed">
                💡 Cualquier colega o productor que abra este enlace podrá revisar los detalles del artista digital, las letras del corrido y escuchar la producción máster.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Veo 3 / Veo 2 Cinema AI Music Video Studio */}
      <VeoMusicVideoStudio
        isOpen={showVeoStudio}
        onClose={() => setShowVeoStudio(false)}
        songData={data}
        onOpenBilling={onOpenBilling}
      />

      {/* Gemini Rhyme Suggester Assistant Modal */}
      <LyricRhymeAssistant
        isOpen={isRhymeAssistantOpen}
        onClose={() => setIsRhymeAssistantOpen(false)}
        targetWord={rhymeTarget?.targetWord || ''}
        selectedLine={rhymeTarget?.selectedLine || ''}
        songTitle={data.title}
        style={data.style}
        storySummary={data.storySummary}
        initialLanguage={data.language || 'es'}
        initialPersona="houston_og"
        onSelectRhyme={handleInsertRhyme}
        onInsertLine={handleInsertPhrase}
      />

      {/* Professional Multi-Track Stems Export Modal */}
      {isStemsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-stone-950 border-2 border-amber-500 w-full max-w-3xl p-6 shadow-2xl relative rounded-xl max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
            <button
              type="button"
              onClick={() => setIsStemsModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-amber-200 cursor-pointer p-1.5 bg-stone-900 border border-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5 border-b border-stone-800 pb-4">
              <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-400 text-stone-950 rounded-xl shadow-lg">
                <Layers className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl text-amber-100 font-black uppercase tracking-wide">
                    {isEn ? 'Studio Stems Exporter' : 'Exportador de Stems Multipista'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-950 border border-amber-600 text-amber-300 font-mono font-bold uppercase rounded">
                    24-Bit / 44.1kHz WAV
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isEn
                    ? `Export individual uncompressed stem tracks for "${data.title}" (${dynamicTempo} BPM • ${data.musicalKey || 'G'})`
                    : `Exporta pistas individuales de alta fidelidad para "${data.title}" (${dynamicTempo} BPM • ${data.musicalKey || 'Sol'})`}
                </p>
              </div>
            </div>

            {/* Export Progress Status Alert */}
            {stemsExportProgress && (
              <div className="mb-5 p-3.5 bg-amber-950/70 border border-amber-500/80 rounded-lg text-amber-200 text-xs flex items-center justify-between shadow">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span className="font-mono font-bold">{stemsExportProgress}</span>
                </div>
              </div>
            )}

            {/* Quick Action Banner: Download All ZIP */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-700/60 p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-md">
                <h4 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  {isEn ? 'Full Stems Studio Zip Bundle' : 'Paquete Completo de Stems (ZIP Archive)'}
                </h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {isEn
                    ? 'Includes Drums, Bass, Melody, and Vocals in separate uncompressed WAV files with tempo & key metadata.'
                    : 'Incluye Batería, Bajo, Melodía y Voz en archivos WAV independientes listos para cualquier DAW profesional.'}
                </p>
              </div>
              <button
                type="button"
                disabled={isExportingStems}
                onClick={() => handleExportStems('zip')}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-lg shadow-xl cursor-pointer flex items-center gap-2 transition-transform hover:scale-105 shrink-0 disabled:opacity-50"
              >
                {isExportingStems ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Download className="w-4 h-4 text-stone-950" />
                )}
                <span>{isEn ? 'Download All Stems (.ZIP)' : 'Descargar Todos los Stems (.ZIP)'}</span>
              </button>
            </div>

            {/* Stems Track Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {/* 1. Drums & Percussion */}
              <div className="bg-stone-900 border border-stone-800 hover:border-amber-700/60 p-4 rounded-xl transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-stone-950 border border-stone-800 text-amber-400 rounded-lg font-mono font-bold text-xs">
                      01
                    </div>
                    <div>
                      <h5 className="font-serif text-sm font-bold text-stone-100 uppercase">
                        {isEn ? 'Drums & Percussion' : 'Batería y Percusión'}
                      </h5>
                      <p className="text-[10px] text-stone-400">Tarolas, Kicks, Tambora & Platillos</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-stone-950 border border-stone-800 text-amber-400 font-mono rounded">
                    WAV 24-bit
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <span className="text-[11px] font-mono text-stone-400">STEM_01_DRUMS.wav</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleStem('drums')}
                    className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-amber-600/60 text-amber-300 hover:text-amber-200 text-xs font-bold uppercase rounded cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>WAV</span>
                  </button>
                </div>
              </div>

              {/* 2. Bass & Tuba */}
              <div className="bg-stone-900 border border-stone-800 hover:border-amber-700/60 p-4 rounded-xl transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-stone-950 border border-stone-800 text-amber-400 rounded-lg font-mono font-bold text-xs">
                      02
                    </div>
                    <div>
                      <h5 className="font-serif text-sm font-bold text-stone-100 uppercase">
                        {isEn ? 'Bass & Tuba / Sub' : 'Bajo, Tuba y Contrabajo'}
                      </h5>
                      <p className="text-[10px] text-stone-400">Tololoche, Tuba Norteña & Sub 808</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-stone-950 border border-stone-800 text-amber-400 font-mono rounded">
                    WAV 24-bit
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <span className="text-[11px] font-mono text-stone-400">STEM_02_BASS.wav</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleStem('bass')}
                    className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-amber-600/60 text-amber-300 hover:text-amber-200 text-xs font-bold uppercase rounded cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>WAV</span>
                  </button>
                </div>
              </div>

              {/* 3. Melody & Instruments */}
              <div className="bg-stone-900 border border-stone-800 hover:border-amber-700/60 p-4 rounded-xl transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-stone-950 border border-stone-800 text-amber-400 rounded-lg font-mono font-bold text-xs">
                      03
                    </div>
                    <div>
                      <h5 className="font-serif text-sm font-bold text-stone-100 uppercase">
                        {isEn ? 'Melody & Harmony' : 'Requintos, Acordeón y Metales'}
                      </h5>
                      <p className="text-[10px] text-stone-400">Guitarras de 12 cuerdas, Acordeón & Brass</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-stone-950 border border-stone-800 text-amber-400 font-mono rounded">
                    WAV 24-bit
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <span className="text-[11px] font-mono text-stone-400">STEM_03_MELODY.wav</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleStem('melody')}
                    className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-amber-600/60 text-amber-300 hover:text-amber-200 text-xs font-bold uppercase rounded cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>WAV</span>
                  </button>
                </div>
              </div>

              {/* 4. Lead Vocals & Acapella */}
              <div className="bg-stone-900 border border-stone-800 hover:border-amber-700/60 p-4 rounded-xl transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-stone-950 border border-stone-800 text-amber-400 rounded-lg font-mono font-bold text-xs">
                      04
                    </div>
                    <div>
                      <h5 className="font-serif text-sm font-bold text-stone-100 uppercase">
                        {isEn ? 'Vocals & Acapella' : 'Voz Principal & Coros'}
                      </h5>
                      <p className="text-[10px] text-stone-400">Voz Cantada IA ({selectedVoice}), Gritos & Ad-libs</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-stone-950 border border-stone-800 text-amber-400 font-mono rounded">
                    WAV 24-bit
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <span className="text-[11px] font-mono text-stone-400">STEM_04_VOCALS.wav</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleStem('vocals')}
                    className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-amber-600/60 text-amber-300 hover:text-amber-200 text-xs font-bold uppercase rounded cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>WAV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* In-Platform First-Class DAW Note */}
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-300/90 leading-relaxed flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isEn
                    ? '💡 Tip: You can also edit, balance, mute, solo, and adjust levels directly inside MelodyCraft Pro without leaving the app!'
                    : '💡 Consejo: También puedes mezclar, silenciar, ecualizar y ajustar volúmenes directamente en MelodyCraft Pro sin necesidad de salir del estudio.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsStemsModalOpen(false)}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold uppercase rounded cursor-pointer shrink-0"
              >
                {isEn ? 'Close' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Separation & Strategy Dossier Modal */}
      <MarketingSeparationModal
        isOpen={isMarketingModalOpen}
        onClose={() => setIsMarketingModalOpen(false)}
        song={data}
      />

      {/* Gift Dedication & Shareable Music Certificate Modal */}
      <GiftDedicationModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        songTitle={data.title}
        senderName={data.protagonistName || 'Tu Amigo Especial'}
        recipientName={data.protagonistName || 'Para Un Ser Querido'}
        occasion="Regalo & Dedicatoria Musical Especial"
        dedicationNote={data.storySummary || "Esta canción fue compuesta con todo el corazón para celebrar la historia, logros y momentos compartidos."}
        audioUrl={lyriaProAudioUrl || lyriaClipAudioUrl || lyriaTake2AudioUrl}
        lyrics={lyricsList || data.lyrics}
        style={data.style || selectedGenre}
        songHash={data.songHash}
      />
    </div>
  );
};
