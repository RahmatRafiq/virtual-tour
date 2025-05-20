// resources/js/Components/Section.tsx
import React from 'react'

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4 mb-24">
      <h2 className="text-3xl font-semibold mb-8">{title}</h2>
      {children}
    </section>
  )
}
