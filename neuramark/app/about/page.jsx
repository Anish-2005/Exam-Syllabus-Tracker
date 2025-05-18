// app/about/page.js
'use client'
import Link from 'next/link'
import { useTheme } from '../components/ThemeContext'
import { ArrowLeft, BookOpen, CheckCircle, Layers, BarChart2, Users, FileText, Moon, Sun } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function AboutPage() {
    const { theme, toggleTheme, isDark } = useTheme()

    // Theme-based classes
    const bgGradient = isDark
        ? 'bg-gradient-to-br from-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-800'
    const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600'
    const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'

    const features = [
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: "Comprehensive Syllabus Coverage",
            description: "Track all subjects from 1st to 4th year across various engineering branches."
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: "Progress Tracking",
            description: "Mark modules as completed and visualize your overall progress."
        },
        {
            icon: <Layers className="w-6 h-6" />,
            title: "Module Breakdown",
            description: "View detailed module structures with topics for each subject."
        },
        {
            icon: <BarChart2 className="w-6 h-6" />,
            title: "Performance Analytics",
            description: "See visual representations of your completion rates and study patterns."
        }
    ]

    const branches = [
        "Computer Science (CSE)",
        "Electronics & Communication (ECE)",
        "Artificial Intelligence & Machine Learning (AIML)",
        "Data Science (DS)",
        "Electrical Engineering (EE)",
        "Mechanical Engineering (ME)",
        "Civil Engineering",
        "Information Technology (IT)"
    ]

    return (
        <main className={`min-h-screen ${bgGradient} transition-colors duration-200`}>
            {/* Enhanced Back Button */}
            <motion.div
                className="fixed top-4 left-4 z-50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <Link
                    href="/"
                    className={`
                        p-2 rounded-full flex items-center justify-center
                        ${isDark ? 'bg-gray-700/80 hover:bg-gray-600/90 backdrop-blur-sm' : 'bg-white/80 hover:bg-gray-100/90 backdrop-blur-sm'}
                        shadow-lg hover:shadow-md
                        transition-all duration-200
                        border ${isDark ? 'border-gray-600' : 'border-gray-200'}
                        group
                    `}
                    aria-label="Go back to home"
                >
                    <ArrowLeft
                        className={`
                            w-5 h-5 transition-transform duration-200
                            ${isDark ? 'text-gray-300' : 'text-gray-700'}
                            group-hover:-translate-x-0.5
                        `}
                    />
                    <span className="sr-only">Back to Home</span>
                </Link>
            </motion.div>

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className={`
                    fixed top-4 right-4 p-2 rounded-full z-50
                    transition-all duration-300
                    ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                    shadow-md hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}
                `}
                aria-label="Toggle Theme"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-yellow-400"
                        >
                            <Sun className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-indigo-600"
                        >
                            <Moon className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/emblem.png"
                            alt="NeuraMark Logo"
                            width={80}
                            height={80}
                            className="rounded-md shadow-md"
                            priority
                        />
                    </div>
                    <h1 className={`text-4xl font-bold mb-4 ${textPrimary}`}>
                        About NeuraMark
                    </h1>
                    <p className={`text-xl max-w-3xl mx-auto ${textSecondary}`}>
                        Your intelligent B.Tech syllabus tracker designed to help students systematically cover their entire curriculum.
                    </p>
                </div>

                {/* Features Section */}
                <div className="mb-20">
                    <h2 className={`text-2xl font-bold mb-8 text-center ${textPrimary}`}>
                        Key Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className={`p-6 rounded-lg shadow-md ${cardBg} border ${borderColor} transition-all hover:shadow-lg`}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                                    isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                    {feature.icon}
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>{feature.title}</h3>
                                <p className={textSecondary}>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Supported Branches */}
                <div className="mb-20">
                    <h2 className={`text-2xl font-bold mb-8 text-center ${textPrimary}`}>
                        Supported Engineering Branches
                    </h2>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${cardBg} p-6 rounded-lg shadow-md ${borderColor} border`}>
                        {branches.map((branch, index) => (
                            <motion.div 
                                key={index} 
                                className="flex items-center"
                                whileHover={{ scale: 1.02 }}
                            >
                                <CheckCircle className={`w-5 h-5 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                <span className={textPrimary}>{branch}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div className={`mb-20 p-8 rounded-lg shadow-md ${cardBg} border ${borderColor}`}>
                    <h2 className={`text-2xl font-bold mb-6 text-center ${textPrimary}`}>
                        How NeuraMark Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                                isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                            }`}>
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>1. Select Your Branch</h3>
                            <p className={textSecondary}>
                                Choose your engineering branch and academic year to see your customized syllabus.
                            </p>
                        </motion.div>
                        <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                                isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'
                            }`}>
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>2. Track Subjects</h3>
                            <p className={textSecondary}>
                                View all subjects for your semester and track your progress module by module.
                            </p>
                        </motion.div>
                        <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                                isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'
                            }`}>
                                <BarChart2 className="w-8 h-8" />
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>3. Monitor Progress</h3>
                            <p className={textSecondary}>
                                Visualize your completion rates and identify areas that need more focus.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>
                        Ready to organize your studies?
                    </h2>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            href="/dashboard"
                            className={`inline-block px-8 py-3 rounded-lg text-lg font-medium ${
                                isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white shadow-md transition-all hover:shadow-lg`}
                        >
                            Get Started with NeuraMark
                        </Link>
                    </motion.div>
                </div>
            </div>
        </main>
    )
}