import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, Lock, Download, CheckCircle } from 'lucide-react';
import { getCertificates } from '@/services/progressService';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';

interface CertificateData {
  levelId: number;
  cefrLevel: string;
  earned: boolean;
  earnedAt: Date | null;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Pre-A1: Alphabet & Phonics',
  2: 'A1: Basic Communication',
  3: 'A1-A2: Elementary Skills',
  4: 'A2: Pre-Intermediate',
  5: 'B1: Intermediate',
  6: 'B1: Upper Intermediate',
  7: 'B2: Advanced',
  8: 'B2: Upper Advanced',
  9: 'C1: Proficient',
  10: 'C2: Mastery',
};

export const CertificatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedCerts = certificates.filter(c => c.earned);
  const notEarnedCerts = certificates.filter(c => !c.earned);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading certificates..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-pink-500 dark:from-primary-800 dark:via-primary-900 dark:to-pink-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Certificates</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {earnedCerts.length === 0 ? (
          /* Empty State */
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No certificates yet</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Complete all lessons in a level, then pass its exam with 70% or more to earn that level's certificate.
            </p>
          </div>
        ) : (
          /* Earned Certificates */
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Certificates</h3>
            <div className="space-y-3">
              {earnedCerts.map((cert) => (
                <div
                  key={cert.levelId}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Level {cert.levelId} — {LEVEL_NAMES[cert.levelId]}
                        </h4>
                        <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                          {cert.cefrLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Earned on {cert.earnedAt ? new Date(cert.earnedAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <button className="text-sm text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1 hover:underline">
                        <Download className="w-4 h-4" />
                        Download Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {notEarnedCerts.length > 0 && (
          /* Certificates to Earn */
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {earnedCerts.length > 0 ? 'More to Earn' : 'Certificates to earn'}
            </h3>
            <div className="space-y-3">
              {notEarnedCerts.map((cert) => (
                <div
                  key={cert.levelId}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Level {cert.levelId} — {LEVEL_NAMES[cert.levelId]}
                        </h4>
                        <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {cert.cefrLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Complete level {cert.levelId} and pass the exam to unlock
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
