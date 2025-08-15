'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useState } from 'react'

export default function HomePage() {
    const { user, loading } = useAuth()
    const [showLogin, setShowLogin] = useState(true)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (user) {
        // Redirect to dashboard
        window.location.href = '/dashboard'
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-primary-700 mb-4">
                        فانتازي الدوري السوري الممتاز
                    </h1>
                    <p className="text-xl text-gray-600">
                        انضم إلى أكبر منصة فانتازي كرة القدم في سوريا
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setShowLogin(true)}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${showLogin
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600'
                                    }`}
                            >
                                تسجيل الدخول
                            </button>
                            <button
                                onClick={() => setShowLogin(false)}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${!showLogin
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600'
                                    }`}
                            >
                                إنشاء حساب
                            </button>
                        </div>

                        {showLogin ? <LoginForm /> : <RegisterForm />}
                    </div>
                </div>
            </div>
        </div>
    )
} 