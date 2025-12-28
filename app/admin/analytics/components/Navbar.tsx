import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart2, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  textColor: string;
  secondaryText: string;
  cardBg: string;
  borderColor: string;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, textColor, secondaryText, cardBg, borderColor }) => (
  <nav className={`${cardBg} shadow-xl ${borderColor} border-b sticky top-0 z-50 backdrop-blur-xl`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16 md:h-20">
        {/* Left Section */}
        <div className="flex items-center space-x-3 min-w-0">
          <Link
            href="/dashboard"
            className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-purple-100'}`}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className={`h-5 w-5 ${textColor}`} />
          </Link>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40"></div>
            <Image
              src="/emblem.png"
              alt="NeuraMark Logo"
              width={40}
              height={40}
              className="rounded-lg shadow-lg shrink-0 relative"
              priority
            />
          </div>
          <div>
            <h1 className={`text-lg sm:text-2xl font-bold tracking-tight truncate max-w-[140px] sm:max-w-xs ${isDark ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
              Learning Analytics
            </h1>
            <p className={`text-xs ${secondaryText} hidden sm:block`}>KPI & KRA Dashboard</p>
          </div>
        </div>
        {/* Right Section (optional) */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;
