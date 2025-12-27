# NeuraMark - Exam Syllabus Tracker

A scalable, modern web application for tracking exam syllabi and progress, built with Next.js, TypeScript, and Firebase.

## Features

- 📚 **Syllabus Management**: Organize subjects by branches, years, and semesters
- 📊 **Progress Tracking**: Monitor completion of topics and modules
- 👥 **User Management**: Authentication with Firebase Auth
- 💬 **Real-time Chat**: Collaborative study groups
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🔒 **Admin Panel**: Manage subjects, users, and analytics
- 📄 **PDF Processing**: Upload and process syllabus documents
- 🤖 **AI Integration**: Google Generative AI for content assistance

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- MongoDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neuramark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables in `.env.local`:
   - Firebase configuration
   - MongoDB URI
   - API keys for external services

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config to `.env.local`

5. **Database Setup**
   - Set up MongoDB (local or cloud)
   - Update `MONGODB_URI` in `.env.local`

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Testing
npm test
npm run test:watch
npm run test:coverage
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
neuramark/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Main application routes
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   └── globals.css        # Global styles
├── components/            # Shared components
├── context/               # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility libraries
├── services/              # API services
├── stores/                # Zustand stores
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── public/                # Static assets
```

## Architecture Principles

### Scalability
- **Modular Architecture**: Separated concerns with services, hooks, and stores
- **Type Safety**: Full TypeScript coverage for better maintainability
- **State Management**: Zustand for predictable state updates
- **Component Composition**: Reusable, composable components

### Performance
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: Firebase caching and React Query patterns
- **Lazy Loading**: Components and routes loaded on demand

### Developer Experience
- **TypeScript**: Full type safety and IntelliSense
- **ESLint + Prettier**: Consistent code formatting
- **Testing**: Comprehensive test coverage
- **Git Hooks**: Pre-commit quality checks with Husky

## API Routes

- `POST /api/process-pdf` - Process uploaded PDF documents
- Authentication routes handled by NextAuth.js

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

This project is licensed under the MIT License.
