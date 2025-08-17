import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'فانتازي الدوري السوري الممتاز',
  description: 'تطبيق فانتازي كرة القدم للدوري السوري الممتاز',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🏗️ RootLayout is rendering - WITH ALL PROVIDERS')

  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons */}
        <link rel="icon" href="/assets/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/assets/android-chrome-512x512.png" />

        {/* Theme and Display */}
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="background-color" content="#ffffff" />
      </head>

      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <ConfirmDialogProvider>
                {children}
              </ConfirmDialogProvider>
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
