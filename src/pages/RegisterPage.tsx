import React from 'react';
import { RegistrationForm } from '@/components/Auth/RegistrationForm';
import { AuthShell } from './LoginPage';

export const RegisterPage: React.FC = () => {
  return (
    <AuthShell tagline="Start your learning journey">
      <RegistrationForm />
    </AuthShell>
  );
};
