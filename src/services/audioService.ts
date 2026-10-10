
// Tactical Web Audio API sound controller
class TacticalAudioController {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  startAmbientDrone() {
    // Ambient drone starter
  }

  playBeep(freq = 880, typeOrDuration: OscillatorType | number = 'sine', duration = 0.08) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      let oscType: OscillatorType = 'sine';
      let resolvedDuration = duration;
      if (typeof typeOrDuration === 'number') {
        resolvedDuration = typeOrDuration;
      } else if (typeof typeOrDuration === 'string') {
        oscType = typeOrDuration;
      }

      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + resolvedDuration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + resolvedDuration);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const audioController = new TacticalAudioController();

