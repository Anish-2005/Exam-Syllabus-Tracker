import { Users, FileText, BarChart2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface HowItWorksSectionProps {
  isDark: boolean;
  cardBg: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
}

export default function HowItWorksSection({
  isDark,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
}: HowItWorksSectionProps) {
  const steps = [
    {
      icon: <Users className="w-9 h-9" />,
      title: 'Select Your Branch',
      description: 'Choose your engineering branch and academic year to see your customized syllabus.',
      colorLight: 'bg-blue-100 text-blue-600',
      colorDark: 'bg-blue-900/60 text-blue-300'
    },
    {
      icon: <FileText className="w-9 h-9" />,
      title: 'Track Subjects',
      description: 'View all subjects for your semester and track your progress module by module.',
      colorLight: 'bg-purple-100 text-purple-600',
      colorDark: 'bg-purple-900/60 text-purple-300'
    },
    {
      icon: <BarChart2 className="w-9 h-9" />,
      title: 'Monitor Progress',
      description: 'Visualize your completion rates and identify areas that need more focus.',
      colorLight: 'bg-green-100 text-green-600',
      colorDark: 'bg-green-900/60 text-green-300'
    }
  ]

  return (
    <section className={`${cardBg} border ${borderColor} rounded-2xl shadow-lg max-w-6xl mx-auto px-6 py-12 mb-24`}>
      <h2 className={`text-3xl font-semibold text-center mb-12 ${textPrimary}`}>
        How NeuraMark Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map(({ icon, title, description, colorLight, colorDark }, i) => (
          <motion.div
            key={i}
            className="text-center cursor-default rounded-xl p-6"
            whileHover={{ scale: 1.07 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                isDark ? colorDark : colorLight
              }`}
            >
              {icon}
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${textPrimary}`}>{title}</h3>
            <p className={`text-base leading-relaxed ${textSecondary}`}>
              {description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
