import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAudioRecorderReturn {
  /** Whether the browser can record audio at all. */
  isSupported: boolean;
  /** Whether a recording is currently in progress. */
  isRecording: boolean;
  /** Seconds elapsed in the current recording. */
  duration: number;
  /** The recorded audio Blob once recording stops (webm/ogg). */
  audioBlob: Blob | null;
  /** A temporary object URL for playback, cleared on reset. */
  audioUrl: string | null;
  /** Last error message, if any. */
  error: string | null;
  /** Start recording (requests mic permission). */
  start: () => Promise<void>;
  /** Stop recording and produce the audio Blob. */
  stop: () => Promise<void>;
  /** Clear the current recording for a fresh attempt. */
  reset: () => void;
}

/**
 * Robust audio recorder using MediaRecorder.
 *
 * This replaces the Web Speech API approach, which depended on Chrome's
 * cloud speech service and failed with "network"/"audio-capture" errors.
 * Here we just capture real audio; transcription happens server-side via
 * Groq Whisper. Works in Chrome, Edge, Firefox, and Safari.
 */
export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isSupported] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof window.MediaRecorder !== 'undefined'
  );

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopResolverRef = useRef<(() => void) | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Pick a mime type the current browser actually supports.
  const pickMimeType = (): string => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4', // Safari
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  };

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser.');
      return;
    }
    setError(null);
    // Clear any previous recording.
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        releaseStream();
        clearTimer();
        setIsRecording(false);
        stopResolverRef.current?.();
      };

      recorder.onerror = () => {
        setError('Recording failed. Please try again.');
        releaseStream();
        clearTimer();
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);

      // Duration timer.
      const startedAt = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startedAt) / 1000));
      }, 250);
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError('Microphone permission denied. Please allow mic access and try again.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError('No microphone found. Connect a mic and try again.');
      } else if (name === 'NotReadableError') {
        setError('Your microphone is being used by another app. Close it and try again.');
      } else {
        setError('Could not start recording. Please check your microphone.');
      }
      releaseStream();
      setIsRecording(false);
    }
  }, [isSupported, audioUrl]);

  const stop = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      // Nothing to stop.
      setIsRecording(false);
      return;
    }
    // Resolve when onstop fires.
    const stopped = new Promise<void>((resolve) => {
      stopResolverRef.current = resolve;
    });
    recorder.stop();
    await stopped;
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    releaseStream();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
  }, [audioUrl]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      clearTimer();
      releaseStream();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return {
    isSupported,
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    error,
    start,
    stop,
    reset,
  };
};
