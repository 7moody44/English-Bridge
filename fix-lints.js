import fs from 'fs';
import path from 'path';

const fixes = [
  { file: 'src/components/Audio/AudioPlayer.tsx', replace: ['import React, { useState, useRef, useEffect } from', 'import React, { useState, useRef } from'] },
  { file: 'src/components/Layout/Layout.tsx', replace: ['import React, { ReactNode } from', 'import React, { type ReactNode } from'] },
  { file: 'src/components/Shared/ContentCard.tsx', replace: ['import React, { ReactNode } from', 'import React, { type ReactNode } from'] },
  { file: 'src/components/Shared/ErrorBoundary.tsx', replace: ['import React, { Component, ErrorInfo, ReactNode } from', 'import React, { Component, type ErrorInfo, type ReactNode } from'] },
  { file: 'src/context/AuthContext.tsx', replace: ['import React, { createContext, useContext, useState, useEffect, ReactNode } from', 'import React, { createContext, useContext, useState, useEffect, type ReactNode } from'] },
  { file: 'src/context/ThemeContext.tsx', replace: ['import React, { createContext, useContext, useState, useEffect, ReactNode } from', 'import React, { createContext, useContext, useState, useEffect, type ReactNode } from'] },
  
  // DetailedReportPage
  { file: 'src/pages/DetailedReportPage.tsx', replace: [
    'import { Target, TrendingUp, Calendar, BookOpen, Clock, Award, Lock, ShieldAlert } from',
    'import { Target, TrendingUp, BookOpen, Award, ShieldAlert } from'
  ]},
  { file: 'src/pages/DetailedReportPage.tsx', replace: ['const { user } = useAuth();', 'useAuth(); // user unused'] },
  { file: 'src/pages/DetailedReportPage.tsx', replace: ['import { getProgress } from', '// import { getProgress } from'] },

  // Games
  { file: 'src/pages/games/HangmanGame.tsx', replace: [
    'import { Trophy, ArrowLeft, Lightbulb, CheckCircle } from',
    'import { Trophy, ArrowLeft, Lightbulb } from'
  ]},
  { file: 'src/pages/games/HangmanGame.tsx', replace: [
    'const xpEarned = calculateTotalXp();',
    'calculateTotalXp(); // xpEarned unused'
  ]},

  { file: 'src/pages/games/WordMatchGame.tsx', replace: [
    'const xpEarned = calculateTotalXp();',
    'calculateTotalXp(); // xpEarned unused'
  ]},

  { file: 'src/pages/games/WordSearchGame.tsx', replace: [
    'import { Trophy, ArrowLeft, CheckCircle, XCircle } from',
    'import { Trophy, ArrowLeft } from'
  ]},
  { file: 'src/pages/games/WordSearchGame.tsx', replace: [
    'const xpEarned = calculateTotalXp();',
    'calculateTotalXp(); // xpEarned unused'
  ]},

  // Auth/Misc
  { file: 'src/pages/LoginPage.tsx', replace: [
    "import { Layout } from '@/components/Layout/Layout';\n",
    ""
  ]},
  { file: 'src/pages/ProfilePage.tsx', replace: [
    'import { User, Mail, Shield, Camera, Edit } from',
    'import { User, Mail, Shield, Camera } from'
  ]},
  { file: 'src/pages/ProgressPage.tsx', replace: ['const { user } = useAuth();', 'useAuth(); // user unused'] },
  { file: 'src/services/api.ts', replace: [
    "import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';",
    "import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';"
  ]},
];

fixes.forEach(({ file, replace }) => {
  const fullPath = path.join('e:/CODING/englishwebsite/EnglishBridge', file);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(replace[0])) {
      content = content.replace(replace[0], replace[1]);
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', file);
    } else {
      console.warn('Could not find match in', file);
    }
  } catch (err) {
    console.error('Error with', file, err);
  }
});
