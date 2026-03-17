import type { Metadata } from 'next'
import './globals.css'
import { DashboardDataProvider } from '@/context/DashboardData'

export const metadata: Metadata = {
  title: 'Lucky Duck Dealz - Owners Space',
  description: 'Business command center for Lucky Duck Dealz',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <DashboardDataProvider>{children}</DashboardDataProvider>
      </body>
    </html>
  )
}
