// High-Fidelity Procedural Web Audio Synthesizer for Authentic Regional Mexican Corridos
// Supports Modern Banda/Bélico, Grupo Mente Maestra, Gerardo Ortiz, Corridos Tumbados 2026, and Banda Sinaloense en Vivo

export type CorridoGenre = 
  | 'modern_banda_belico' 
  | 'live_palenque_banda'
  | 'street_hard_trap_rap'
  | 'reggaeton_dembow'
  | 'electro_corrido'
  | 'pop_acoustic_latino'
  | 'grupo_mente_maestra' 
  | 'gerardo_ortiz' 
  | 'tumbado' 
  | 'banda' 
  | 'norteno' 
  | 'sierreno';

class CorridoSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlayingActive = false;
  private bpm = 142;
  private genre: CorridoGenre = 'modern_banda_belico';
  private style: '3/4' | '2/4' = '3/4';
  private key = 'G';
  private timerId: any = null;
  private currentBeat = 0;
  private nextNoteTime = 0.0;
  private scheduleAheadTime = 0.12;
  private lookahead = 25.0;

  // Analyser node for live studio EQ visualizer
  public analyserNode: AnalyserNode | null = null;

  // Volume Gain Nodes
  private masterGain: GainNode | null = null;
  private requintoGain: GainNode | null = null;
  private accordionGain: GainNode | null = null;
  private brassGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private drumsGain: GainNode | null = null;
  private vocalGain: GainNode | null = null;

  // Volume state (0.0 to 1.0)
  public requintoVol = 0.98;
  public accordionVol = 0.55;
  public brassVol = 0.65;
  public bassVol = 0.95;
  public drumsVol = 0.95;
  public vocalVol = 0.95;

  // Key frequencies for I, IV, V progressions
  private getChordData(keyStr: string, step: number) {
    const keysMap: Record<string, { chords: Array<{ bass: number[]; chord: number[]; lead: number[]; vocalMelody: number[] }> }> = {
      'G': {
        chords: [
          // I: G Major
          { bass: [98.0, 146.8, 196.0], chord: [196.0, 246.9, 293.7, 392.0], lead: [392.0, 493.8, 587.3, 784.0], vocalMelody: [392.0, 440.0, 493.8, 587.3] },
          // IV: C Major
          { bass: [130.8, 196.0, 261.6], chord: [261.6, 329.6, 392.0, 523.2], lead: [523.2, 659.2, 784.0, 1046.5], vocalMelody: [523.2, 587.3, 659.2, 784.0] },
          // V: D Major
          { bass: [146.8, 220.0, 293.7], chord: [293.7, 369.9, 440.0, 587.3], lead: [587.3, 739.9, 880.0, 1174.6], vocalMelody: [587.3, 659.2, 739.9, 880.0] }
        ]
      },
      'C': {
        chords: [
          // I: C Major
          { bass: [130.8, 196.0, 261.6], chord: [261.6, 329.6, 392.0, 523.2], lead: [523.2, 659.2, 784.0, 1046.5], vocalMelody: [261.6, 329.6, 392.0, 523.2] },
          // IV: F Major
          { bass: [87.3, 130.8, 174.6], chord: [174.6, 220.0, 261.6, 349.2], lead: [349.2, 440.0, 523.2, 698.4], vocalMelody: [349.2, 440.0, 523.2, 698.4] },
          // V: G Major
          { bass: [98.0, 146.8, 196.0], chord: [196.0, 246.9, 293.7, 392.0], lead: [392.0, 493.8, 587.3, 784.0], vocalMelody: [392.0, 493.8, 587.3, 784.0] }
        ]
      },
      'D': {
        chords: [
          // I: D Major
          { bass: [146.8, 220.0, 293.7], chord: [293.7, 369.9, 440.0, 587.3], lead: [587.3, 739.9, 880.0, 1174.6], vocalMelody: [293.7, 369.9, 440.0, 587.3] },
          // IV: G Major
          { bass: [98.0, 146.8, 196.0], chord: [196.0, 246.9, 293.7, 392.0], lead: [392.0, 493.8, 587.3, 784.0], vocalMelody: [392.0, 493.8, 587.3, 784.0] },
          // V: A Major
          { bass: [110.0, 164.8, 220.0], chord: [220.0, 277.2, 329.6, 440.0], lead: [440.0, 554.3, 659.2, 880.0], vocalMelody: [440.0, 554.3, 659.2, 880.0] }
        ]
      },
      'Am': {
        chords: [
          // I: A Minor
          { bass: [110.0, 164.8, 220.0], chord: [220.0, 261.6, 329.6, 440.0], lead: [440.0, 523.2, 659.2, 880.0], vocalMelody: [220.0, 261.6, 329.6, 440.0] },
          // IV: D Minor
          { bass: [146.8, 220.0, 293.7], chord: [293.7, 349.2, 440.0, 587.3], lead: [587.3, 698.4, 880.0, 1174.6], vocalMelody: [293.7, 349.2, 440.0, 587.3] },
          // V: E7
          { bass: [82.4, 123.5, 164.8], chord: [164.8, 207.7, 246.9, 329.6], lead: [329.6, 415.3, 493.8, 659.2], vocalMelody: [329.6, 415.3, 493.8, 659.2] }
        ]
      }
    };

    // Traditional Corrido progression: I - I - IV - IV - V - V - I - I (8 bar loop)
    const progression = [0, 0, 1, 1, 2, 2, 0, 0];
    const bar = Math.floor(step / (this.style === '3/4' ? 3 : 2)) % 8;
    const chordIndex = progression[bar];
    const map = keysMap[keyStr] || keysMap['G'];
    return map.chords[chordIndex];
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create Spectrum Analyser
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      // Create Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      // Instrument gains
      this.requintoGain = this.ctx.createGain();
      this.requintoGain.gain.setValueAtTime(this.requintoVol, this.ctx.currentTime);
      this.requintoGain.connect(this.masterGain);

      this.accordionGain = this.ctx.createGain();
      this.accordionGain.gain.setValueAtTime(this.accordionVol, this.ctx.currentTime);
      this.accordionGain.connect(this.masterGain);

      this.brassGain = this.ctx.createGain();
      this.brassGain.gain.setValueAtTime(this.brassVol, this.ctx.currentTime);
      this.brassGain.connect(this.masterGain);

      this.bassGain = this.ctx.createGain();
      this.bassGain.gain.setValueAtTime(this.bassVol, this.ctx.currentTime);
      this.bassGain.connect(this.masterGain);

      this.drumsGain = this.ctx.createGain();
      this.drumsGain.gain.setValueAtTime(this.drumsVol, this.ctx.currentTime);
      this.drumsGain.connect(this.masterGain);

      this.vocalGain = this.ctx.createGain();
      this.vocalGain.gain.setValueAtTime(this.vocalVol, this.ctx.currentTime);
      this.vocalGain.connect(this.masterGain);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(instr: 'requinto' | 'accordion' | 'brass' | 'bass' | 'drums' | 'vocal' | 'master', val: number) {
    const volume = Math.max(0, Math.min(1, val));
    if (instr === 'requinto') this.requintoVol = volume;
    if (instr === 'accordion') this.accordionVol = volume;
    if (instr === 'brass') this.brassVol = volume;
    if (instr === 'bass') this.bassVol = volume;
    if (instr === 'drums') this.drumsVol = volume;
    if (instr === 'vocal') this.vocalVol = volume;

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (instr === 'requinto' && this.requintoGain) this.requintoGain.gain.setValueAtTime(volume, now);
    if (instr === 'accordion' && this.accordionGain) this.accordionGain.gain.setValueAtTime(volume, now);
    if (instr === 'brass' && this.brassGain) this.brassGain.gain.setValueAtTime(volume, now);
    if (instr === 'bass' && this.bassGain) this.bassGain.gain.setValueAtTime(volume, now);
    if (instr === 'drums' && this.drumsGain) this.drumsGain.gain.setValueAtTime(volume, now);
    if (instr === 'vocal' && this.vocalGain) this.vocalGain.gain.setValueAtTime(volume, now);
    if (instr === 'master' && this.masterGain) this.masterGain.gain.setValueAtTime(volume * 0.7, now);
  }

  // 1. Synthesize Web Audio Singing Vocal Lead (Pitched Male Vocal Formants)
  private playSingingVocalNote(freq: number, time: number, duration = 0.35) {
    if (!this.ctx || !this.vocalGain) return;

    // Male Baritone/Tenor Formant Filters (F1 ~ 500Hz, F2 ~ 1000Hz for "Aah" vowel)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator(); // Vibrato LFO
    const lfoGain = this.ctx.createGain();
    
    const f1 = this.ctx.createBiquadFilter();
    const f2 = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Subtle pitch vibrato (5Hz)
    lfo.frequency.setValueAtTime(5.2, time);
    lfoGain.gain.setValueAtTime(freq * 0.012, time);
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 0.998, time);

    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(520, time);
    f1.Q.setValueAtTime(3.5, time);

    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1050, time);
    f2.Q.setValueAtTime(3.0, time);

    // Envelope
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.06);
    gain.gain.setValueAtTime(0.35, time + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(f1);
    osc2.connect(f2);
    f1.connect(gain);
    f2.connect(gain);
    gain.connect(this.vocalGain);

    lfo.start(time);
    osc1.start(time);
    osc2.start(time);

    lfo.stop(time + duration + 0.05);
    osc1.stop(time + duration + 0.05);
    osc2.stop(time + duration + 0.05);
  }

  // 2. Synthesize Booming Tuba / Tololoche Bass
  private playTubaNote(freq: number, time: number, isSlap = false) {
    if (!this.ctx || !this.bassGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Deep brassy sawtooth + pitch bend down for authentic tuba "whomp"
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 1.05, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.exponentialRampToValueAtTime(120, time + 0.38);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.95, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.48);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bassGain);

    osc.start(time);
    osc.stop(time + 0.52);

    // If Slap Tololoche, add percussive wooden click on top
    if (isSlap) {
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1400, time);
      clickOsc.frequency.exponentialRampToValueAtTime(220, time + 0.02);
      clickGain.gain.setValueAtTime(0.35, time);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
      clickOsc.connect(clickGain);
      clickGain.connect(this.bassGain);
      clickOsc.start(time);
      clickOsc.stop(time + 0.05);
    }
  }

  // 3. Synthesize High-Speed Double Requinto (12-String Docerola Picado / Karplus-Strong Modeling)
  private playRequintoArpeggio(notes: number[], time: number) {
    if (!this.ctx || !this.requintoGain) return;

    notes.forEach((freq, i) => {
      const startTime = time + i * 0.065;
      
      // Physical acoustic guitar string model using noise burst + delay feedback
      const bufferSize = Math.max(2, Math.floor(this.ctx!.sampleRate / freq));
      const noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1; // Pluck noise excitation
      }

      const whiteNoiseSource = this.ctx!.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;

      // Body acoustic wood resonance filter
      const bodyFilter = this.ctx!.createBiquadFilter();
      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(1400, startTime);
      bodyFilter.Q.setValueAtTime(2.2, startTime);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.65, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      // Stereo panning for dual guitars
      const panner = this.ctx!.createStereoPanner ? this.ctx!.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(i % 2 === 0 ? -0.35 : 0.35, startTime);
      }

      // Main metallic steel string oscillator + decay
      const stringOsc = this.ctx!.createOscillator();
      stringOsc.type = 'sawtooth';
      stringOsc.frequency.setValueAtTime(freq, startTime);

      const stringFilter = this.ctx!.createBiquadFilter();
      stringFilter.type = 'lowpass';
      stringFilter.frequency.setValueAtTime(3200, startTime);
      stringFilter.frequency.exponentialRampToValueAtTime(500, startTime + 0.32);

      stringOsc.connect(stringFilter);
      stringFilter.connect(gain);

      whiteNoiseSource.connect(bodyFilter);
      bodyFilter.connect(gain);

      if (panner) {
        gain.connect(panner);
        panner.connect(this.requintoGain!);
      } else {
        gain.connect(this.requintoGain!);
      }

      whiteNoiseSource.start(startTime);
      stringOsc.start(startTime);
      stringOsc.stop(startTime + 0.38);
    });
  }

  // 3b. High-Speed 12-String Requinto Picado (Veloz, Picado en Terceras, Estilo Gerardo Ortiz)
  private playRequintoPicado(notes: number[], time: number) {
    if (!this.ctx || !this.requintoGain) return;

    // Fast 16th note scale runs
    notes.forEach((freq, idx) => {
      const noteTime = time + idx * 0.048;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      // Sharp metallic docerola string
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.98, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq, noteTime + 0.012);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3600, noteTime); // High bite presence for docerola
      filter.Q.setValueAtTime(2.4, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.85, noteTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.requintoGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.17);
    });
  }

  // 4. Synthesize Norteño Accordion (Dual Detuned Musette Reeds)
  private playAccordionChord(notes: number[], time: number) {
    if (!this.ctx || !this.accordionGain) return;

    notes.forEach((freq) => {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(freq, time);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.012, time); // Musette detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1250, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.22, time + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.48);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.accordionGain!);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.52);
      osc2.stop(time + 0.52);
    });
  }

  // 5. Synthesize Bélico Layered Brass Section Hits (Layered Trompeta & Trombón de Vara)
  private playBandaBrassStab(notes: number[], time: number) {
    if (!this.ctx || !this.brassGain) return;

    notes.forEach((freq) => {
      // 1. Trombón de Vara layer (Punchy low-mid brass body)
      const trombonOsc = this.ctx!.createOscillator();
      const trombonGain = this.ctx!.createGain();
      const trombonFilter = this.ctx!.createBiquadFilter();

      trombonOsc.type = 'sawtooth';
      trombonOsc.frequency.setValueAtTime(freq * 0.99, time);
      trombonOsc.frequency.exponentialRampToValueAtTime(freq, time + 0.02);

      trombonFilter.type = 'lowpass';
      trombonFilter.frequency.setValueAtTime(2200, time);
      trombonFilter.Q.setValueAtTime(2.2, time);

      trombonGain.gain.setValueAtTime(0.001, time);
      trombonGain.gain.linearRampToValueAtTime(0.38, time + 0.015);
      trombonGain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

      trombonOsc.connect(trombonFilter);
      trombonFilter.connect(trombonGain);
      trombonGain.connect(this.brassGain!);

      trombonOsc.start(time);
      trombonOsc.stop(time + 0.32);

      // 2. Piercing Trompeta layer (Bright high-frequency brass bite, layered 1 octave higher)
      const trompetaOsc = this.ctx!.createOscillator();
      const trompetaGain = this.ctx!.createGain();
      const trompetaFilter = this.ctx!.createBiquadFilter();

      trompetaOsc.type = 'sawtooth';
      trompetaOsc.frequency.setValueAtTime(freq * 2.01, time);

      trompetaFilter.type = 'bandpass';
      trompetaFilter.frequency.setValueAtTime(3800, time);
      trompetaFilter.Q.setValueAtTime(3.0, time);

      trompetaGain.gain.setValueAtTime(0.001, time);
      trompetaGain.gain.linearRampToValueAtTime(0.32, time + 0.012);
      trompetaGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      trompetaOsc.connect(trompetaFilter);
      trompetaFilter.connect(trompetaGain);
      trompetaGain.connect(this.brassGain!);

      trompetaOsc.start(time);
      trompetaOsc.stop(time + 0.28);
    });
  }

  // 6. Synthesize Drums (Kick / Tambora, Snare / Tarola, Hi-Hat, Repiques, Platillazos, 808 Sub-Bass, Claps & Concert Ambience)
  private playPercussion(type: 'kick' | 'snare' | 'hihat' | 'tarola_roll' | 'tambora_crash' | 'tarola_crack' | 'street_808' | 'street_clap' | 'trap_hihat_roll' | 'palenque_cheer' | 'stage_shout', time: number) {
    if (!this.ctx || !this.drumsGain) return;

    if (type === 'street_808') {
      // Menacing Booming 808 Sub-Bass with Slide / Distortion
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const waveShaper = this.ctx.createWaveShaper();

      // Soft saturation curve for 808 punch
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = Math.tanh(x * 1.5);
      }
      waveShaper.curve = curve;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(88, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.08);
      osc.frequency.linearRampToValueAtTime(26, time + 0.55); // Heavy sliding tail

      gain.gain.setValueAtTime(1.0, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.65);

      osc.connect(waveShaper);
      waveShaper.connect(gain);
      gain.connect(this.bassGain || this.drumsGain);
      osc.start(time);
      osc.stop(time + 0.70);
    } else if (type === 'street_clap') {
      // Hard layered street trap clap
      [0, 0.011, 0.022].forEach((offset, idx) => {
        const hitTime = time + offset;
        const bufferSize = Math.floor(this.ctx!.sampleRate * 0.12);
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx!.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1150, hitTime);
        filter.Q.setValueAtTime(1.8, hitTime);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(idx === 2 ? 0.85 : 0.35, hitTime);
        gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.drumsGain!);
        noise.start(hitTime);
        noise.stop(hitTime + 0.16);
      });
    } else if (type === 'trap_hihat_roll') {
      // Rapid 32nd triplet trap hi-hat roll
      [0, 0.024, 0.048, 0.072].forEach((offset, idx) => {
        const hitTime = time + offset;
        const bufferSize = Math.floor(this.ctx!.sampleRate * 0.025);
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx!.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500 + idx * 400, hitTime); // Pitch-bent roll

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.28 + idx * 0.08, hitTime);
        gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.035);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.drumsGain!);
        noise.start(hitTime);
        noise.stop(hitTime + 0.04);
      });
    } else if (type === 'palenque_cheer') {
      // Roaring live concert crowd roar / cheer ambient sweep
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.55);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(800, time + 0.5);
      filter.Q.setValueAtTime(0.9, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.32, time + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.52);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || this.drumsGain);
      noise.start(time);
      noise.stop(time + 0.55);
    } else if (type === 'stage_shout') {
      // Authentic concert vocal animator shout ("¡Échele!", "¡Ánimo!")
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, time);
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.22);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, time);
      filter.Q.setValueAtTime(3.5, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.38, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.vocalGain || this.drumsGain);
      osc.start(time);
      osc.stop(time + 0.28);
    } else if (type === 'tambora_crash') {
      // 1. Massive Banda Tambora Punch + Sub Thump
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(160, time);
      kickOsc.frequency.exponentialRampToValueAtTime(46, time + 0.18);

      kickGain.gain.setValueAtTime(1.0, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

      kickOsc.connect(kickGain);
      kickGain.connect(this.drumsGain);
      kickOsc.start(time);
      kickOsc.stop(time + 0.30);

      // 2. Exploding Crash Cymbal Strike ("Platillazo")
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const crashNoise = this.ctx.createBufferSource();
      crashNoise.buffer = buffer;
      const crashFilter = this.ctx.createBiquadFilter();
      crashFilter.type = 'highpass';
      crashFilter.frequency.setValueAtTime(6500, time);

      const crashGain = this.ctx.createGain();
      crashGain.gain.setValueAtTime(0.45, time);
      crashGain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

      crashNoise.connect(crashFilter);
      crashFilter.connect(crashGain);
      crashGain.connect(this.drumsGain);
      crashNoise.start(time);
      crashNoise.stop(time + 0.34);
    } else if (type === 'tarola_crack') {
      // Crisp Cracking Rimshot Tarolazo (Gerardo Ortiz / Banda Brava)
      const rimOsc = this.ctx.createOscillator();
      const rimGain = this.ctx.createGain();
      rimOsc.type = 'triangle';
      rimOsc.frequency.setValueAtTime(280, time);
      rimOsc.frequency.exponentialRampToValueAtTime(140, time + 0.05);

      rimGain.gain.setValueAtTime(0.8, time);
      rimGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      rimOsc.connect(rimGain);
      rimGain.connect(this.drumsGain);
      rimOsc.start(time);
      rimOsc.stop(time + 0.09);

      // Snappy noise snap
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.75, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.drumsGain);
      noise.start(time);
      noise.stop(time + 0.17);
    } else if (type === 'tarola_roll') {
      // Rapid-fire 4-stroke double roll
      [0, 0.028, 0.056, 0.084].forEach((offset, idx) => {
        const hitTime = time + offset;
        const bufferSize = Math.floor(this.ctx!.sampleRate * 0.06);
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx!.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1100, hitTime);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.35 + idx * 0.12, hitTime); // Crescendo
        gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.drumsGain!);
        noise.start(hitTime);
        noise.stop(hitTime + 0.06);
      });
    } else if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.15);

      gain.gain.setValueAtTime(0.95, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(gain);
      gain.connect(this.drumsGain);
      osc.start(time);
      osc.stop(time + 0.25);
    } else if (type === 'snare') {
      const bufferSize = this.ctx.sampleRate * 0.14;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(900, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.55, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.drumsGain);

      noise.start(time);
      noise.stop(time + 0.18);
    } else if (type === 'hihat') {
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5200, time);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.drumsGain);
      noise.start(time);
      noise.stop(time + 0.05);
    }
  }

  private scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.advanceBeat();
    }
  }

  private scheduleNote(beat: number, time: number) {
    const chord = this.getChordData(this.key, beat);

    // Play Web Audio Singing Vocal Note matching the beat line
    const vocalNote = chord.vocalMelody[beat % chord.vocalMelody.length];
    this.playSingingVocalNote(vocalNote, time, 0.35);

    if (this.genre === 'live_palenque_banda') {
      // En Vivo Desde el Palenque: Live Concert Atmosphere, Roaring Crowd Cheers, Stage Animator Shouts, Massive Tamborazo & Screaming Horns
      if (beat % 12 === 0) {
        this.playPercussion('palenque_cheer', time);
      }
      if (beat % 8 === 4) {
        this.playPercussion('stage_shout', time);
      }

      if (this.style === '3/4') {
        const beatInBar = beat % 3;
        if (beatInBar === 0) {
          // Beat 1: Heavy Concert Tambora + Piercing Cymbal Crash + Slapping Tuba + Live Requinto Lead
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tambora_crash', time);
          this.playRequintoPicado(chord.lead, time);
          this.playPercussion('hihat', time);
        } else if (beatInBar === 1) {
          // Beat 2: Live Tarola Crack + Screaming Trombones & Charchetas + 12-string Run
          this.playPercussion('tarola_crack', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        } else if (beatInBar === 2) {
          // Beat 3: Second Bass Note + Double Horn Blast + Tarola Remate on Turnarounds
          this.playTubaNote(chord.bass[1], time, false);
          this.playBandaBrassStab(chord.chord, time);
          if (beat % 6 === 2) {
            this.playPercussion('tarola_roll', time);
          } else {
            this.playPercussion('tarola_crack', time);
          }
          this.playRequintoPicado(chord.lead.slice(1), time);
        }
      } else {
        // 2/4 Fast Polka Palenque Live
        const beatInBar = beat % 2;
        if (beatInBar === 0) {
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tambora_crash', time);
          this.playRequintoPicado(chord.lead, time);
        } else {
          this.playPercussion('tarola_crack', time);
          this.playPercussion('tarola_roll', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        }
      }
    } else if (this.genre === 'street_hard_trap_rap') {
      // Hard-Hitting Street Rap & Menacing 808 Trap (Metro / 21 Savage / Dark Beats / No Pop)
      const beatInBar = beat % 4;
      if (beatInBar === 0) {
        // Beat 1: Heavy 808 Sub-Bass Slide + Trap Hihat Roll + Dark Minor Lead Stab
        this.playPercussion('street_808', time);
        this.playPercussion('trap_hihat_roll', time);
        this.playRequintoPicado([chord.lead[0], chord.lead[2]], time);
      } else if (beatInBar === 1) {
        // Beat 2: Hard Snare / Street Clap + Triplet Hi-Hats
        this.playPercussion('street_clap', time);
        this.playPercussion('trap_hihat_roll', time);
      } else if (beatInBar === 2) {
        // Beat 3: Secondary 808 Slide Drop + Pitch-Bent Hihats
        if (beat % 8 === 2) {
          this.playPercussion('street_808', time);
        }
        this.playPercussion('trap_hihat_roll', time);
        this.playRequintoArpeggio(chord.lead.slice(1, 3), time);
      } else if (beatInBar === 3) {
        // Beat 4: Hard Layered Street Clap + Fast Trap Roll
        this.playPercussion('street_clap', time);
        this.playPercussion('trap_hihat_roll', time);
      }
    } else if (this.genre === 'reggaeton_dembow') {
      // Reggaeton Perreo & Latin Urban: Classic 4/4 syncopated Dembow kick & snare pattern + 808 sub bass
      const beatInBar = beat % 4;
      if (beatInBar === 0) {
        // Beat 1: Heavy Low-end Dembow Kick + 808 Sub + Synth Chords
        this.playPercussion('kick', time);
        this.playPercussion('street_808', time);
        this.playRequintoArpeggio(chord.lead.slice(0, 2), time);
        this.playPercussion('hihat', time);
      } else if (beatInBar === 1) {
        // Beat 2: Syncopated Dembow Snare / Rimshot + Kick
        this.playPercussion('kick', time);
        this.playPercussion('snare', time + 0.04);
        this.playPercussion('hihat', time);
      } else if (beatInBar === 2) {
        // Beat 3: Heavy Kick + Sub Bass Pulse
        this.playPercussion('kick', time);
        this.playRequintoPicado(chord.lead.slice(1, 3), time);
        this.playPercussion('hihat', time);
      } else if (beatInBar === 3) {
        // Beat 4: Syncopated Dembow Snare Remate + Hihat
        this.playPercussion('kick', time);
        this.playPercussion('snare', time + 0.04);
        this.playPercussion('hihat', time);
      }
    } else if (this.genre === 'electro_corrido') {
      // Electro Corrido EDM: 128 BPM 4-on-the-floor kick + rolling 16th hats + 12-string requinto stabs
      this.playPercussion('kick', time);
      this.playPercussion('trap_hihat_roll', time);
      if (beat % 2 === 1) {
        this.playPercussion('street_clap', time);
      }
      this.playRequintoPicado(chord.lead, time);
      if (beat % 4 === 0) {
        this.playPercussion('street_808', time);
      }
    } else if (this.genre === 'pop_acoustic_latino') {
      // Pop Regional & Balada Romántica: Gentle acoustic guitar strumming & warm bass
      const beatInBar = beat % 4;
      if (beatInBar === 0) {
        this.playTubaNote(chord.bass[0], time, false);
        this.playPercussion('kick', time);
        this.playRequintoArpeggio(chord.chord, time);
      } else if (beatInBar === 1) {
        this.playPercussion('hihat', time);
        this.playRequintoArpeggio(chord.lead.slice(0, 2), time);
      } else if (beatInBar === 2) {
        this.playTubaNote(chord.bass[1], time, false);
        this.playRequintoArpeggio(chord.chord, time);
      } else if (beatInBar === 3) {
        this.playPercussion('hihat', time);
        this.playRequintoArpeggio(chord.lead.slice(1, 3), time);
      }
    } else if (this.genre === 'modern_banda_belico') {
      // Modern Banda / Bélico en Vivo: High-energy live concert, fast 12-string requinto double-picking, explosive brass section bursts & live percussion
      if (this.style === '3/4') {
        const beatInBar = beat % 3;
        if (beatInBar === 0) {
          // Beat 1: Explosive Tamborazo + Platillazo Cymbal Crash + Slapping Tuba/Sousafón + Fast 12-String Requinto Picado
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tambora_crash', time);
          this.playRequintoPicado(chord.lead, time);
          this.playPercussion('hihat', time);
        } else if (beatInBar === 1) {
          // Beat 2: Cracking Live Tarola Rimshot + Screaming Brass Section Burst (Trombones & Charchetas) + 12-string Arpeggio
          this.playPercussion('tarola_crack', time);
          this.playPercussion('hihat', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        } else if (beatInBar === 2) {
          // Beat 3: Secondary Tuba Walking Note + Piercing Brass Blast + Live Tarola Redoble/Remate on turnarounds
          this.playTubaNote(chord.bass[1], time, false);
          this.playBandaBrassStab(chord.chord, time);
          if (beat % 6 === 2) {
            this.playPercussion('tarola_roll', time);
          } else {
            this.playPercussion('tarola_crack', time);
          }
          this.playRequintoPicado(chord.lead.slice(1), time);
        }
      } else {
        // 2/4 Fast Polka Bélica (Live Concert Banda Tempo)
        const beatInBar = beat % 2;
        if (beatInBar === 0) {
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tambora_crash', time);
          this.playRequintoPicado(chord.lead, time);
        } else {
          this.playPercussion('tarola_crack', time);
          this.playPercussion('tarola_roll', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        }
      }
    } else if (this.genre === 'grupo_mente_maestra') {
      // Grupo Mente Maestra Signature 2026: Fast 12-string double-picking, dry military tarola snaps, deep sousaphone
      if (this.style === '3/4') {
        const beatInBar = beat % 3;
        if (beatInBar === 0) {
          // Beat 1: Booming Sousafón Slap + Dry Tarola Snap + Fast 16th-note Requinto Picado
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tarola_crack', time);
          this.playRequintoPicado(chord.lead, time);
          this.playPercussion('hihat', time);
        } else if (beatInBar === 1) {
          // Beat 2: Snappy Tarola Crack + Piercing Charchetas + Rapid Requinto Arpeggio
          this.playPercussion('tarola_crack', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        } else if (beatInBar === 2) {
          // Beat 3: Secondary Bass + High-speed Requinto Arpeggio + Tarola Roll on every 2nd bar
          this.playTubaNote(chord.bass[1], time, false);
          this.playBandaBrassStab(chord.chord, time);
          if (beat % 6 === 2) {
            this.playPercussion('tarola_roll', time);
          } else {
            this.playPercussion('tarola_crack', time);
          }
          this.playRequintoPicado(chord.lead.slice(1), time);
        }
      } else {
        // 2/4 Fast Polka (Mente Maestra Bélico)
        const beatInBar = beat % 2;
        if (beatInBar === 0) {
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tarola_crack', time);
          this.playRequintoPicado(chord.lead, time);
        } else {
          this.playPercussion('tarola_crack', time);
          this.playPercussion('tarola_roll', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        }
      }
    } else if (this.genre === 'gerardo_ortiz' || this.genre === 'banda') {
      // High-Energy Banda Pesada / Gerardo Ortiz Arranging (Fast, Heavy Drums & Tarolas)
      if (this.style === '3/4') {
        const beatInBar = beat % 3;
        if (beatInBar === 0) {
          // Beat 1: Heavy Tamborazo + Platillazo Crash + Tuba en Doble Golpe + Requinto Picado
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tambora_crash', time);
          this.playRequintoPicado(chord.lead, time);
        } else if (beatInBar === 1) {
          // Beat 2: Cracking Tarola Rimshot + Piercing Brass Stabs (Charchetas) + Requinto
          this.playPercussion('tarola_crack', time);
          this.playPercussion('hihat', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        } else if (beatInBar === 2) {
          // Beat 3: Secondary Tuba + Charcheta + Tarola Roll on transitional bars
          this.playTubaNote(chord.bass[1], time, false);
          this.playBandaBrassStab(chord.chord, time);
          if (beat % 6 === 2) {
            this.playPercussion('tarola_roll', time);
          } else {
            this.playPercussion('hihat', time);
          }
        }
      } else {
        // 2/4 Fast Polka Corrido (Banda Brava)
        const beatInBar = beat % 2;
        if (beatInBar === 0) {
          this.playTubaNote(chord.bass[0], time, true);
          this.playPercussion('tambora_crash', time);
          this.playRequintoPicado(chord.lead, time);
        } else {
          this.playPercussion('tarola_crack', time);
          this.playBandaBrassStab(chord.chord, time);
          this.playRequintoArpeggio(chord.chord.slice(0, 3), time);
        }
      }
    } else if (this.style === '3/4') {
      const beatInBar = beat % 3;
      if (beatInBar === 0) {
        // Beat 1: Booming Bass + Kick + Requinto Lead
        this.playTubaNote(chord.bass[0], time, true);
        this.playPercussion('kick', time);
        if (this.genre === 'tumbado' || this.genre === 'sierreno') {
          this.playRequintoArpeggio(chord.lead.slice(0, 3), time);
        } else if (this.genre === 'norteno') {
          this.playAccordionChord(chord.chord, time);
        }
      } else if (beatInBar === 1) {
        // Beat 2: Snare / Tarola + Offbeat Stabs
        this.playPercussion('snare', time);
        this.playPercussion('hihat', time);
        if (this.genre === 'norteno') {
          this.playAccordionChord(chord.chord, time);
        } else {
          this.playRequintoArpeggio(chord.chord.slice(0, 2), time);
        }
      } else if (beatInBar === 2) {
        // Beat 3: Secondary Bass + Hihat + Strum
        this.playTubaNote(chord.bass[1], time);
        this.playPercussion('hihat', time);
        if (this.genre === 'tumbado') {
          this.playRequintoArpeggio(chord.lead.slice(1, 4), time);
        } else {
          this.playAccordionChord(chord.chord, time);
        }
      }
    } else {
      // 2/4 Polka Corrido (Bélico 2026 Style)
      const beatInBar = beat % 2;
      if (beatInBar === 0) {
        this.playTubaNote(chord.bass[0], time, true);
        this.playPercussion('kick', time);
        this.playPercussion('hihat', time);
        this.playRequintoArpeggio(chord.lead, time);
      } else {
        this.playPercussion('snare', time);
        this.playPercussion('hihat', time);
        if (this.genre === 'norteno') {
          this.playAccordionChord(chord.chord, time);
        }
      }
    }
  }

  private advanceBeat() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat++;
  }

  public play(styleStr: string, keyStr: string, bpmVal: number, genreType?: CorridoGenre) {
    this.init();
    if (this.isPlayingActive) return;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const lowerStyle = (styleStr || '').toLowerCase();
    let detectedGenre: CorridoGenre = genreType || 'modern_banda_belico';
    if (!genreType) {
      if (lowerStyle.includes('reggaeton') || lowerStyle.includes('perreo') || lowerStyle.includes('dembow') || lowerStyle.includes('bad bunny') || lowerStyle.includes('feid')) {
        detectedGenre = 'reggaeton_dembow';
      } else if (lowerStyle.includes('electro') || lowerStyle.includes('steve aoki') || lowerStyle.includes('deorro') || lowerStyle.includes('edm')) {
        detectedGenre = 'electro_corrido';
      } else if (lowerStyle.includes('pop') || lowerStyle.includes('balada') || lowerStyle.includes('romántica') || lowerStyle.includes('romantica') || lowerStyle.includes('carín') || lowerStyle.includes('carin')) {
        detectedGenre = 'pop_acoustic_latino';
      } else if (lowerStyle.includes('palenque') || lowerStyle.includes('concierto') || lowerStyle.includes('público') || lowerStyle.includes('gritos')) {
        detectedGenre = 'live_palenque_banda';
      } else if (lowerStyle.includes('rap corrido') || lowerStyle.includes('santa fe') || lowerStyle.includes('aleman') || lowerStyle.includes('alemán') || lowerStyle.includes('hard-hitting') || lowerStyle.includes('street rap') || lowerStyle.includes('menacing') || lowerStyle.includes('drill') || lowerStyle.includes('21 savage') || (lowerStyle.includes('trap') && !lowerStyle.includes('pop'))) {
        detectedGenre = 'street_hard_trap_rap';
      } else if (lowerStyle.includes('modern banda') || lowerStyle.includes('bélico') || lowerStyle.includes('belico') || lowerStyle.includes('metales') || lowerStyle.includes('tamborazo')) {
        detectedGenre = 'modern_banda_belico';
      } else if (lowerStyle.includes('mente maestra') || lowerStyle.includes('mente')) {
        detectedGenre = 'grupo_mente_maestra';
      } else if (lowerStyle.includes('gerardo') || lowerStyle.includes('ortiz') || lowerStyle.includes('progresivo') || lowerStyle.includes('pesad')) {
        detectedGenre = 'gerardo_ortiz';
      } else if (lowerStyle.includes('banda')) {
        detectedGenre = 'modern_banda_belico';
      } else if (lowerStyle.includes('norteño') || lowerStyle.includes('norteno')) {
        detectedGenre = 'norteno';
      } else if (lowerStyle.includes('sierreño') || lowerStyle.includes('sierreno')) {
        detectedGenre = 'sierreno';
      } else {
        detectedGenre = 'modern_banda_belico';
      }
    }

    let effectiveBpm = bpmVal || (
      detectedGenre === 'reggaeton_dembow' ? 96 :
      detectedGenre === 'electro_corrido' ? 128 :
      detectedGenre === 'pop_acoustic_latino' ? 116 :
      detectedGenre === 'live_palenque_banda' ? 144 :
      detectedGenre === 'street_hard_trap_rap' ? 138 :
      detectedGenre === 'modern_banda_belico' ? 142 :
      detectedGenre === 'grupo_mente_maestra' ? 146 :
      detectedGenre === 'gerardo_ortiz' ? 144 : 128
    );
    this.bpm = Math.min(160, Math.max(70, effectiveBpm));
    this.genre = detectedGenre;
    this.style = styleStr.includes('2/4') ? '2/4' : '3/4';

    const normalizedKey = keyStr.replace(/[^a-zA-Z]/g, '');
    if (['G', 'C', 'D', 'Am'].includes(normalizedKey)) {
      this.key = normalizedKey;
    } else {
      this.key = 'G';
    }

    this.isPlayingActive = true;
    this.currentBeat = 0;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    const runScheduler = () => {
      this.scheduler();
      this.timerId = setTimeout(runScheduler, this.lookahead);
    };

    runScheduler();
  }

  public stop() {
    if (!this.isPlayingActive) return;
    this.isPlayingActive = false;
    clearTimeout(this.timerId);
    this.timerId = null;
  }

  public stopPlaying() {
    this.stop();
  }

  public setTempo(bpm: number) {
    this.bpm = Math.min(180, Math.max(60, bpm));
  }

  public setKey(keyStr: string) {
    const normalizedKey = keyStr.replace(/[^a-zA-Z]/g, '');
    if (['G', 'C', 'D', 'Am'].includes(normalizedKey)) {
      this.key = normalizedKey;
    }
  }

  public startPlaying(styleStr: string, keyStr: string, bpmVal: number, genreType?: CorridoGenre) {
    this.play(styleStr, keyStr, bpmVal, genreType);
  }

  public isPlaying() {
    return this.isPlayingActive;
  }

  // 7. OfflineAudioContext Studio Master WAV Exporter
  public async renderCorridoWav(styleStr: string, keyStr: string, bpmVal: number, genreType: CorridoGenre = 'tumbado', durationSecs = 45): Promise<Blob> {
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSecs, sampleRate);

    // Build offline gain nodes
    const master = offlineCtx.createGain();
    master.gain.value = 0.8;
    master.connect(offlineCtx.destination);

    const bassGain = offlineCtx.createGain();
    bassGain.gain.value = this.bassVol;
    bassGain.connect(master);

    const requintoGain = offlineCtx.createGain();
    requintoGain.gain.value = this.requintoVol;
    requintoGain.connect(master);

    const drumsGain = offlineCtx.createGain();
    drumsGain.gain.value = this.drumsVol;
    drumsGain.connect(master);

    const bpm = bpmVal || 125;
    const style = styleStr.includes('2/4') ? '2/4' : '3/4';
    const secondsPerBeat = 60.0 / bpm;
    const totalBeats = Math.floor(durationSecs / secondsPerBeat);

    const normalizedKey = keyStr.replace(/[^a-zA-Z]/g, '');
    const validKey = ['G', 'C', 'D', 'Am'].includes(normalizedKey) ? normalizedKey : 'G';

    for (let beat = 0; beat < totalBeats; beat++) {
      const time = beat * secondsPerBeat;
      const chord = this.getChordData(validKey, beat);

      // Tuba Bass
      const osc = offlineCtx.createOscillator();
      const filter = offlineCtx.createBiquadFilter();
      const gain = offlineCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(chord.bass[0] * 1.04, time);
      osc.frequency.exponentialRampToValueAtTime(chord.bass[0], time + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, time);
      filter.frequency.exponentialRampToValueAtTime(120, time + 0.35);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.85, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(bassGain);
      osc.start(time);
      osc.stop(time + 0.48);

      // Requinto Guitarras
      chord.lead.forEach((freq, i) => {
        const startTime = time + i * 0.075;
        const stringOsc = offlineCtx.createOscillator();
        const stringFilter = offlineCtx.createBiquadFilter();
        const stringGain = offlineCtx.createGain();

        stringOsc.type = 'sawtooth';
        stringOsc.frequency.setValueAtTime(freq, startTime);
        stringFilter.type = 'lowpass';
        stringFilter.frequency.setValueAtTime(2600, startTime);
        stringFilter.frequency.exponentialRampToValueAtTime(400, startTime + 0.3);

        stringGain.gain.setValueAtTime(0.001, startTime);
        stringGain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        stringGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        stringOsc.connect(stringFilter);
        stringFilter.connect(stringGain);
        stringGain.connect(requintoGain);
        stringOsc.start(startTime);
        stringOsc.stop(startTime + 0.3);
      });

      // Drums
      if (beat % (style === '3/4' ? 3 : 2) === 0) {
        const kickOsc = offlineCtx.createOscillator();
        const kickGain = offlineCtx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(120, time);
        kickOsc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
        kickGain.gain.setValueAtTime(0.8, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        kickOsc.connect(kickGain);
        kickGain.connect(drumsGain);
        kickOsc.start(time);
        kickOsc.stop(time + 0.2);
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();

    // Convert AudioBuffer to WAV Blob
    const numOfChan = renderedBuffer.numberOfChannels;
    const length = renderedBuffer.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);

    let offset = 0;
    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }
    };

    writeString('RIFF');
    view.setUint32(offset, length - 8, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size
    view.setUint16(offset, 1, true); offset += 2; // AudioFormat (PCM)
    view.setUint16(offset, numOfChan, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * 2 * numOfChan, true); offset += 4;
    view.setUint16(offset, numOfChan * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2; // BitsPerSample
    writeString('data');
    view.setUint32(offset, length - offset - 4, true); offset += 4;

    const channels = [];
    for (let i = 0; i < numOfChan; i++) {
      channels.push(renderedBuffer.getChannelData(i));
    }

    let pos = 0;
    while (pos < renderedBuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][pos]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
      pos++;
    }

    return new Blob([outBuffer], { type: 'audio/wav' });
  }

  // Play realistic procedural grito and crowd cheers
  public playGrito(type: 'grito_belico' | 'grito_culiacan' | 'grito_frontera' | string = 'grito_belico') {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const now = this.ctx.currentTime;

      // Vocal formant vocalizer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.0, now);

      if (type === 'grito_culiacan') {
        // High pitched fiery yell
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.85);

        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(2800, now + 0.35);
      } else if (type === 'grito_frontera') {
        // Deep crowd ovation
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.6);

        filter.frequency.setValueAtTime(900, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
      } else {
        // Classic Ajúa
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(410, now + 0.9);

        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.4);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.15);
    } catch (e) {
      console.warn('Could not synthesize grito:', e);
    }
  }
}

export const audioSynth = new CorridoSynthesizer();

