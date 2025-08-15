'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, Player, Club, UserTeam } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function TeamSelectionPage() {
    const { user, loading } = useAuth()
    const [players, setPlayers] = useState<Player[]>([])
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
    const [budget, setBudget] = useState(100)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            const { data } = await supabase.from('players').select('*')
            if (data) setPlayers(data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>جاري التحميل...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} onSignOut={() => { }} />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">بناء الفريق الفانتازي</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <p>صفحة اختيار الفريق قيد الإنشاء...</p>
                </div>
            </div>
        </div>
    )
}
