'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useEffect, useState } from 'react'
import { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const [userProfile, setUserProfile] = useState<User | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [profileLoading, setProfileLoading] = useState(true)

    useEffect(() => {
        async function fetchUserProfile() {
            if (!user) return

            try {
                // Try to fetch from public.users first
                const { data: profile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    console.log('Error fetching user profile:', error)
                    // If user doesn't exist in public.users, create them
                    if (error.code === 'PGRST116') {
                        const { data: newProfile, error: insertError } = await supabase
                            .from('users')
                            .insert({
                                id: user.id,
                                email: user.email!,
                                full_name: user.user_metadata?.full_name || 'مستخدم جديد',
                                role: 'user'
                            })
                            .select()
                            .single()

                        if (insertError) {
                            console.error('Error creating user profile:', insertError)
                            // Fallback to basic profile
                            const fallbackProfile: User = {
                                id: user.id,
                                email: user.email!,
                                full_name: user.user_metadata?.full_name || 'مستخدم جديد',
                                role: 'user',
                                created_at: new Date().toISOString()
                            }
                            setUserProfile(fallbackProfile)
                            setIsAdmin(false)
                        } else {
                            setUserProfile(newProfile)
                            setIsAdmin(newProfile.role === 'admin')
                        }
                    }
                } else {
                    setUserProfile(profile)
                    setIsAdmin(profile.role === 'admin')
                }
            } catch (error) {
                console.error('Error in fetchUserProfile:', error)
                // Fallback to basic profile
                const fallbackProfile: User = {
                    id: user.id,
                    email: user.email!,
                    full_name: user.user_metadata?.full_name || 'مستخدم جديد',
                    role: 'user',
                    created_at: new Date().toISOString()
                }
                setUserProfile(fallbackProfile)
                setIsAdmin(false)
            } finally {
                setProfileLoading(false)
            }
        }

        if (user) {
            fetchUserProfile()
        }
    }, [user])

    if (loading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!user) {
        window.location.href = '/'
        return null
    }

    return (
        <AppLayout userRole={isAdmin ? 'admin' : 'user'}>
            {isAdmin ? (
                <AdminDashboard />
            ) : (
                <UserDashboard user={userProfile} />
            )}
        </AppLayout>
    )
} 