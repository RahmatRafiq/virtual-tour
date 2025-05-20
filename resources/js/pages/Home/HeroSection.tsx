import React from 'react'
import { motion } from 'framer-motion'

interface HeroSectionProps {
    title: string
    subtitle: string
    cta: { label: string; link: string }
}

export function HeroSection({ title, subtitle, cta }: HeroSectionProps) {
    return (
        <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 md:py-32 overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold">{title}</h1>
                <p className="mt-4 text-lg md:text-xl">{subtitle}</p>
                <a
                    href={cta.link}
                    className="mt-8 inline-block px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition"
                >
                    {cta.label}
                </a>
            </div>
            <motion.div
                className="absolute -bottom-20 -right-20 w-96 h-96 bg-white opacity-10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ loop: Infinity, duration: 120 }}
            />
        </section>
    )
}
