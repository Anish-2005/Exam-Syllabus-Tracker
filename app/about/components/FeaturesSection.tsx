import { motion } from 'framer-motion'

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

type FeaturesSectionProps = {
  features?: Feature[];
  isDark: boolean;
  cardBg: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
};

export default function FeaturesSection({
  features = [],
  isDark,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
}: FeaturesSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <h2 className={`text-3xl font-semibold text-center mb-12 ${textPrimary}`}>
        Key Features
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }, i) => (
          <motion.div
            key={i}
            className={`${cardBg} border ${borderColor} rounded-xl p-7 shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-default`}
            whileHover={{ y: -8 }}
          >
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-full mb-5
                ${isDark ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}
            >
              {icon}
            </div>
            <h3 className={`text-xl font-medium mb-3 ${textPrimary}`}>{title}</h3>
            <p className={`text-base leading-relaxed ${textSecondary}`}>{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
