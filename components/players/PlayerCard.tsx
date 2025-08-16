'use client'

import { Player } from '@/lib/supabase'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

interface PlayerCardProps {
    player: Player
    showStats?: boolean
    onSelect?: (player: Player) => void
    isSelected?: boolean
    isCaptain?: boolean
    isViceCaptain?: boolean
}

const positionLabels = {
    GK: 'حارس مرمى',
    DEF: 'مدافع',
    MID: 'لاعب وسط',
    FWD: 'مهاجم'
}

const positionColors = {
    GK: 'bg-yellow-100 text-yellow-800',
    DEF: 'bg-blue-100 text-blue-800',
    MID: 'bg-green-100 text-green-800',
    FWD: 'bg-red-100 text-red-800'
}

export function PlayerCard({
    player,
    showStats = false,
    onSelect,
    isSelected = false,
    isCaptain = false,
    isViceCaptain = false
}: PlayerCardProps) {
    const handleClick = () => {
        if (onSelect) {
            onSelect(player)
        }
    }

    return (
        <div
            className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
                } ${onSelect ? 'cursor-pointer' : ''}`}
            onClick={handleClick}
        >
            {/* Captain/Vice Captain Badge */}
            {(isCaptain || isViceCaptain) && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${isCaptain ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                        {isCaptain ? 'C' : 'VC'}
                    </div>
                </div>
            )}

            <div className="p-4">
                {/* Player Header */}
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {player.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{player.name}</h3>
                        <div className="flex items-center space-x-2 space-x-reverse mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${positionColors[player.position]}`}>
                                {positionLabels[player.position]}
                            </span>
                            <span className="text-sm text-gray-500">• {player.price} مليون</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {showStats && (
                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-gray-600">النقاط</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                                {player.total_points > 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span className={`font-semibold ${player.total_points > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {player.total_points}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
