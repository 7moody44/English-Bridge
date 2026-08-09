# English Bridge

A progressive English learning web application built with React, TypeScript, and modern web technologies.

## 🚀 Features

- Progressive English curriculum aligned with CEFR standards
- Interactive lessons with audio support
- User progress tracking and session persistence
- Responsive design for mobile and desktop
- Dark/light theme support
- Offline-capable with LocalStorage

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Testing**: Jest, React Testing Library, fast-check
- **Code Quality**: ESLint, Prettier
- **Database**: MongoDB Atlas
- **Audio**: Web Speech API

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser

## 🏗️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd english-bridge
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration.

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── services/         # API and external service integrations
├── hooks/            # Custom React hooks
├── context/          # React context providers
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
├── assets/           # Static assets (images, icons)
└── __tests__/        # Test files
```

## 🎯 MVP Scope

The MVP includes:
- Level 1 (Pre-A1) with 8 lessons + exam
- User registration and authentication
- Progress tracking
- Audio-supported learning
- Responsive mobile-first design

## 🧪 Testing

The project uses a comprehensive testing strategy:
- **Unit Tests**: Component and function testing
- **Property-Based Tests**: Universal correctness properties
- **Integration Tests**: End-to-end user workflows

Run tests:
```bash
npm run test
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please refer to the development team for contribution guidelines.


## 🚀 Implementation Complete!

This project is now **fully implemented** with all core features:

### ✅ Completed Components
- **Authentication**: Two-step registration, secure login, JWT tokens
- **UI Framework**: Responsive layout, bottom navigation, theme toggle
- **Learning**: 8 Level 1 lessons with 40+ exercises
- **Audio**: Web Speech API integration for pronunciation
- **Progress Tracking**: Real-time lesson and course tracking
- **Database**: MongoDB with complete schema and seeding
- **Error Handling**: Comprehensive error boundaries and recovery

### 🎯 Quick Start

**Frontend:**
```bash
npm install
npm run dev  # http://localhost:3000
```

**Backend:**
```bash
cd backend
npm install
npm run dev  # http://localhost:5000
```

### 📚 Curriculum
- Level 1 (Pre-A1) Course 1 Complete:
  1. The English Alphabet
  2. Vowels and Consonants
  3. Letter Sounds
  4. Your First Words
  5. Numbers 0 to 20
  6. Greetings and Politeness
  7. Everyday Objects
  8. Introduce Yourself

### 🌈 Features
- Dark/Light theme toggle
- Multiple exercise types (multiple-choice, listening, reading)
- Text-to-speech audio with female voice
- Progress persistence with MongoDB
- Mobile-first responsive design
- Secure authentication with bcrypt
- Real-time progress updates

### 📖 Documentation
- See `IMPLEMENTATION_COMPLETE.md` for full details
- See `.kiro/specs/` for requirements, design, and task list

Start learning English today! 🎓
