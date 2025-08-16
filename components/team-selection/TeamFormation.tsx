'use client'

import { Player } from '@/lib/supabase'
import { PlayerCard } from '@/components/players/PlayerCard'
import { Users, Trophy, DollarSign } from 'lucide-react'

interface TeamFormationProps {
    selectedPlayers: Player[]
    onRemovePlayer: (playerId: string) => void
    onSetCaptain: (playerId: string) => void
    onSetViceCaptain: (playerId: string) => void
    captainId?: string
    viceCaptainId?: string
}

const positionColors = {
    GK: 'bg-yellow-100 border-yellow-300',
    DEF: 'bg-blue-100 border-blue-300',
    MID: 'bg-green-100 border-green-300',
    FWD: 'bg-red-100 border-red-300'
}

const positionLabels = {
    GK: 'حارس مرمى',
    DEF: 'مدافع',
    MID: 'لاعب وسط',
    FWD: 'مهاجم'
}

export function TeamFormation({
    selectedPlayers,
    onRemovePlayer,
    onSetCaptain,
    onSetViceCaptain,
    captainId,
    viceCaptainId
}: TeamFormationProps) {
    const getPlayersByPosition = (position: string) => {
        return selectedPlayers.filter(p => p.position === position)
    }

    const getTotalCost = () => {
        return selectedPlayers.reduce((sum, player) => sum + player.price, 0)
    }

    const getTotalPoints = () => {
        return selectedPlayers.reduce((sum, player) => sum + player.total_points, 0)
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">تشكيلة الفريق</h2>
                <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">{selectedPlayers.length}/15</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">{getTotalPoints()} نقطة</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">{getTotalCost()} مليون</span>
                    </div>
                </div>
            </div>

            {/* Football Field Layout */}
            <div className="relative bg-gradient-to-b from-green-400 to-green-600 rounded-lg p-6 mb-6 min-h-[400px]">
                {/* Field Lines */}
                <div className="absolute inset-0 border-2 border-white border-opacity-30 rounded-lg"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white bg-opacity-30 transform -translate-y-1/2"></div>
                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white bg-opacity-20 transform -translate-y-1/2"></div>
                <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white bg-opacity-20 transform -translate-y-1/2"></div>
                
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white border-opacity-30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                {/* Goalkeeper Area */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-2">حارس مرمى</div>
                        <div className="space-y-2">
                            {getPlayersByPosition('GK').map((player) => (
                                <div
                                    key={player.id}
                                    className={`${positionColors.GK} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform`}
                                    onClick={() => onRemovePlayer(player.id)}
                                >
                                    <div className="text-xs font-medium text-gray-800">{player.name}</div>
                                    <div className="text-xs text-gray-600">{player.price}M</div>
                                    <div className="flex justify-center space-x-1 space-x-reverse mt-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                captainId === player.id 
                                                    ? 'bg-yellow-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-yellow-400 hover:text-white'
                                            }`}
                                        >
                                            C
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetViceCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                viceCaptainId === player.id 
                                                    ? 'bg-gray-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-gray-400 hover:text-white'
                                            }`}
                                        >
                                            VC
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Defenders Area */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-2">مدافعون</div>
                        <div className="grid grid-cols-5 gap-2">
                            {getPlayersByPosition('DEF').map((player) => (
                                <div
                                    key={player.id}
                                    className={`${positionColors.DEF} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform`}
                                    onClick={() => onRemovePlayer(player.id)}
                                >
                                    <div className="text-xs font-medium text-gray-800">{player.name}</div>
                                    <div className="text-xs text-gray-600">{player.price}M</div>
                                    <div className="flex justify-center space-x-1 space-x-reverse mt-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                captainId === player.id 
                                                    ? 'bg-yellow-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-yellow-400 hover:text-white'
                                            }`}
                                        >
                                            C
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetViceCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                viceCaptainId === player.id 
                                                    ? 'bg-gray-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-gray-400 hover:text-white'
                                            }`}
                                        >
                                            VC
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Midfielders Area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-2">لاعبو الوسط</div>
                        <div className="grid grid-cols-5 gap-2">
                            {getPlayersByPosition('MID').map((player) => (
                                <div
                                    key={player.id}
                                    className={`${positionColors.MID} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform`}
                                    onClick={() => onRemovePlayer(player.id)}
                                >
                                    <div className="text-xs font-medium text-gray-800">{player.name}</div>
                                    <div className="text-xs text-gray-600">{player.price}M</div>
                                    <div className="flex justify-center space-x-1 space-x-reverse mt-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                captainId === player.id 
                                                    ? 'bg-yellow-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-yellow-400 hover:text-white'
                                            }`}
                                        >
                                            C
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetViceCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                viceCaptainId === player.id 
                                                    ? 'bg-gray-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-gray-400 hover:text-white'
                                            }`}
                                        >
                                            VC
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Forwards Area */}
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-2">مهاجمون</div>
                        <div className="grid grid-cols-3 gap-2">
                            {getPlayersByPosition('FWD').map((player) => (
                                <div
                                    key={player.id}
                                    className={`${positionColors.FWD} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform`}
                                    onClick={() => onRemovePlayer(player.id)}
                                >
                                    <div className="text-xs font-medium text-gray-800">{player.name}</div>
                                    <div className="text-xs text-gray-600">{player.price}M</div>
                                    <div className="flex justify-center space-x-1 space-x-reverse mt-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                captainId === player.id 
                                                    ? 'bg-yellow-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-yellow-400 hover:text-white'
                                            }`}
                                        >
                                            C
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSetViceCaptain(player.id)
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                viceCaptainId === player.id 
                                                    ? 'bg-gray-500 text-white' 
                                                    : 'bg-white bg-opacity-70 text-gray-700 hover:bg-gray-400 hover:text-white'
                                            }`}
                                        >
                                            VC
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Position Summary */}
            <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-gray-600">حارس مرمى</div>
                    <div className="text-lg font-bold text-yellow-600">{getPlayersByPosition('GK').length}/2</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">مدافعون</div>
                    <div className="text-lg font-bold text-blue-600">{getPlayersByPosition('DEF').length}/5</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">لاعبو الوسط</div>
                    <div className="text-lg font-bold text-green-600">{getPlayersByPosition('MID').length}/5</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600">مهاجمون</div>
                    <div className="text-lg font-bold text-red-600">{getPlayersByPosition('FWD').length}/3</div>
                </div>
            </div>
        </div>
    )
}
