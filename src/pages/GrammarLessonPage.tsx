import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { grammarCourse } from '@/data/grammarCourseData';
import { Info, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

export const GrammarLessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const lesson = useMemo(() => {
    for (const cat of grammarCourse) {
      const found = cat.topics.find((t) => t.id === lessonId);
      if (found) return found;
    }
    return null;
  }, [lessonId]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!lesson) {
    return (
      <Layout title="Lesson Not Found" showBack onBack={() => navigate('/grammar')}>
        <div className="text-center py-20 text-gray-500">
          The requested grammar lesson could not be found.
        </div>
      </Layout>
    );
  }

  const handleSelectAnswer = (qIdx: number, answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: answer }));
  };

  const allAnswered = Object.keys(selectedAnswers).length === lesson.questions.length;
  
  const score = isSubmitted
    ? lesson.questions.reduce(
        (acc, q, i) => acc + (selectedAnswers[i] === q.correctAnswer ? 1 : 0),
        0
      )
    : 0;

  return (
    <Layout title={lesson.title} showBack onBack={() => navigate('/grammar')}>
      <div className="space-y-6 max-w-3xl mx-auto pb-10">
        
        {/* Theory ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-500" />
              Theory & Usage
            </h2>
            
            <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
              {lesson.usage && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wider mb-2">When do we use it?</h3>
                  <p className="leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    {lesson.usage}
                  </p>
                </div>
              )}
              
              {lesson.structure && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wider mb-2">Structure</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl font-mono text-xs border border-gray-100 dark:border-gray-800 break-words">
                    {lesson.structure}
                  </div>
                </div>
              )}

              {lesson.examples.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wider mb-2">Examples</h3>
                  <ul className="space-y-2">
                    {lesson.examples.map((ex, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-green-500 font-bold">•</span>
                        <span className="italic">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Practice Questions ─── */}
        {lesson.questions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-purple-500" />
                Practice Questions
              </h2>

              <div className="space-y-8">
                {lesson.questions.map((q, qIdx) => {
                  const userAnswer = selectedAnswers[qIdx];
                  
                  return (
                    <div key={qIdx} className="space-y-3">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        <span className="text-gray-400 font-bold mr-2">{qIdx + 1}.</span>
                        {q.question}
                      </p>
                      
                      <div className="grid gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswer === opt;
                          const isCorrect = isSubmitted && opt === q.correctAnswer;
                          const isWrongSelection = isSubmitted && isSelected && opt !== q.correctAnswer;
                          
                          let btnClass = "text-left px-4 py-3 rounded-xl border text-sm transition-all flex justify-between items-center ";
                          
                          if (isCorrect) {
                            btnClass += "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                          } else if (isWrongSelection) {
                            btnClass += "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
                          } else if (isSelected) {
                            btnClass += "bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm";
                          } else {
                            btnClass += "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700";
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectAnswer(qIdx, opt)}
                              disabled={isSubmitted}
                              className={btnClass}
                            >
                              <span>
                                <span className="font-medium mr-3 opacity-60">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                {opt}
                              </span>
                              {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                              {isWrongSelection && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit & Score Block */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center">
                {!isSubmitted ? (
                  <button
                    onClick={() => setIsSubmitted(true)}
                    disabled={!allAnswered}
                    className={`w-full max-w-sm py-4 rounded-xl font-bold text-white transition-all ${
                      allAnswered 
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg' 
                        : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Check Answers
                  </button>
                ) : (
                  <div className="text-center space-y-4 w-full">
                    <div className="inline-block bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 w-full max-w-sm mx-auto shadow-inner">
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Your Score</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">
                        {score} <span className="text-xl text-gray-400">/ {lesson.questions.length}</span>
                      </p>
                    </div>
                    <div>
                      <button 
                        onClick={() => navigate('/grammar')}
                        className="text-purple-600 dark:text-purple-400 font-semibold hover:underline mt-2"
                      >
                        Return to topic list
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GrammarLessonPage;
