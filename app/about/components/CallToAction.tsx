import Link from 'next/link'
import { motion } from 'framer-motion'

interface CallToActionProps {
  isDark: boolean;
  textPrimary: string;
}

export default function CallToAction({ isDark, textPrimary }: CallToActionProps) {
  return (
    <section className="text-center max-w-xl mx-auto mb-16 px-4">
      <h2 className={`text-3xl font-bold mb-8 ${textPrimary}`}>
        Ready to organize your studies?
      </h2>
      <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} className="inline-block">
        <Link
          href="/dashboard"
          className={`
            inline-block px-10 py-4 rounded-lg font-semibold text-lg
            transition-colors duration-300 shadow-lg
            ${isDark
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
          `}
        >
          Get Started with NeuraMark
        </Link>
      </motion.div>
    </section>
  )
}
