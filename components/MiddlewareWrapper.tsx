'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog'

interface MiddlewareWrapperProps {
    children: React.ReactNode
}

export function MiddlewareWrapper({ children }: MiddlewareWrapperProps) {
    console.log('🔧 MiddlewareWrapper is rendering')

    return (
        <ErrorBoundary>
            <AuthProvider>
                <ToastProvider>
                    {/* <ConfirmDialogProvider> */}
                        {children}
                    {/* </ConfirmDialogProvider> */}
                </ToastProvider>
            </AuthProvider>
        </ErrorBoundary>
    )
}
