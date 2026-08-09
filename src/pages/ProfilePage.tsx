import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';
import { 
  User, 
  BarChart3, 
  Award, 
  GraduationCap, 
  Lock,
  Bell,
  Globe,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const learningItems = [
    {
      id: 'progress',
      label: 'My Progress',
      icon: <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      route: '/progress/detailed',
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
      route: '/achievements',
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />,
      route: '/certificates',
    },
  ];

  const accountItems = [
    {
      id: 'edit',
      label: 'Edit Profile',
      icon: <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      route: '/profile/edit',
    },
    {
      id: 'password',
      label: 'Change Password',
      icon: <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      route: '/profile/password',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      route: '/profile/notifications',
    },
    {
      id: 'language',
      label: 'English Variant: US',
      icon: <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />,
      route: '/profile/language',
    },
  ];

  const getInitials = () => {
    if (!user) return 'S';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'S';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header with gradient and profile info */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-pink-500 dark:from-primary-800 dark:via-primary-900 dark:to-pink-700 text-white px-6 pt-8 pb-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative text-center">
          <h1 className="text-xl font-bold mb-8">Profile</h1>
          
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/50">
              {getInitials()}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold">{user?.firstName || 'Student'}</h2>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-6 -mt-8 space-y-6">
        {/* Learning Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Learning
            </h3>
          </div>
          {learningItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                index < learningItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Account Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Account
            </h3>
          </div>
          {accountItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                index < accountItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-600 dark:text-red-400">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        {/* App Version */}
        <div className="flex items-center justify-center gap-2 py-4">
          <img src={logo} alt="English Bridge" className="w-5 h-5 rounded object-contain" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            English Bridge v1.0.0
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
