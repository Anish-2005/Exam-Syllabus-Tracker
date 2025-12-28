import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

type BranchesSectionProps = {
  branches: string[];
  isDark: boolean;
  cardBg: string;
  borderColor: string;
  textPrimary: string;
};

export default function BranchesSection({ branches, isDark, cardBg, borderColor, textPrimary }: BranchesSectionProps) {
  return (
    <section className={`max-w-5xl mx-auto px-6 sm:px-10 mb-24 ${cardBg} border ${borderColor} rounded-2xl shadow-md py-8`}>
      <h2 className={`text-3xl font-semibold text-center mb-10 ${textPrimary}`}>
        Supported Engineering Branches
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {branches.map((branch, idx) => (
          <motion.div
            key={idx}
            className="flex items-center space-x-3 cursor-default"
            whileHover={{ scale: 1.04 }}
          >
            <CheckCircle
              className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`}
              strokeWidth={2.5}
            />
            <span className={`text-lg font-medium ${textPrimary}`}>
              {branch}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
