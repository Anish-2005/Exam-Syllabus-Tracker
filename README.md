# NeuraMark - AI-Powered Exam Syllabus & Progress Tracker

<div align="center">
  <img src="./neuramark/public/logo.png" alt="NeuraMark Logo" width="200"/>
  
  ![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black)
  ![React](https://img.shields.io/badge/React-18-blue)
  ![Firebase](https://img.shields.io/badge/Firebase-11.7.3-orange)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
</div>

## 🚀 Overview

NeuraMark is a comprehensive, full-stack web application designed to revolutionize how students track their exam syllabi, monitor module completion, and collaborate with peers. Built with modern technologies and featuring an intuitive user interface, it empowers students to visualize their academic progress and stay organized throughout their studies.

## ✨ Key Features

### 📚 **Syllabus Management**
- **Dynamic Subject Organization**: Organize subjects by branch, year, and semester
- **Module Breakdown**: Detailed module structures with topic listings
- **Real-time Updates**: Live synchronization across all devices
- **Admin Controls**: Complete CRUD operations for academic administrators

### 📊 **Progress Tracking**
- **Visual Progress Bars**: Real-time completion percentage for each subject
- **Module Status Tracking**: Mark individual modules as completed
- **Personal Dashboard**: Comprehensive overview of academic progress
- **Historical Data**: Track progress over time with persistent storage

### 💬 **Chat & Collaboration**
- **Real-time Chat Rooms**: Create public/private rooms for subject discussions
- **Role-based Access**: Admin, Moderator, and Member roles with specific permissions
- **Join by Code**: Secure room access with unique 6-character codes
- **Global Chat**: Campus-wide communication channel
- **Message Management**: Real-time messaging with user role indicators

### 🎨 **User Experience**
- **Dark/Light Theme**: Seamless theme switching with persistent preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered interactions
- **Accessibility**: WCAG compliant design patterns

### 🔐 **Authentication & Security**
- **Multiple Auth Methods**: Email/password and Google OAuth integration
- **Protected Routes**: Secure access to authenticated content
- **User Profiles**: Personalized user management system
- **Session Management**: Secure session handling with Firebase Auth

### 👨‍💼 **Admin Features**
- **User Analytics**: Comprehensive user progress analytics
- **Branch Management**: Add/remove academic branches and specializations
- **Subject Administration**: Bulk operations and subject template copying
- **AI-Powered PDF Upload**: Automatically extract syllabus data from PDF documents using Google Gemini AI
- **System Monitoring**: Real-time user activity and engagement metrics

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14.2.3 with App Router
- **UI Library**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for data visualization

### **Backend & Database**
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth with multi-provider support
- **Cloud Functions**: Firebase Functions for server-side logic
- **Real-time**: Firestore real-time listeners for live updates

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Code Formatting**: Prettier integration
- **Build Tool**: Next.js built-in bundler
- **Version Control**: Git with structured commit patterns

## 📁 Project Structure

```
neuramark/
├── app/                          # Next.js App Router directory
│   ├── (auth)/                   # Authentication pages group
│   │   ├── login/               # Login page with OAuth
│   │   └── signup/              # User registration
│   ├── (main)/                  # Main application pages
│   │   └── dashboard/           # Dashboard with progress tracking
│   │       ├── exams/           # Exam management
│   │       ├── kra-kpi/         # KRA/KPI tracking
│   │       └── progress/        # Progress visualization
│   ├── about/                   # About page with features
│   ├── admin/                   # Admin panel pages
│   │   ├── active-users/        # User management
│   │   ├── analytics/           # System analytics
│   │   └── subjects/            # Subject administration
│   ├── chat/                    # Real-time chat system
│   │   └── components/          # Chat-specific components
│   ├── components/              # Shared React components
│   ├── context/                 # React Context providers
│   └── lib/                     # Utility libraries and Firebase config
├── functions/                   # Firebase Cloud Functions
├── public/                      # Static assets
└── configuration files          # Next.js, Tailwind, Firebase configs
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Firebase Account** with project setup
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Exam-Syllabus-Tracker.git
   cd Exam-Syllabus-Tracker/neuramark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the neuramark directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**
   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project
   firebase init
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Schema

### **Core Collections**

#### `users`
```javascript
{
  id: "user_uid",
  name: "User Name",
  email: "user@example.com",
  photoURL: "profile_image_url",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `syllabus`
```javascript
{
  id: "subject_id",
  name: "Subject Name",
  code: "SUBJ001",
  branch: "Computer Science",
  year: 2,
  semester: 3,
  modules: [
    {
      name: "Module 1",
      topics: ["Topic 1", "Topic 2"]
    }
  ]
}
```

#### `userProgress`
```javascript
{
  id: "user_uid",
  subject_subjectId: {
    module_0: true,
    module_1: false
  },
  updatedAt: timestamp
}
```

#### `chatRooms`
```javascript
{
  id: "room_id",
  name: "Room Name",
  code: "ABC123",
  type: "public" | "private",
  admin: "user_uid",
  moderators: ["user_uid"],
  members: ["user_uid"],
  createdAt: timestamp
}
```

## 🎯 Usage Guide

### **For Students**

1. **Getting Started**
   - Register with email or Google account
   - Complete your profile setup
   - Select your academic branch and year

2. **Tracking Progress**
   - Browse subjects by semester
   - Mark modules as completed
   - View visual progress indicators
   - Access detailed module breakdowns

3. **Collaboration**
   - Join public chat rooms
   - Request access to private study groups
   - Share room codes with classmates
   - Participate in subject discussions

### **For Administrators**

1. **System Setup**
   - Configure academic branches and years
   - Add specialization tracks
   - Create subject templates
   - Set up initial room structures

2. **Content Management**
   - Add new subjects with module breakdowns
   - Copy subjects between branches/years
   - Upload PDF syllabi for automatic AI processing and database updates
   - Manage user permissions
   - Monitor system analytics

3. **User Management**
   - View user progress reports
   - Manage chat room permissions
   - Handle join requests
   - Generate progress reports

## 🔧 Configuration

### **Firebase Configuration**
Update `app/lib/firebase.js` with your Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};
```

### **Admin Users**
Configure admin users in `app/lib/firebase.js`:

```javascript
const ADMIN_EMAILS = new Set([
  "admin@example.com",
  "anishseth0510@gmail.com"
]);
```

### **Theme Configuration**
Customize themes in `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette
      }
    }
  }
}
```

## 🚀 Deployment

### **Vercel Deployment** (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   Configure environment variables in Vercel dashboard

3. **Domain Setup**
   Configure custom domain in Vercel settings

### **Firebase Hosting**

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## 🧪 Testing

### **Development Testing**
```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

### **Production Testing**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- Follow ESLint configuration
- Use meaningful commit messages
- Write self-documenting code
- Add comments for complex logic
- Maintain consistent formatting

### **Pull Request Guidelines**
- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Request review from maintainers

## 📈 Future Enhancements

### **Planned Features**
- [ ] **Mobile App**: React Native mobile application
- [ ] **Offline Support**: PWA capabilities for offline access
- [x] **AI Integration**: Smart study recommendations (PDF processing implemented)
- [ ] **Calendar Integration**: Sync with academic calendars
- [ ] **Study Groups**: Enhanced collaboration features
- [ ] **Progress Analytics**: Advanced learning analytics
- [ ] **Export Features**: PDF generation for progress reports
- [ ] **Notification System**: Real-time push notifications
- [ ] **Multi-language Support**: Internationalization
- [ ] **Voice Notes**: Audio annotations for modules

### **Technical Improvements**
- [ ] **Performance Optimization**: Code splitting and lazy loading
- [ ] **Security Enhancements**: Advanced security measures
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Testing Suite**: Comprehensive testing coverage
- [ ] **Documentation**: API documentation with OpenAPI
- [ ] **Monitoring**: Application performance monitoring
- [ ] **CI/CD Pipeline**: Automated testing and deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation**: Check this README and inline documentation
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

### **Common Issues**
- **Firebase Setup**: Ensure all environment variables are configured
- **Build Errors**: Check Node.js version compatibility
- **Authentication**: Verify Firebase Auth configuration
- **Real-time Issues**: Check Firestore security rules

## 👥 Team & Acknowledgments

### **Development Team**
- **Lead Developer**: Anish Seth (@anishseth0510)
- **UI/UX Design**: Collaborative design process
- **Backend Architecture**: Firebase integration specialist

### **Technologies Used**
- Next.js team for the amazing framework
- Firebase team for the backend infrastructure
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for animation library
- Lucide React for beautiful icons

### **Special Thanks**
- Academic institutions for inspiration
- Student community for feedback and testing
- Open source community for tools and libraries

---

<div align="center">
  <p><strong>Made with ❤️ for the academic community</strong></p>
  <p>© 2025 NeuraMark. All rights reserved.</p>
</div>