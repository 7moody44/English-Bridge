/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_MONGODB_URI: string;
  readonly VITE_DATABASE_NAME: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_AUDIO_VOICE_LANG: string;
  readonly VITE_AUDIO_VOICE_RATE: string;
  readonly VITE_AUDIO_VOICE_PITCH: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
