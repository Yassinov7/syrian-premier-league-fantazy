'use client'

import { Match, Club } from '@/lib/supabase'
import { Calendar, Clock, Trophy, Users } from 'lucide-react'

interface MatchCardProps {
    match: Match
    homeClub?: Club
    awayClub?: Club
    onViewDetails?: (match: Match) => void
    showActions?: boolean
}

const statusConfig = {
    scheduled: { label: 'مجدولة', color: 'bg-gray-100 text-gray-800' },
    live: { label: 'مباشر', color: 'bg-red-100 text-red-800' },
    finished: { label: 'منتهية', color: 'bg-green-100 text-green-800' }
}

export function MatchCard({ match, homeClub, awayClub, onViewDetails, showActions = false }: MatchCardProps) {
    const status = statusConfig[match.status]
    const matchDate = new Date(match.match_date)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            {/* Match Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                        {matchDate.toLocaleDateString('ar-SA')}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {/* Teams */}
            <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                            {homeClub?.name.charAt(0) || 'H'}
                        </div>
                        <h3 className="font-semibold text-gray-900">{homeClub?.name || 'فريق مضيف'}</h3>
                    </div>
                    
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">VS</div>
                        <div className="text-sm text-gray-500">
                            {matchDate.toLocaleTimeString('ar-SA', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                            {awayClub?.name.charAt(0) || 'A'}
                        </div>
                        <h3 className="font-semibold text-gray-900">{awayClub?.name || 'فريق ضيف'}</h3>
                    </div>
                </div>
            </div>

            {/* Score (if finished) */}
            {match.status === 'finished' && match.home_score !== undefined && match.away_score !== undefined && (
                <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                        {match.home_score} - {match.away_score}
                    </div>
                </div>
            )}

            {/* Actions */}
            {showActions && onViewDetails && (
                <div className="border-t border-gray-100 pt-4">
                    <button
                        onClick={() => onViewDetails(match)}
                        className="w-full btn-primary"
                    >
                        عرض التفاصيل
                    </button>
                </div>
            )}
        </div>
    )
}
