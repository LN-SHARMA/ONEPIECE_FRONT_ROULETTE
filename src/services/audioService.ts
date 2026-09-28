/**
 * Procedural Pirate Audio Engine (Web Audio API & HTML5 Audio)
 * Features:
 * 1. "Binks' Sake" (ビンクスの酒) Sea Shanty Engine:
 *    - Dual-engine: checks for optional MP3 (`/assets/binks_sake.mp3`) first.
 *    - Procedural Accordion & Pirate Waltz fallback playing the iconic Binks' Sake melody note-for-note.
 * 2. Dynamic SFX: Sword clashes on lock, cannon blasts on assemble, gold chimes on trial.
 */

interface NoteEvent {
  note: number;
  dur: number;
  pauseAfter?: number;
  bass?: number;
}

// Standard concert frequencies
const B3 = 246.94;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00;

/**
 * Authentic "Binks' Sake" (ビンクスの酒) Note Sequence
 * 6/8 Pirate Waltz rhythm with Intro ("Yo-hohoho") and complete Verses
 */
const BINKS_SAKE_MELODY: NoteEvent[] = [
  // --- INTRO: "Yo-hohoho, Yo-ho-ho-ho..." (Measure 1-4) ---
  { note: G4, dur: 0.38, bass: G3 },
  { note: E4, dur: 0.22 },
  { note: G4, dur: 0.22 },
  { note: E4, dur: 0.32 },
  { note: D4, dur: 0.58, bass: D3 },

  { note: G4, dur: 0.38, bass: G3 },
  { note: E4, dur: 0.22 },
  { note: G4, dur: 0.22 },
  { note: E4, dur: 0.32 },
  { note: D4, dur: 0.32 },
  { note: C4, dur: 0.65, bass: C3 },

  { note: G4, dur: 0.38, bass: G3 },
  { note: E4, dur: 0.22 },
  { note: G4, dur: 0.22 },
  { note: E4, dur: 0.32 },
  { note: D4, dur: 0.58, bass: D3 },

  { note: G4, dur: 0.38, bass: G3 },
  { note: E4, dur: 0.22 },
  { note: G4, dur: 0.22 },
  { note: E4, dur: 0.32 },
  { note: D4, dur: 0.32 },
  { note: C4, dur: 0.85, pauseAfter: 200, bass: C3 },

  // --- VERSE 1: "Binkusu no sake wo, todoke ni yuku yo" ---
  { note: E4, dur: 0.32, bass: C3 },
  { note: G4, dur: 0.20 },
  { note: A4, dur: 0.32 },
  { note: G4, dur: 0.20 },
  { note: E4, dur: 0.32, bass: E3 },
  { note: D4, dur: 0.20 },
  { note: C4, dur: 0.32 },
  { note: D4, dur: 0.20 },

  { note: E4, dur: 0.32, bass: C3 },
  { note: G4, dur: 0.20 },
  { note: A4, dur: 0.32 },
  { note: C5, dur: 0.20 },
  { note: D5, dur: 0.52, bass: G3 },
  { note: C5, dur: 0.62 },

  // --- VERSE 2: "Umikaze kimakase, namimakase" ---
  { note: E5, dur: 0.32, bass: C4 },
  { note: D5, dur: 0.20 },
  { note: C5, dur: 0.32 },
  { note: A4, dur: 0.20 },
  { note: C5, dur: 0.32, bass: F3 },
  { note: A4, dur: 0.20 },
  { note: G4, dur: 0.55 },

  { note: A4, dur: 0.32, bass: A3 },
  { note: C5, dur: 0.20 },
  { note: D5, dur: 0.32 },
  { note: E5, dur: 0.20 },
  { note: D5, dur: 0.52, bass: G3 },
  { note: D5, dur: 0.52 },

  // --- VERSE 3: "Shio no mukou wa, yuubi mo sasu yo" ---
  { note: E4, dur: 0.32, bass: C3 },
  { note: G4, dur: 0.20 },
  { note: A4, dur: 0.32 },
  { note: G4, dur: 0.20 },
  { note: E4, dur: 0.32, bass: E3 },
  { note: D4, dur: 0.20 },
  { note: C4, dur: 0.32 },
  { note: D4, dur: 0.20 },

  { note: E4, dur: 0.32, bass: C3 },
  { note: G4, dur: 0.20 },
  { note: A4, dur: 0.32 },
  { note: C5, dur: 0.20 },
  { note: D5, dur: 0.52, bass: G3 },
  { note: C5, dur: 0.62 },

  // --- VERSE 4: "Sora nya wa wo kaku, tori no uta" ---
  { note: E5, dur: 0.32, bass: C4 },
  { note: D5, dur: 0.20 },
  { note: C5, dur: 0.32 },
  { note: A4, dur: 0.20 },
  { note: C5, dur: 0.32, bass: F3 },
  { note: A4, dur: 0.20 },
  { note: G4, dur: 0.32 },
  { note: E4, dur: 0.20 },

  { note: D4, dur: 0.32, bass: G3 },
  { note: E4, dur: 0.20 },
  { note: D4, dur: 0.32 },
  { note: B3, dur: 0.20 },
  { note: C4, dur: 0.95, pauseAfter: 450, bass: C3 },
];

class PirateAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxMuted: boolean = false;
  private bgmMuted: boolean = true;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private shantyTimer: number | null = null;
  private oceanNoiseNode: AudioNode | null = null;
  private isShantyActive: boolean = false;
  private audioEl: HTMLAudioElement | null = null;
  private isUsingAudioFile: boolean = false;

  constructor() {
    // Lazily initialized on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Master SFX Bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : 0.6, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);

        // Master BGM Bus
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmMuted ? 0 : 0.35, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
    this.initContext();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.6, this.ctx.currentTime);
    }
  }

  public getIsSfxMuted(): boolean {
    return this.sfxMuted;
  }

  public setBgmMuted(muted: boolean) {
    this.bgmMuted = muted;
    this.initContext();
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
    if (this.audioEl) {
      this.audioEl.muted = muted;
    }
    if (muted) {
      this.stopSeaShanty();
    } else {
      this.startSeaShanty();
    }
  }

  public getIsBgmMuted(): boolean {
    return this.bgmMuted;
  }

  /**
   * Sword Clash & Lock Sound
   */
  public playSwordClash() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(1420, t);
    osc1.frequency.exponentialRampToValueAtTime(880, t + 0.15);

    osc2.frequency.setValueAtTime(2840, t);
    osc2.frequency.exponentialRampToValueAtTime(1600, t + 0.25);

    gainNode.gain.setValueAtTime(0.7, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.35);
    osc2.stop(t + 0.35);

    this.playNoiseBurst(0.08, 0.4, 3000);
  }

  /**
   * Heavy Cannon Fire Sound
   */
  public playCannon() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.6);

    subGain.gain.setValueAtTime(1.0, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(t);
    subOsc.stop(t + 0.7);

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.8);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 0.8);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.8);
  }

  /**
   * Conqueror's Haki Surge Sound
   */
  public playHakiSurge() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(45, t + 1.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(900, t + 0.4);
    filter.frequency.exponentialRampToValueAtTime(80, t + 1.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.2);
  }

  /**
   * Gold Berries / Coin Chime
   */
  public playCoinChime() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const pitches = [987.77, 1318.51];
    pitches.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  /**
   * Subtle Wooden Ship Deck UI Click
   */
  public playWoodClick() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.05);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  private playNoiseBurst(duration: number, volume: number, highpassFreq: number) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpassFreq, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + duration);
  }

  /**
   * Start "Binks' Sake" (ビンクスの酒)
   * Plays the authentic Binks' Sake pirate melody with accordion + waltz bass + ocean waves.
   * If an MP3 exists at /assets/binks_sake.mp3, it automatically plays the audio file.
   */
  public startSeaShanty() {
    if (this.isShantyActive || this.bgmMuted) return;
    this.initContext();

    this.isShantyActive = true;

    // Check for optional MP3 file first
    if (!this.audioEl && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('/assets/binks_sake.mp3');
        audio.loop = true;
        audio.volume = 0.55;
        this.audioEl = audio;
      } catch (e) {
        this.audioEl = null;
      }
    }

    if (this.audioEl) {
      this.audioEl.play().then(() => {
        this.isUsingAudioFile = true;
      }).catch(() => {
        // Fall back to procedural Binks' Sake synthesis
        this.isUsingAudioFile = false;
        this.startProceduralBinksSake();
      });
    } else {
      this.startProceduralBinksSake();
    }
  }

  /**
   * Procedural Binks' Sake Accordion & Waltz Synthesizer
   */
  private startProceduralBinksSake() {
    if (!this.ctx || !this.bgmGain) return;
    this.startOceanWaves();

    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isShantyActive || this.bgmMuted || !this.ctx || !this.bgmGain) return;

      const event = BINKS_SAKE_MELODY[noteIdx];
      const t = this.ctx.currentTime;

      // 1. Accordion / Concertina Lead Melody
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const melodyGain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(event.note, t);
      osc2.frequency.setValueAtTime(event.note * 2, t); // Octave overtone

      // Warm low-pass filter with slight resonance (accordion body)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, t);
      filter.Q.setValueAtTime(1.8, t);

      melodyGain.gain.setValueAtTime(0, t);
      melodyGain.gain.linearRampToValueAtTime(0.09, t + 0.04);
      melodyGain.gain.exponentialRampToValueAtTime(0.001, t + event.dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(melodyGain);
      melodyGain.connect(this.bgmGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + event.dur);
      osc2.stop(t + event.dur);

      // 2. Pirate 6/8 Waltz Bass Accompaniment (if specified on this measure beat)
      if (event.bass) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(event.bass, t);

        const bassFilter = this.ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(320, t);

        bassGain.gain.setValueAtTime(0.07, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.45);
      }

      noteIdx = (noteIdx + 1) % BINKS_SAKE_MELODY.length;
      const pause = event.pauseAfter || 40;
      const delay = event.dur * 1000 + pause;
      this.shantyTimer = window.setTimeout(playNextNote, delay);
    };

    playNextNote();
  }

  public stopSeaShanty() {
    this.isShantyActive = false;
    if (this.shantyTimer !== null) {
      clearTimeout(this.shantyTimer);
      this.shantyTimer = null;
    }
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch (e) {}
    }
    if (this.oceanNoiseNode) {
      try {
        (this.oceanNoiseNode as AudioScheduledSourceNode).stop();
      } catch (e) {}
      this.oceanNoiseNode = null;
    }
  }

  private startOceanWaves() {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.bgmGain);

    noise.start();
    lfo.start();
    this.oceanNoiseNode = noise;
  }
}

export const pirateAudio = new PirateAudioEngine();
