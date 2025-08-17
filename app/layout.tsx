import React from 'react'
import './globals.css'
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
