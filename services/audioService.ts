import { AudioConfig } from '../types';

class AudioService {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isLoaded: boolean = false;

  // Keep track of nodes to disconnect them properly
  private activeNodes: AudioNode[] = [];

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.audioContext = new AudioContext();
    }
  }

  async loadAudio(url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      try {
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (decodeError) {
        console.error("Audio decoding failed, falling back to synth.", decodeError);
        this.generateFallbackBuffer();
      }

      this.isLoaded = true;
    } catch (error) {
      console.warn("Failed to load audio file, generating fallback synth buffer.", error);
      this.generateFallbackBuffer();
      this.isLoaded = true;
    }
  }

  private generateFallbackBuffer() {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4.0;
    const frameCount = sampleRate * duration;
    this.audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = this.audioBuffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const sequence = [110, 130.81, 146.83, 130.81];
      const noteIndex = Math.floor(t * 2) % sequence.length;
      const freq = sequence[noteIndex];

      data[i] = (Math.sin(t * freq * 2 * Math.PI) * 0.5 +
        Math.sin(t * freq * 1.01 * 2 * Math.PI) * 0.3 +
        (Math.random() * 0.1)) * Math.exp(-(t % 0.5) * 4);
    }
  }

  private makeDistortionCurve(amount: number) {
    // Reduced multiplier from 400 to 50 in the caller, or adjust here.
    // Let's make the curve smoother.
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      const x = i * 2 / n_samples - 1;
      // Standard waveshaper curve, but 'amount' will be smaller now.
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Create a simple impulse response for reverb
  private createReverbBuffer(duration: number = 2, decay: number = 2.0): AudioBuffer | null {
    if (!this.audioContext) return null;
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i; // reverse? no, just decay
      // Simple noise with exponential decay
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  }

  playTrack(config: AudioConfig) {
    if (!this.audioContext || !this.isLoaded) return;

    this.stop(); // Stop any existing sound and disconnect nodes

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Master Gain (Final Output Volume)
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.5; // Reduced from 0.8
    this.gainNode.connect(this.audioContext.destination);
    this.activeNodes.push(this.gainNode);

    if (config.isNoise) {
      this.playWhiteNoise(config);
    } else {
      this.playDistortedAudio(config);
    }
  }

  private playDistortedAudio(config: AudioConfig) {
    if (!this.audioContext || !this.audioBuffer || !this.gainNode) return;

    // 1. Source Node
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.loop = true;
    this.sourceNode.playbackRate.value = config.playbackRate;
    this.sourceNode.detune.value = config.detune;
    this.activeNodes.push(this.sourceNode);

    let currentNode: AudioNode = this.sourceNode;

    // 2. Wobble Effect (Pitch Instability)
    if (config.wobbleAmount && config.wobbleAmount > 0) {
      const wobbleOsc = this.audioContext.createOscillator();
      wobbleOsc.type = 'sine';
      wobbleOsc.frequency.value = 0.5 + Math.random(); // Slow random wobble

      const wobbleGain = this.audioContext.createGain();
      wobbleGain.gain.value = config.wobbleAmount; // Intensity

      wobbleOsc.connect(wobbleGain);
      wobbleGain.connect(this.sourceNode.playbackRate);

      wobbleOsc.start();
      this.activeNodes.push(wobbleOsc, wobbleGain);
    }

    // 3. Filter (Lowpass / Highpass)
    if (config.filterType && config.filterType !== 'none') {
      const filterNode = this.audioContext.createBiquadFilter();
      filterNode.type = config.filterType;
      filterNode.frequency.value = config.filterFrequency || 1000;
      filterNode.Q.value = 1;

      currentNode.connect(filterNode);
      currentNode = filterNode;
      this.activeNodes.push(filterNode);
    }

    // 4. Distortion
    if (config.distortionLevel > 0) {
      const distortionNode = this.audioContext.createWaveShaper();
      // Reduced multiplier from 400 to 50 for much milder distortion
      distortionNode.curve = this.makeDistortionCurve(config.distortionLevel * 50);
      distortionNode.oversample = '4x';

      currentNode.connect(distortionNode);
      currentNode = distortionNode;
      this.activeNodes.push(distortionNode);
    }

    // 5. Tremolo (Volume Instability)
    if (config.hasTremolo) {
      const tremoloGain = this.audioContext.createGain();
      tremoloGain.gain.value = 1;

      const tremoloOsc = this.audioContext.createOscillator();
      tremoloOsc.type = 'sine';
      tremoloOsc.frequency.value = 4; // 4Hz tremolo

      const tremoloDepth = this.audioContext.createGain();
      tremoloDepth.gain.value = 0.3; // Depth

      tremoloOsc.connect(tremoloDepth);
      tremoloDepth.connect(tremoloGain.gain);

      tremoloOsc.start();

      currentNode.connect(tremoloGain);
      currentNode = tremoloGain;
      this.activeNodes.push(tremoloGain, tremoloOsc, tremoloDepth);
    }

    // 6. Reverb
    if (config.hasReverb) {
      const convolver = this.audioContext.createConvolver();
      const reverbBuffer = this.createReverbBuffer(2.0, 2.0);
      if (reverbBuffer) {
        convolver.buffer = reverbBuffer;

        // Wet/Dry mix - simplified: just run in series for strong effect or parallel
        // Let's do parallel for better control, but series is easier for "nightmare" feel
        // Series:
        currentNode.connect(convolver);
        currentNode = convolver;
        this.activeNodes.push(convolver);
      }
    }

    // Connect to Master Gain
    currentNode.connect(this.gainNode);
    this.sourceNode.start(0);
  }

  private playWhiteNoise(config: AudioConfig) {
    if (!this.audioContext || !this.gainNode) return;

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Create a specific gain for noise to lower it significantly
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.value = 0.15; // Very low volume for background static

    this.noiseNode.connect(noiseGain);
    noiseGain.connect(this.gainNode);

    this.noiseNode.start(0);
    this.activeNodes.push(this.noiseNode, noiseGain);
  }

  stop() {
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch (e) { }
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch (e) { }
    }

    // Disconnect all tracked nodes to prevent memory leaks and audio glitches
    this.activeNodes.forEach(node => {
      try { node.disconnect(); } catch (e) { }
    });
    this.activeNodes = [];

    this.sourceNode = null;
    this.noiseNode = null;
    this.gainNode = null;
  }

  async pause() {
    if (this.audioContext) {
      await this.audioContext.suspend();
    }
  }

  async resume() {
    if (this.audioContext) {
      await this.audioContext.resume();
    }
  }
}

export const audioService = new AudioService();