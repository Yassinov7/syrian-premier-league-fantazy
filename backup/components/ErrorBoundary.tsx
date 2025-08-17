'use client'

import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            حدث خطأ ما 😕
                        </h2>
                        <p className="text-gray-600 mb-6">
                            عذراً، حدث خطأ غير متوقع. يرجى تحديث الصفحة والمحاولة مرة أخرى.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            تحديث الصفحة
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
