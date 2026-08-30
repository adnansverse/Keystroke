import { SwitchSoundProfile } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private volume: number = 50;
  private profile: SwitchSoundProfile = 'thock';

  public setConfig(sound: boolean, volume: number, profile: SwitchSoundProfile) {
    this.isMuted = !sound;
    this.volume = volume;
    this.profile = profile;
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.generateNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private generateNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public playClick(isSpaceOrEnter: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const vol = (this.volume / 100) * 0.85;
    if (vol <= 0) return;

    try {
      const now = this.ctx.currentTime;
      const pitchJitter = 0.94 + Math.random() * 0.12;

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(vol, now);
      master.connect(this.ctx.destination);

      // Layer 1: Switch Stem Snap / Tactile Noise Burst
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        if (this.profile === 'clicky') {
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime((isSpaceOrEnter ? 2400 : 3800) * pitchJitter, now);
          noiseFilter.Q.setValueAtTime(4.5, now);
        } else {
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.setValueAtTime((isSpaceOrEnter ? 1200 : 2200) * pitchJitter, now);
        }

        const noiseGain = this.ctx.createGain();
        const noiseVol = this.profile === 'clicky' ? 0.45 : 0.22;
        noiseGain.gain.setValueAtTime(noiseVol, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpaceOrEnter ? 0.025 : 0.014));

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);

        noise.start(now);
        noise.stop(now + 0.03);
      }

      // Layer 2: Housing Impact ("Thock" / "Clack")
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = this.profile === 'clicky' ? 'triangle' : 'sine';

      let startFreq = isSpaceOrEnter ? 180 : 320;
      let endFreq = isSpaceOrEnter ? 45 : 75;

      if (this.profile === 'clack') {
        startFreq *= 1.4;
        endFreq *= 1.35;
      } else if (this.profile === 'thock') {
        startFreq *= 0.85;
        endFreq *= 0.8;
      }

      startFreq *= pitchJitter;
      endFreq *= pitchJitter;

      const dur = isSpaceOrEnter ? 0.048 : 0.028;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

      oscGain.gain.setValueAtTime(0.75, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      const bodyFilter = this.ctx.createBiquadFilter();
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(isSpaceOrEnter ? 650 : 1100, now);

      osc.connect(oscGain);
      oscGain.connect(bodyFilter);
      bodyFilter.connect(master);

      osc.start(now);
      osc.stop(now + dur + 0.01);

      // Layer 3: Keycap / Metal Plate Resonance
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();

      ringOsc.type = 'sine';
      const ringFreq = (isSpaceOrEnter ? 850 : 1450) * pitchJitter;
      ringOsc.frequency.setValueAtTime(ringFreq, now);

      ringGain.gain.setValueAtTime(0.12, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      ringOsc.connect(ringGain);
      ringGain.connect(master);

      ringOsc.start(now);
      ringOsc.stop(now + 0.015);
    } catch {
      // Graceful fallback if AudioContext is interrupted
    }
  }

  public playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const vol = (this.volume / 100) * 0.5;
    if (vol <= 0) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.09);

      gain.gain.setValueAtTime(0.35 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }
}

export const audioEngine = new AudioService();
