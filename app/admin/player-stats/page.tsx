'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, Player, Match, Club } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function PlayerStatsPage() {
    const { user, loading } = useAuth()
    const [matches, setMatches] = useState<Match[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [selectedMatch, setSelectedMatch] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            const [matchesRes, playersRes, clubsRes] = await Promise.all([
                supabase.from('matches').select('*').eq('status', 'live').order('match_date'),
                supabase.from('players').select('*').order('name'),
                supabase.from('clubs').select('*').order('name')
            ])

            if (matchesRes.data) setMatches(matchesRes.data)
            if (playersRes.data) setPlayers(playersRes.data)
            if (clubsRes.data) setClubs(clubsRes.data)
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
            <DashboardHeader user={user} onSignOut={() => {}} />
            
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">تسجيل إحصائيات اللاعبين</h1>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">اختر المباراة</h2>
                    
                    {matches.length === 0 ? (
                        <p className="text-gray-500">لا توجد مباريات مباشرة حالياً</p>
                    ) : (
                        <div className="space-y-4">
                            {matches.map((match) => (
                                <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {clubs.find(c => c.id === match.home_club_id)?.name} vs {clubs.find(c => c.id === match.away_club_id)?.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(match.match_date).toLocaleDateString('ar-SA')}
                                    </p>
                                    <button
                                        onClick={() => setSelectedMatch(match.id)}
                                        className="btn-primary mt-2"
                                    >
                                        تسجيل الإحصائيات
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedMatch && (
                    <div className="bg-white rounded-lg shadow p-6 mt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">تسجيل إحصائيات اللاعبين</h2>
                        <p>نافذة تسجيل الإحصائيات قيد الإنشاء...</p>
                        <button
                            onClick={() => setSelectedMatch('')}
                            className="btn-secondary mt-4"
                        >
                            إغلاق
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
