export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export class AudioService {
  private synth: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.isSupported =
      typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (this.isSupported) {
      this.synth = window.speechSynthesis;
      this.initializeVoices();
    }
  }

  private initializeVoices(): void {
    if (!this.synth) return;

    const setVoices = () => {
      const voices = this.synth!.getVoices();
      const femaleVoice = voices.find(
        (voice) => voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || voices.find((voice) => voice.lang.startsWith('en'));

      if (femaleVoice) {
        this.selectedVoice = femaleVoice;
      }
    };

    // Voices might not be loaded immediately
    if (this.synth.getVoices().length > 0) {
      setVoices();
    } else {
      this.synth.onvoiceschanged = setVoices;
    }
  }

  public async speak(text: string, options?: SpeechOptions): Promise<void> {
    if (!this.isSupported || !this.synth) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        utterance.lang = options?.lang || 'en-US';
        utterance.rate = options?.rate || 1;
        utterance.pitch = options?.pitch || 1;
        utterance.volume = options?.volume || 1;

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

        this.synth!.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synth ? this.synth.getVoices() : [];
  }

  public setVoice(voice: SpeechSynthesisVoice): void {
    this.selectedVoice = voice;
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public isPaused(): boolean {
    return this.synth ? this.synth.paused : false;
  }

  public pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

// Create singleton instance
let audioServiceInstance: AudioService | null = null;

export const getAudioService = (): AudioService => {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
};
