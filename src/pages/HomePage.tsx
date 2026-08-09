import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { useAuth } from '@/context/AuthContext';
import { getProgressStats } from '@/services/progressService';
import logo from '@/assets/logo.png';
import { vocabularyWords } from '@/data/vocabularyData';
import { 
  Headphones, 
  Mic, 
  Pencil, 
  BookOpen, 
  Award,
  Sparkles,
  Flame,
  Trophy,
  BookOpenCheck,
  Wand2,
  Brain,
  Volume2,
  ArrowRight
} from 'lucide-react';

const EPOCH = new Date("2025-01-01T00:00:00Z").getTime();
const MS_PER_DAY = 86400000;

function getTodayWordIndex(): number {
  const now = Date.now();
  const daysSinceEpoch = Math.floor((now - EPOCH) / MS_PER_DAY);
  return ((daysSinceEpoch % 60) + 60) % 60;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    cefrLevel: 'A1',
  });
  const [loading, setLoading] = useState(true);

  const todayWord = useMemo(() => {
    const index = getTodayWordIndex();
    return vocabularyWords[index];
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getProgressStats();
        setStats({
          xp: data.xp,
          streak: data.streak,
          cefrLevel: data.cefrLevel,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const playWordPronunciation = () => {
    const utterance = new SpeechSynthesisUtterance(todayWord.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  const quickAccessItems = [
    { id: 'listening', label: 'Listening', icon: <Headphones className="w-5 h-5" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', route: '/practice/listening' },
    { id: 'speaking', label: 'Speaking', icon: <Mic className="w-5 h-5" />, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', route: '/practice' },
    { id: 'writing', label: 'Writing', icon: <Pencil className="w-5 h-5" />, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', route: '/practice' },
    { id: 'reading', label: 'Reading', icon: <BookOpen className="w-5 h-5" />, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', route: '/practice/reading' },
    { id: 'grammar', label: 'Grammar', icon: <Sparkles className="w-5 h-5" />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', route: '/grammar' },
  ];

  const additionalItems = [
    { id: 'mistakes', label: 'Mistakes', icon: <BookOpenCheck className="w-5 h-5" />, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400', route: '/mistakes' },
    { id: 'vocab', label: 'Vocab', icon: <Brain className="w-5 h-5" />, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400', route: '/vocab' },
    { id: 'games', label: 'Games', icon: <Wand2 className="w-5 h-5" />, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', route: '/games' },
    { id: 'tutor', label: 'AI Tutor', icon: <Sparkles className="w-5 h-5" />, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400', route: '/tutor' },
    { id: 'assessment', label: 'Assessment', icon: <Award className="w-5 h-5" />, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', route: '/assessment' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header with gradient - Standardized height */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-pink-500 dark:from-primary-800 dark:via-primary-900 dark:to-pink-700 text-white px-6 py-6 h-24 flex flex-col justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <img
            src={logo}
            alt="English Bridge"
            className="w-12 h-12 rounded-xl object-contain bg-white/20 shadow-md"
          />
          <div>
            <p className="text-sm opacity-90 mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-bold leading-tight">Hi, {user?.firstName || 'Student'}!</h1>
          </div>
        </div>
      </div>

      {/* Stats Cards - Bigger and centered */}
      <div className="flex justify-center px-6 mt-4 mb-4">
        <div className="grid grid-cols-3 gap-4 w-full" style={{ maxWidth: '600px' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md text-center">
            <div className="flex justify-center mb-2">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.streak}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Day Streak</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md text-center">
            <div className="flex justify-center mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.xp}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">XP Points</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md text-center">
            <div className="flex justify-center mb-2">
              <Award className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.cefrLevel}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">CEFR Level</p>
          </div>
        </div>
      </div>

      {/* Word of the Day Card - Square/Wide format */}
      <div className="flex justify-center px-6 mb-4">
        <div className="w-full" style={{ maxWidth: '600px' }}>
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 dark:from-purple-800 dark:via-purple-900 dark:to-pink-700 rounded-2xl p-5 shadow-md text-white relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Word of the Day</p>
              <button
                onClick={() => navigate('/vocab')}
                className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Tap to quiz
              </button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-bold">{todayWord.word}</h3>
              <button
                onClick={playWordPronunciation}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm opacity-90 mb-3">{todayWord.pronunciation}</p>
            <p className="text-sm opacity-95 mb-2">
              <span className="font-medium italic">{todayWord.partOfSpeech}</span> - {todayWord.definition}
            </p>
            <p className="text-sm italic opacity-90">"{todayWord.example}"</p>
            <button
              onClick={() => navigate('/vocab')}
              className="mt-4 text-sm font-semibold flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
            >
              See all words <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="flex justify-center px-6 mb-4">
        <div className="w-full" style={{ maxWidth: '600px' }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Continue Learning</h2>
          
          <button
            onClick={() => navigate('/learn')}
            className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group mb-2"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Level 1 — Pre-A1: Alphabet & Phonics</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Next: The English Alphabet • 0/8 lessons passed</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/practice')}
            className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Practice a skill</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Reading, Writing, Listening, Speaking</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="flex justify-center px-6 mb-4">
        <div className="w-full" style={{ maxWidth: '600px' }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Access</h2>
          <div className="grid grid-cols-5 gap-4">
            {quickAccessItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.route && navigate(item.route)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center hover:scale-105 transition-transform shadow-sm`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Items */}
      <div className="flex justify-center px-6 mb-4">
        <div className="w-full" style={{ maxWidth: '600px' }}>
          <div className="grid grid-cols-5 gap-4">
            {additionalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.route && navigate(item.route)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center hover:scale-105 transition-transform shadow-sm`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* This Week Section */}
      <div className="flex justify-center px-6 mb-6">
        <div className="w-full" style={{ maxWidth: '600px' }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">This Week</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">XP you earn each day this week will show here.</p>
            
            {/* Week chart */}
            <div className="flex items-end justify-between gap-2 h-20">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-14">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg h-1"></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
