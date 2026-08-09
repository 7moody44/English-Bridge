/**
 * Application configuration utilities
 */

interface AppConfig {
  name: string;
  version: string;
  description: string;
  mongoUri: string;
  databaseName: string;
  apiBaseUrl: string;
  apiTimeout: number;
  audio: {
    language: string;
    rate: number;
    pitch: number;
  };
  development: {
    enableDevtools: boolean;
    logLevel: string;
  };
}

interface ImportMetaEnv {
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
  VITE_APP_DESCRIPTION?: string;
  VITE_MONGODB_URI?: string;
  VITE_DATABASE_NAME?: string;
  VITE_API_BASE_URL?: string;
  VITE_API_TIMEOUT?: string;
  VITE_AUDIO_VOICE_LANG?: string;
  VITE_AUDIO_VOICE_RATE?: string;
  VITE_AUDIO_VOICE_PITCH?: string;
  VITE_ENABLE_DEVTOOLS?: string;
  VITE_LOG_LEVEL?: string;
  DEV?: boolean;
  PROD?: boolean;
}

interface ImportMeta {
  env?: ImportMetaEnv;
}

/**
 * Get application configuration from environment variables
 * In tests, this will use default values since import.meta.env is not available
 */
export const getConfig = (): AppConfig => {
  // In test environment, return default values
  if (typeof window === 'undefined' || !('import' in globalThis)) {
    return {
      name: 'English Bridge',
      version: '1.0.0',
      description: 'Progressive English Learning Platform',
      mongoUri: 'mongodb://localhost:27017/englishbridge',
      databaseName: 'englishbridge',
      apiBaseUrl: 'http://localhost:3001/api',
      apiTimeout: 10000,
      audio: {
        language: 'en-US',
        rate: 1.0,
        pitch: 1.0,
      },
      development: {
        enableDevtools: false,
        logLevel: 'info',
      },
    };
  }

  const meta = import.meta as ImportMeta;
  const env = meta.env || {};

  return {
    name: env.VITE_APP_NAME || 'English Bridge',
    version: env.VITE_APP_VERSION || '1.0.0',
    description:
      env.VITE_APP_DESCRIPTION || 'Progressive English Learning Platform',
    mongoUri: env.VITE_MONGODB_URI || 'mongodb://localhost:27017/englishbridge',
    databaseName: env.VITE_DATABASE_NAME || 'englishbridge',
    apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    apiTimeout: parseInt(env.VITE_API_TIMEOUT || '10000', 10),
    audio: {
      language: env.VITE_AUDIO_VOICE_LANG || 'en-US',
      rate: parseFloat(env.VITE_AUDIO_VOICE_RATE || '1.0'),
      pitch: parseFloat(env.VITE_AUDIO_VOICE_PITCH || '1.0'),
    },
    development: {
      enableDevtools: env.VITE_ENABLE_DEVTOOLS?.toLowerCase() === 'true',
      logLevel: env.VITE_LOG_LEVEL || 'info',
    },
  };
};

/**
 * Check if the application is running in development mode
 */
export const isDevelopment = (): boolean => {
  if (typeof window === 'undefined' || !('import' in globalThis)) {
    return true; // Assume development in test environment
  }
  const meta = import.meta as ImportMeta;
  return meta.env?.DEV || false;
};

/**
 * Check if the application is running in production mode
 */
export const isProduction = (): boolean => {
  if (typeof window === 'undefined' || !('import' in globalThis)) {
    return false; // Assume not production in test environment
  }
  const meta = import.meta as ImportMeta;
  return meta.env?.PROD || false;
};
