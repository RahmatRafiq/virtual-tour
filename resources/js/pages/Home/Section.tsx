import { Link } from '@inertiajs/react'
import React from 'react'

interface Props {
  title: string
  href?: string
}

export function Section({ title, href }: Props) {
   return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      {href && (
        <Link
          href={href}
className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition"
        >
          View all →
        </Link>
      )}
    </div>
  )
}
