import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lucky Duck Dealz - Owner Dashboard',
  description: 'Financial dashboard for Lucky Duck Dealz',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
