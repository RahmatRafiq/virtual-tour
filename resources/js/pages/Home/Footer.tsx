import React from 'react'

export function Footer() {
  return (
    <footer className="w-full border-t bg-white dark:bg-[#18181b] py-6 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>
          &copy; {new Date().getFullYear()} VirtualTour. All rights reserved.
        </span>
        <span>
          Made with <span className="text-pink-500">♥</span> by Your Team
        </span>
      </div>
    </footer>
  )
}