// app/layout.js
import { Inter } from 'next/font/google';
import { AuthProvider } from '../app/components/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Exam Syllabus Tracker',
  description: 'Track your syllabus progress',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}