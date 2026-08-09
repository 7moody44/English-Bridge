import React, { useState, useEffect } from 'react';
import { getAudioService } from '@/services/AudioService';

interface AudioPlayerProps {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  rate = 1,
  pitch = 1,
  volume = 1,
  lang = 'en-US',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioService = getAudioService();

  const handlePlay = async () => {
    try {
      setError(null);
      setIsPlaying(true);
      await audioService.speak(text, { rate, pitch, volume, lang });
      setIsPlaying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    audioService.stop();
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPlaying ? handleStop : handlePlay}
        disabled={!text}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isPlaying
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400'
        }`}
      >
        {isPlaying ? '⏹️ Stop' : '▶️ Listen'}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
