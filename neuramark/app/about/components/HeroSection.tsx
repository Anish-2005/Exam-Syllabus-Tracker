import Image from 'next/image'

export default function HeroSection({ isDark: _isDark, textPrimary, textSecondary }) {
  return (
    <section className="text-center mb-20 max-w-3xl mx-auto px-4">
      <div className="flex justify-center mb-8">
        <Image
          src="/emblem.png"
          alt="NeuraMark Logo"
          width={100}
          height={100}
          className="rounded-lg shadow-lg"
          priority
        />
      </div>
      <h1
        className={`text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 ${textPrimary}`}
        style={{ lineHeight: 1.1 }}
      >
        About NeuraMark
      </h1>
      <p
        className={`text-lg sm:text-xl max-w-xl mx-auto leading-relaxed ${textSecondary}`}
        style={{ letterSpacing: '0.015em' }}
      >
        Your intelligent B.Tech syllabus tracker designed to help students systematically cover their entire curriculum with ease and insight.
      </p>
    </section>
  )
}
