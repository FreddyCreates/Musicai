import { useState, useEffect } from 'react';
import { ComposerInputs, CorridoData, UserLicenseState, BillingPlanId, DigitalArtistAgent } from './types';
import { CreationForm } from './components/CreationForm';
import { StudioDashboard } from './components/StudioDashboard';
import { InstrumentalStudioLab } from './components/InstrumentalStudioLab';
import { MusicLibraryVault } from './components/MusicLibraryVault';
import { GeminiChatbot } from './components/GeminiChatbot';
import { CreateAccountModal } from './components/CreateAccountModal';
import { BillingModal } from './components/BillingModal';
import { CommercialLicenseBadge } from './components/CommercialLicenseBadge';
import { ConnectedChannelsModal } from './components/ConnectedChannelsModal';
import { DeploySongModal } from './components/DeploySongModal';
import { DigitalArtistsHubModal } from './components/DigitalArtistsHubModal';
import { AgentComputerModal } from './components/AgentComputerModal';
import { VeoMusicVideoStudio } from './components/VeoMusicVideoStudio';
import { QuickTutorialModal } from './components/QuickTutorialModal';
import { MarketingSeparationModal } from './components/MarketingSeparationModal';
import { SovereignDistributionHub } from './components/SovereignDistributionHub';
import { EnterpriseNavbar } from './components/EnterpriseNavbar';
import { SmartLocaleBanner } from './components/SmartLocaleBanner';
import { SunoLandingPage } from './components/SunoLandingPage';
import { CustomInstrumentalModal } from './components/CustomInstrumentalModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ProductionFooter } from './components/ProductionFooter';
import { FEATURED_CORRIDOS } from './data/featuredCorridos';
import { getStoredAgents, getActiveAgent, saveOrUpdateAgent, setActiveAgentId } from './utils/agentStorage';
import { getInitialLicenseState, saveLicenseState, addCreditsAndUnlock } from './utils/billingStorage';
import { customAudioStorage } from './utils/customAudioStorage';
import { safeParseJson } from './utils/apiHelper';
import { AppLanguage, translations } from './utils/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, Sparkles, Award, MapPin, UserPlus, CreditCard, CheckCircle2, X, Radio, Rocket, Share2, Terminal, Database, Film, Clapperboard, ArrowLeft, HelpCircle, BookOpen, Music, Layers } from 'lucide-react';

const LOADING_MESSAGES_EN = [
  "Tuning 12-string docerola high strings...",
  "Synthesizing authentic Sinaloense tuba basslines...",
  "Writing lyrics of grit, honor, and triumph...",
  "Calculating octosyllabic corrido rhyme meters...",
  "Dialing in slap tololoche and military snare rolls...",
  "Querying Medina Tech Dallas sound archives...",
  "Finalizing master stem buffers in Corrido Studio Pro..."
];

const LOADING_MESSAGES_ES = [
  "Afinando las 12 cuerdas de la docerola...",
  "Sintetizando la tuba sinaloense y el tololoche...",
  "Escribiendo los versos de honor, hazaña y valentía...",
  "Calculando la métrica octosílaba del corrido...",
  "Ajustando el tololoche chicoteado y el metraje de la tuba...",
  "Consultando el archivo de Medina Tech en Dallas, TX...",
  "Preparando el estudio de producción Corrido Studio Pro..."
];

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'studio' | 'instrumental' | 'catalog' | 'agents'>('landing');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [activeCorrido, setActiveCorrido] = useState<CorridoData | null>(FEATURED_CORRIDOS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  
  // Billing & License State
  const [licenseState, setLicenseState] = useState<UserLicenseState>(getInitialLicenseState);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isVeoStudioOpen, setIsVeoStudioOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMarketingHubOpen, setIsMarketingHubOpen] = useState(false);
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);
  const [veoStudioSongData, setVeoStudioSongData] = useState<CorridoData | null>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<{ message: string; creditsAdded: number } | null>(null);
  const [isCustomAudioModalOpen, setIsCustomAudioModalOpen] = useState(false);

  // Digital Artist Agents State (Memory Vaults .MD)
  const [isAgentsHubOpen, setIsAgentsHubOpen] = useState(false);
  const [selectedAgentForComputer, setSelectedAgentForComputer] = useState<DigitalArtistAgent | null>(null);
  const [activeAgent, setActiveAgent] = useState<DigitalArtistAgent | undefined>(getActiveAgent);

  const [userProfile, setUserProfile] = useState<{ artistName: string; genre: string; label: string; bio: string; email?: string; avatar?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('corrido_ai_digital_artist');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSelectAgentForStudio = (agent: DigitalArtistAgent) => {
    setActiveAgent(agent);
    setActiveAgentId(agent.id);
  };

  const handleSaveProfile = (profile: { artistName: string; genre: string; label: string; bio: string; email: string; avatar: string }) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('corrido_ai_digital_artist', JSON.stringify(profile));
    } catch (e) {
      console.warn("Could not save profile to localStorage", e);
    }
    // Award 5 Master Credits to the user's account for registration
    const updated = addCreditsAndUnlock('producer_pack' as any, 5, 0);
    setLicenseState(updated);
    setPaymentSuccessToast({
      message: language === 'en'
        ? `Artist Account Activated for ${profile.artistName}! 5 Free Master Credits added.`
        : `¡Cuenta de Artista Activada para ${profile.artistName}! 5 Créditos Master agregados.`,
      creditsAdded: 5
    });
    setTimeout(() => setPaymentSuccessToast(null), 6000);
  };

  // Check URL search parameters on load for completed Stripe Checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const sessionId = urlParams.get('session_id');
    const planId = (urlParams.get('plan_id') as BillingPlanId) || 'single_master';
    const songHash = urlParams.get('song_hash') || undefined;

    if (paymentStatus === 'success' && sessionId) {
      fetch('/api/billing/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, planId, songHash })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const credits = data.planId === 'album_bundle' || data.planId === 'producer_pack' ? 5 : (data.planId === 'enterprise_label' || data.planId === 'label_unlimited') ? 50 : 1;
            const price = data.planId === 'album_bundle' || data.planId === 'producer_pack' ? 24.99 : (data.planId === 'enterprise_label' || data.planId === 'label_unlimited') ? 69.99 : 9.99;
            const updated = addCreditsAndUnlock(data.planId || planId, credits, price, songHash);
            setLicenseState(updated);
            setPaymentSuccessToast({
              message: `Payment successful! Plan activated with ${credits} master credits.`,
              creditsAdded: credits
            });
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => setPaymentSuccessToast(null), 6000);
          }
        })
        .catch(err => {
          console.warn("Could not verify stripe session", err);
        });
    }
  }, []);

  // Cycle loading messages during composition
  useEffect(() => {
    if (!isLoading) return;
    const list = language === 'en' ? LOADING_MESSAGES_EN : LOADING_MESSAGES_ES;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % list.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isLoading, language]);

  const handleComposeCorrido = async (inputs: ComposerInputs) => {
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingMsgIdx(0);

    try {
      const response = await fetch('/api/generate-corrido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inputs,
          requestId: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          seed: Math.floor(Math.random() * 2147483647)
        })
      });

      if (!response.ok) {
        throw new Error(language === 'en' ? 'Could not generate song with AI.' : 'No se pudo generar la canción con IA.');
      }

      const generatedData: CorridoData = await safeParseJson(response, null);
      if (!generatedData || !generatedData.title) {
        throw new Error(language === 'en' ? 'Malformed data returned from AI engine.' : 'Respuesta inválida del motor de composición.');
      }

      // Generate unique song hash for enterprise tracking
      if (!generatedData.songHash) {
        generatedData.songHash = `#CORR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }

      setActiveCorrido(generatedData);
      setCurrentView('studio');

      if (inputs.autoLaunchVideo) {
        setVeoStudioSongData(generatedData);
        setIsVeoStudioOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === 'en' ? 'An unexpected error occurred during synthesis.' : 'Ocurrió un error inesperado al procesar la canción.'));
    } finally {
      setIsLoading(false);
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#090a0f] text-stone-200 font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Toast Notification */}
      {paymentSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-950 border-2 border-emerald-500 text-emerald-100 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wider">{paymentSuccessToast.message}</div>
            <div className="text-[10px] text-emerald-300">+{paymentSuccessToast.creditsAdded} Master Credits added</div>
          </div>
          <button onClick={() => setPaymentSuccessToast(null)} className="text-emerald-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Account Profile Modal */}
      <CreateAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSaveProfile={handleSaveProfile}
        currentProfile={userProfile}
      />

      {/* Connected Channels Modal */}
      <ConnectedChannelsModal
        isOpen={isChannelsModalOpen}
        onClose={() => setIsChannelsModalOpen(false)}
        artistProfile={userProfile}
        onOpenDeployModal={() => {
          setIsChannelsModalOpen(false);
          setIsDeployModalOpen(true);
        }}
      />

      {/* Multi-Channel Distribution Modal */}
      <DeploySongModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        songData={activeCorrido}
        artistProfile={userProfile}
        onOpenChannelsModal={() => {
          setIsDeployModalOpen(false);
          setIsChannelsModalOpen(true);
        }}
      />

      {/* Digital Artists Hub Modal */}
      <DigitalArtistsHubModal
        isOpen={isAgentsHubOpen}
        onClose={() => {
          setIsAgentsHubOpen(false);
          if (currentView === 'agents') setCurrentView('landing');
        }}
        onSelectAgentForStudio={handleSelectAgentForStudio}
        onInjectSongToComposer={(ideaInputs) => {
          setIsAgentsHubOpen(false);
          handleComposeCorrido(ideaInputs as ComposerInputs);
        }}
      />

      {/* Selected Digital Artist Computer Modal */}
      {selectedAgentForComputer && (
        <AgentComputerModal
          isOpen={!!selectedAgentForComputer}
          onClose={() => setSelectedAgentForComputer(null)}
          agent={selectedAgentForComputer}
          onUpdateAgent={(updated) => {
            saveOrUpdateAgent(updated);
            if (activeAgent?.id === updated.id) {
              setActiveAgent(updated);
            }
            setSelectedAgentForComputer(updated);
          }}
          onInjectSongToComposer={(ideaInputs) => {
            setSelectedAgentForComputer(null);
            handleComposeCorrido(ideaInputs as ComposerInputs);
          }}
        />
      )}

      {/* Commercial License Billing Modal */}
      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        licenseState={licenseState}
        currentSongHash={activeCorrido?.songHash}
        onCreditsUpdated={(updated) => setLicenseState(updated)}
      />

      {/* Custom Instrumental / Beat Upload Modal */}
      <CustomInstrumentalModal
        isOpen={isCustomAudioModalOpen}
        onClose={() => setIsCustomAudioModalOpen(false)}
        language={language}
        onLoadTrackToStudio={(song) => {
          setActiveCorrido(song);
          setCurrentView('studio');
        }}
        onComposeLyricsForBeat={(track) => {
          const project = customAudioStorage.createCorridoFromCustomTrack(track);
          setActiveCorrido(project);
          setCurrentView('studio');
        }}
      />

      {/* Single Unified Production Top Navbar */}
      <EnterpriseNavbar
        currentView={currentView === 'catalog' ? 'library' : currentView === 'landing' ? 'home' : currentView}
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        onNavigate={(view) => {
          if (view === 'home') setCurrentView('landing');
          else if (view === 'studio') setCurrentView('studio');
          else if (view === 'instrumental') setCurrentView('instrumental');
          else if (view === 'library') setCurrentView('catalog');
          else if (view === 'agents') {
            setCurrentView('agents');
            setIsAgentsHubOpen(true);
          }
        }}
        onOpenAgentsHub={() => setIsAgentsHubOpen(true)}
        onOpenDistribution={() => setIsDistributionOpen(true)}
        onOpenVeoStudio={() => {
          setVeoStudioSongData(activeCorrido || FEATURED_CORRIDOS[0]);
          setIsVeoStudioOpen(true);
        }}
        onOpenMarketing={() => setIsMarketingHubOpen(true)}
        onOpenBilling={() => setIsBillingModalOpen(true)}
        onOpenChannels={() => setIsChannelsModalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenCustomInstrumental={() => setIsCustomAudioModalOpen(true)}
        activeSong={activeCorrido}
        licenseState={licenseState}
        userProfile={userProfile}
      />

      {/* Smart Welcome Banner (Detects User Locale & Timezone) */}
      <SmartLocaleBanner language={language} />

      {/* Main Body Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 mt-4 pb-28 sm:pb-20">
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-950/40 border border-red-800/60 p-4 max-w-xl mx-auto flex items-start gap-3 text-red-200 mb-6 text-sm rounded-xl shadow-xl"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{language === 'en' ? 'Composition Error:' : 'Error en la composición:'}</span>
                <p className="mt-1 text-red-300/90 text-xs leading-relaxed">{errorMsg}</p>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="mt-3 text-xs text-red-400 underline font-bold uppercase hover:text-red-300 cursor-pointer"
                >
                  {language === 'en' ? 'Dismiss' : 'Cerrar Aviso'}
                </button>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            // Full-screen synthesis screen
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md mx-auto py-24 text-center flex flex-col items-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-amber-600/20 blur-2xl animate-pulse rounded-full" />
                <div className="w-20 h-20 bg-[#11141c] border-2 border-amber-500/50 rounded-2xl flex items-center justify-center relative shadow-2xl">
                  <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                </div>
              </div>

              <h3 className="font-serif text-amber-100 font-extrabold text-xl tracking-wider uppercase mb-2">
                {language === 'en' ? 'Synthesizing Master in MelodyCraft Pro...' : 'MelodyCraft Pro Produciendo...'}
              </h3>

              <div className="h-6 overflow-hidden w-full max-w-xs mt-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMsgIdx}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-amber-400 font-serif italic text-sm tracking-wide"
                  >
                    {(language === 'en' ? LOADING_MESSAGES_EN : LOADING_MESSAGES_ES)[loadingMsgIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="w-56 bg-[#151822] h-1.5 mt-6 border border-[#272d3b] overflow-hidden relative rounded-full">
                <div className="bg-gradient-to-r from-amber-600 to-amber-400 absolute top-0 left-0 bottom-0 animate-progress-loading" />
              </div>
            </motion.div>
          ) : currentView === 'landing' ? (
            // HOME CREATOR VIEW
            <motion.div
              key="landing-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <SunoLandingPage
                language={language}
                onGenerateClip={(inputs) => handleComposeCorrido(inputs)}
                onOpenInStudio={(song) => {
                  setActiveCorrido(song);
                  setCurrentView('studio');
                }}
                onOpenInstrumentalLab={(song) => {
                  setActiveCorrido(song);
                  setCurrentView('instrumental');
                }}
                onOpenDistribution={() => setIsDistributionOpen(true)}
                onOpenAgentsHub={() => setIsAgentsHubOpen(true)}
                onOpenVeoStudio={() => {
                  setVeoStudioSongData(activeCorrido || FEATURED_CORRIDOS[0]);
                  setIsVeoStudioOpen(true);
                }}
                onOpenCustomInstrumentalModal={() => setIsCustomAudioModalOpen(true)}
                isGenerating={isLoading}
                generatedSong={activeCorrido}
              />

              {/* Advanced Pro Parameter Form */}
              <div id="advanced-composer-section" className="pt-6 border-t border-[#1e2330]">
                <div className="text-center mb-6">
                  <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                    {t.advancedModeTitle}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-amber-100 font-bold uppercase mt-1">
                    {t.advancedModeSubtitle}
                  </h3>
                </div>
                <CreationForm 
                  language={language}
                  onSubmit={handleComposeCorrido} 
                  isLoading={isLoading} 
                  activeAgent={activeAgent}
                  onOpenAgentsHub={() => setIsAgentsHubOpen(true)}
                  onOpenAgentComputer={(agent) => setSelectedAgentForComputer(agent)}
                  onOpenMarketingHub={() => setIsMarketingHubOpen(true)}
                />
              </div>
            </motion.div>
          ) : currentView === 'studio' ? (
            // STUDIO DAW VIEW
            <motion.div
              key="studio-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeCorrido ? (
                <StudioDashboard
                  key={activeCorrido.songHash || activeCorrido.title || activeCorrido.id || (activeCorrido as any).requestId || 'active-corrido'}
                  data={activeCorrido}
                  language={language}
                  onBack={() => setCurrentView('landing')}
                  licenseState={licenseState}
                  onOpenBilling={() => setIsBillingModalOpen(true)}
                  onOpenLicense={() => setIsLicenseModalOpen(true)}
                  onOpenDeploy={() => setIsDeployModalOpen(true)}
                  onOpenChannels={() => setIsChannelsModalOpen(true)}
                  onOpenDistribution={() => setIsDistributionOpen(true)}
                  onOpenInstrumentalLab={() => setCurrentView('instrumental')}
                />
              ) : (
                <div className="text-center py-20 bg-[#11141c] border border-[#272d3b] rounded-2xl p-8 space-y-4">
                  <Music className="w-12 h-12 text-amber-400 mx-auto" />
                  <h3 className="font-serif text-xl font-bold text-amber-100 uppercase">
                    {language === 'en' ? 'No track selected in Studio DAW' : 'Ninguna canción seleccionada para el estudio'}
                  </h3>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    {language === 'en' ? 'Pick a track from the Music Library or compose a new track on Home.' : 'Selecciona una canción del catálogo o genera una nueva en el inicio.'}
                  </p>
                  <button
                    onClick={() => {
                      setActiveCorrido(FEATURED_CORRIDOS[0]);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 font-serif font-black text-xs uppercase rounded-xl shadow-lg cursor-pointer transition-all"
                  >
                    {language === 'en' ? `Load Hit: ${FEATURED_CORRIDOS[0].title}` : `Cargar Hit: ${FEATURED_CORRIDOS[0].title}`}
                  </button>
                </div>
              )}
            </motion.div>
          ) : currentView === 'instrumental' ? (
            // DEDICATED AI INSTRUMENTAL STUDIO LAB
            <motion.div
              key="instrumental-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <InstrumentalStudioLab
                songData={activeCorrido || FEATURED_CORRIDOS[0]}
                language={language}
                onBackToStudio={() => setCurrentView('studio')}
                onUpdateSongData={(updated) => setActiveCorrido(updated)}
                onOpenDistribution={() => setIsDistributionOpen(true)}
              />
            </motion.div>
          ) : (
            // DEDICATED MUSIC LIBRARY & HIT VAULT
            <motion.div
              key="catalog-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <MusicLibraryVault
                language={language}
                onSelectSongForStudio={(song) => {
                  setActiveCorrido(song);
                  setCurrentView('studio');
                }}
                onSelectSongForInstrumental={(song) => {
                  setActiveCorrido(song);
                  setCurrentView('instrumental');
                }}
                onOpenDistribution={() => setIsDistributionOpen(true)}
                onOpenVeoStudio={(song) => {
                  setVeoStudioSongData(song);
                  setIsVeoStudioOpen(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Integrated Gemini AI Chatbot */}
      <GeminiChatbot onFillAndSubmit={handleComposeCorrido} activeCorrido={activeCorrido} />

      {/* Next-Gen Veo 3 / Veo 2 Cinema AI Music Video Studio */}
      <VeoMusicVideoStudio
        isOpen={isVeoStudioOpen}
        onClose={() => setIsVeoStudioOpen(false)}
        songData={veoStudioSongData || activeCorrido}
        onOpenBilling={() => setIsBillingModalOpen(true)}
        onSongUpdated={(updatedSong) => {
          setActiveCorrido(updatedSong);
          if (veoStudioSongData && veoStudioSongData.songHash === updatedSong.songHash) {
            setVeoStudioSongData(updatedSong);
          }
        }}
      />

      {/* Marketing Separations & Strategy Dossier Hub Modal */}
      <MarketingSeparationModal
        isOpen={isMarketingHubOpen}
        onClose={() => setIsMarketingHubOpen(false)}
        song={activeCorrido || undefined}
      />

      {/* Quick Tutorial Guided Tour Modal */}
      <QuickTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onOpenAgentsHub={() => setIsAgentsHubOpen(true)}
        onScrollToForm={() => {
          const formEl = document.getElementById('creation-form-container') || document.querySelector('form');
          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenVeoStudio={() => {
          setVeoStudioSongData(activeCorrido || null);
          setIsVeoStudioOpen(true);
        }}
      />

      {/* Sovereign Digital Distribution Hub (DDEX ERN 4.2 / ISRC / UPC / Splits / Bank) */}
      <SovereignDistributionHub
        isOpen={isDistributionOpen}
        onClose={() => setIsDistributionOpen(false)}
        currentSong={activeCorrido}
        artistProfile={userProfile || {
          artistName: 'Alfredo Medina',
          label: 'Sovereign Records LLC',
          email: 'AlfredoJrMedi@gmail.com'
        }}
      />

      {/* Production Midnight & Neon Footer */}
      <ProductionFooter 
        language={language}
        onNavigate={(tab) => {
          if (tab === 'studio') setCurrentView('studio');
          else if (tab === 'instrumentalLab') setCurrentView('instrumental');
          else if (tab === 'library') setCurrentView('catalog');
          else if (tab === 'veo') {
            setVeoStudioSongData(activeCorrido || null);
            setIsVeoStudioOpen(true);
          }
          else if (tab === 'distribution') setIsDistributionOpen(true);
          else if (tab === 'agentsHub') setIsAgentsHubOpen(true);
          else setCurrentView('landing');
        }}
      />

      {/* Mobile-First App Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView === 'catalog' ? 'library' : currentView === 'landing' ? 'home' : currentView}
        language={language}
        onNavigate={(view) => {
          if (view === 'home') setCurrentView('landing');
          else if (view === 'studio') setCurrentView('studio');
          else if (view === 'instrumental') setCurrentView('instrumental');
          else if (view === 'library') setCurrentView('catalog');
          else if (view === 'agents') {
            setCurrentView('agents');
            setIsAgentsHubOpen(true);
          }
        }}
        onOpenDistribution={() => setIsDistributionOpen(true)}
        activeSong={activeCorrido}
      />
    </div>
  );
}
