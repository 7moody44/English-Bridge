/**
 * Debug Helper Utilities
 * Use these to debug API calls and errors
 */

interface ApiDebugInfo {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  response?: unknown;
  error?: unknown;
  timestamp: string;
}

// Store debug info globally
const debugLog: ApiDebugInfo[] = [];

/**
 * Log API calls with full details
 */
export const debugApiCall = (info: ApiDebugInfo): void => {
  debugLog.push(info);
  console.group(`🔍 API Call: ${info.method} ${info.url}`);
  console.log('Timestamp:', info.timestamp);
  console.log('Headers:', info.headers);
  if (info.body) console.log('Body:', info.body);
  if (info.response) console.log('Response:', info.response);
  if (info.error) console.error('Error:', info.error);
  console.groupEnd();
};

/**
 * Enhanced fetch with debugging
 */
export const debugFetch = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  const timestamp = new Date().toISOString();
  const method = options?.method || 'GET';

  console.log(`\n📡 ${method} ${url}`);

  try {
    const response = await fetch(url, options);
    
    const debugInfo: ApiDebugInfo = {
      url,
      method,
      headers: Object.fromEntries(Object.entries(options?.headers || {})),
      body: options?.body,
      response: {
        status: response.status,
        statusText: response.statusText,
      },
      timestamp,
    };

    if (!response.ok) {
      const errorText = await response.text();
      debugInfo.error = errorText;
      console.error(`❌ ${response.status}: ${errorText}`);
    } else {
      console.log(`✅ ${response.status} OK`);
    }

    debugApiCall(debugInfo);
    return response;
  } catch (error) {
    const debugInfo: ApiDebugInfo = {
      url,
      method,
      headers: Object.fromEntries(Object.entries(options?.headers || {})),
      body: options?.body,
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    };

    console.error(`❌ Network Error: ${error}`);
    debugApiCall(debugInfo);
    throw error;
  }
};

/**
 * Get all debug logs
 */
export const getDebugLog = (): ApiDebugInfo[] => debugLog;

/**
 * Clear debug logs
 */
export const clearDebugLog = (): void => {
  debugLog.length = 0;
  console.log('🗑️  Debug log cleared');
};

/**
 * Export debug logs as JSON
 */
export const exportDebugLog = (): string => {
  const json = JSON.stringify(debugLog, null, 2);
  console.log('📋 Debug log:', json);
  return json;
};

/**
 * Test API connection
 */
export const testApiConnection = async (): Promise<void> => {
  console.log('\n🧪 Testing API Connection...');
  
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  
  try {
    const response = await debugFetch(`${apiUrl.replace('/api', '')}/`);
    const data = await response.json();
    console.log('✅ API Connection Successful:', data);
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
  }
};

/**
 * Check configuration
 */
export const checkConfig = (): void => {
  console.log('\n⚙️  Configuration Check:');
  console.log('API URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Dev:', import.meta.env.DEV);
  console.log('Prod:', import.meta.env.PROD);
};

/**
 * Install global debug functions (for browser console)
 */
export const installDebugTools = (): void => {
  (window as unknown as Record<string, unknown>).EB_Debug = {
    testApi: testApiConnection,
    checkConfig,
    getLog: getDebugLog,
    clearLog: clearDebugLog,
    exportLog: exportDebugLog,
    fetch: debugFetch,
  };
  console.log('🔧 Debug tools installed. Use EB_Debug.* in console');
};

// Auto-install in development
if (import.meta.env.DEV) {
  console.log('🚀 English Bridge Development Mode');
  console.log('📝 Type: EB_Debug.testApi() to test API connection');
  console.log('📝 Type: EB_Debug.checkConfig() to check configuration');
  console.log('📝 Type: EB_Debug.getLog() to get debug logs');
  installDebugTools();
}
