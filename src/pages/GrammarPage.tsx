import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { grammarCourse } from '@/data/grammarCourseData';
import { ChevronDown, Sparkles, BookOpen } from 'lucide-react';

const getLevelBadgeClasses = (level: string) => {
  switch (level.toUpperCase()) {
    case 'A1': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'A2': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'B1': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'B2': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case 'C1': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
};

export const GrammarPage: React.FC = () => {
  const navigate = useNavigate();
  // Open all categories by default
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(grammarCourse.map(c => [c.name, true]))
  );

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <Layout title="Grammar Course" showBack onBack={() => navigate('/home')}>
      <div className="space-y-6">
        
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <Sparkles className="absolute top-4 right-4 w-16 h-16 text-white/10" />
          <div className="relative z-10 w-2/3">
            <h2 className="text-2xl font-bold mb-2">Master English Grammar</h2>
            <p className="text-purple-100 text-sm leading-relaxed">
              40 comprehensive lessons spanning from beginner (A1) to advanced (C1). Pick a topic to start mastering the rules today.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {grammarCourse.map((category) => (
            <div key={category.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              
              {/* Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                aria-expanded={openCategories[category.name]}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{category.topics.length} topics</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openCategories[category.name] ? 'rotate-180' : ''}`} />
              </button>

              {/* Topics Grid */}
              {openCategories[category.name] && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 flex-wrap gap-3">
                    {category.topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => navigate(`/grammar/${topic.id}`)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-0.5 transition-all text-left"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] font-bold px-2 py-1 uppercase rounded border ${getLevelBadgeClasses(topic.level)}`}>
                            {topic.level}
                          </span>
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {topic.questions.length} Qs
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {topic.title}
                        </h4>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GrammarPage;
