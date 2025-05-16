// app/layout.js
import { Inter } from 'next/font/google';
import { AuthProvider } from './components/context/AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Exam Syllabus Tracker',
  description: 'Track your syllabus progress',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}