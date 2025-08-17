'use client'

import { Player } from '@/lib/supabase'
import { PlayerCard } from '@/components/players/PlayerCard'
import { Users, Trophy, DollarSign, Star, Shield, Zap } from 'lucide-react'

interface TeamFormationProps {
    selectedPlayers: Player[]
    onRemovePlayer: (playerId: string) => void
    onSetCaptain: (playerId: string) => void
    onSetViceCaptain: (playerId: string) => void
    onToggleStartingXI: (playerId: string) => void
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

// Premier League Fantasy Rules
const FORMATION_RULES = {
    MIN_PLAYERS: 11,
    MAX_PLAYERS: 15,
    POSITION_LIMITS: {
        GK: { min: 1, max: 2 },
        DEF: { min: 3, max: 6 },
        MID: { min: 3, max: 6 },
        FWD: { min: 1, max: 3 }
    },
    STARTING_XI: 11
}

export function TeamFormation({
    selectedPlayers,
    onRemovePlayer,
    onSetCaptain,
    onSetViceCaptain,
    onToggleStartingXI,
    captainId,
    viceCaptainId
}: TeamFormationProps) {
    const getPlayersByPosition = (position: string) => {
        return selectedPlayers.filter(p => p.position === position)
    }

    const getStartingXIPlayers = () => {
        return selectedPlayers.filter(p => p.isStartingXI !== false)
    }

    const getSubstitutePlayers = () => {
        return selectedPlayers.filter(p => p.isStartingXI === false)
    }

    const getTotalCost = () => {
        return selectedPlayers.reduce((sum, player) => sum + player.price, 0)
    }

    const getTotalPoints = () => {
        // Only starting XI players get points
        return getStartingXIPlayers().reduce((sum, player) => {
            let points = player.current_week_points || 0
            // Captain gets double points
            if (captainId === player.id) points *= 2
            // Vice captain gets 1.5x points
            else if (viceCaptainId === player.id) points *= 1.5
            return sum + points
        }, 0)
    }

    const getFormationValidation = () => {
        const gkCount = getPlayersByPosition('GK').length
        const defCount = getPlayersByPosition('DEF').length
        const midCount = getPlayersByPosition('MID').length
        const fwdCount = getPlayersByPosition('FWD').length
        const totalCount = selectedPlayers.length
        const startingXICount = getStartingXIPlayers().length

        const errors: string[] = []
        const warnings: string[] = []

        // Check minimum players
        if (totalCount < FORMATION_RULES.MIN_PLAYERS) {
            errors.push(`يجب اختيار ${FORMATION_RULES.MIN_PLAYERS} لاعب على الأقل`)
        }

        // Check maximum players
        if (totalCount > FORMATION_RULES.MAX_PLAYERS) {
            errors.push(`لا يمكن اختيار أكثر من ${FORMATION_RULES.MAX_PLAYERS} لاعب`)
        }

        // Check starting XI
        if (startingXICount !== FORMATION_RULES.STARTING_XI) {
            errors.push(`يجب اختيار ${FORMATION_RULES.STARTING_XI} لاعب أساسيين`)
        }

        // Check position limits
        if (gkCount < FORMATION_RULES.POSITION_LIMITS.GK.min) {
            errors.push(`يجب اختيار ${FORMATION_RULES.POSITION_LIMITS.GK.min} حارس مرمى على الأقل`)
        }
        if (gkCount > FORMATION_RULES.POSITION_LIMITS.GK.max) {
            errors.push(`لا يمكن اختيار أكثر من ${FORMATION_RULES.POSITION_LIMITS.GK.max} حارس مرمى`)
        }

        if (defCount < FORMATION_RULES.POSITION_LIMITS.DEF.min) {
            errors.push(`يجب اختيار ${FORMATION_RULES.POSITION_LIMITS.DEF.min} مدافع على الأقل`)
        }
        if (defCount > FORMATION_RULES.POSITION_LIMITS.DEF.max) {
            errors.push(`لا يمكن اختيار أكثر من ${FORMATION_RULES.POSITION_LIMITS.DEF.max} مدافع`)
        }

        if (midCount < FORMATION_RULES.POSITION_LIMITS.MID.min) {
            errors.push(`يجب اختيار ${FORMATION_RULES.POSITION_LIMITS.MID.min} لاعب وسط على الأقل`)
        }
        if (midCount > FORMATION_RULES.POSITION_LIMITS.MID.max) {
            errors.push(`لا يمكن اختيار أكثر من ${FORMATION_RULES.POSITION_LIMITS.MID.max} لاعب وسط`)
        }

        if (fwdCount < FORMATION_RULES.POSITION_LIMITS.FWD.min) {
            errors.push(`يجب اختيار ${FORMATION_RULES.POSITION_LIMITS.FWD.min} مهاجم على الأقل`)
        }
        if (fwdCount > FORMATION_RULES.POSITION_LIMITS.FWD.max) {
            errors.push(`لا يمكن اختيار أكثر من ${FORMATION_RULES.POSITION_LIMITS.FWD.max} مهاجم`)
        }

        // Check captain and vice captain
        if (!captainId) {
            errors.push('يجب اختيار كابتن للفريق')
        }
        if (!viceCaptainId) {
            errors.push('يجب اختيار نائب كابتن للفريق')
        }

        return { errors, warnings, isValid: errors.length === 0 }
    }

    const validation = getFormationValidation()

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">تشكيلة الفريق</h2>
                <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">{selectedPlayers.length}/15</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">{getStartingXIPlayers().length}/11 أساسيين</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Trophy className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-gray-600">{getTotalPoints()} نقطة</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">{getTotalCost()} مليون</span>
                    </div>
                </div>
            </div>

            {/* Validation Messages */}
            {validation.errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-medium mb-2">أخطاء في التشكيلة:</h3>
                    <ul className="text-red-700 text-sm space-y-1">
                        {validation.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Football Field Layout - Improved */}
            <div className="relative bg-gradient-to-b from-green-400 to-green-600 rounded-lg p-6 mb-6 min-h-[500px]">
                {/* Field Lines */}
                <div className="absolute inset-0 border-2 border-white border-opacity-30 rounded-lg"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white bg-opacity-30 transform -translate-y-1/2"></div>
                <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white bg-opacity-20 transform -translate-y-1/2"></div>
                <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white bg-opacity-20 transform -translate-y-1/2"></div>

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white border-opacity-30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                {/* Goalkeeper Area - Bottom */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-3">حارس مرمى</div>
                        <div className="grid grid-cols-2 gap-3">
                            {getPlayersByPosition('GK').map((player) => (
                                <PlayerFieldCard
                                    key={player.id}
                                    player={player}
                                    position="GK"
                                    isStartingXI={player.isStartingXI !== false}
                                    isCaptain={captainId === player.id}
                                    isViceCaptain={viceCaptainId === player.id}
                                    onRemove={onRemovePlayer}
                                    onSetCaptain={onSetCaptain}
                                    onSetViceCaptain={onSetViceCaptain}
                                    onToggleStartingXI={onToggleStartingXI}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Defenders Area */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-3">مدافعون</div>
                        <div className="grid grid-cols-6 gap-2">
                            {getPlayersByPosition('DEF').map((player) => (
                                <PlayerFieldCard
                                    key={player.id}
                                    player={player}
                                    position="DEF"
                                    isStartingXI={player.isStartingXI !== false}
                                    isCaptain={captainId === player.id}
                                    isViceCaptain={viceCaptainId === player.id}
                                    onRemove={onRemovePlayer}
                                    onSetCaptain={onSetCaptain}
                                    onSetViceCaptain={onSetViceCaptain}
                                    onToggleStartingXI={onToggleStartingXI}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Midfielders Area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-3">لاعبو الوسط</div>
                        <div className="grid grid-cols-6 gap-2">
                            {getPlayersByPosition('MID').map((player) => (
                                <PlayerFieldCard
                                    key={player.id}
                                    player={player}
                                    position="MID"
                                    isStartingXI={player.isStartingXI !== false}
                                    isCaptain={captainId === player.id}
                                    isViceCaptain={viceCaptainId === player.id}
                                    onRemove={onRemovePlayer}
                                    onSetCaptain={onSetCaptain}
                                    onSetViceCaptain={onSetViceCaptain}
                                    onToggleStartingXI={onToggleStartingXI}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Forwards Area - Top */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                        <div className="text-white text-xs font-medium mb-3">مهاجمون</div>
                        <div className="grid grid-cols-3 gap-3">
                            {getPlayersByPosition('FWD').map((player) => (
                                <PlayerFieldCard
                                    key={player.id}
                                    player={player}
                                    position="FWD"
                                    isStartingXI={player.isStartingXI !== false}
                                    isCaptain={captainId === player.id}
                                    isViceCaptain={viceCaptainId === player.id}
                                    onRemove={onRemovePlayer}
                                    onSetCaptain={onSetCaptain}
                                    onSetViceCaptain={onSetViceCaptain}
                                    onToggleStartingXI={onToggleStartingXI}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Position Summary with Limits */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <div className="text-sm text-gray-600">حارس مرمى</div>
                    <div className="text-lg font-bold text-yellow-600">
                        {getPlayersByPosition('GK').length}/{FORMATION_RULES.POSITION_LIMITS.GK.max}
                    </div>
                    <div className="text-xs text-gray-500">الحد الأدنى: {FORMATION_RULES.POSITION_LIMITS.GK.min}</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="text-sm text-gray-600">مدافعون</div>
                    <div className="text-lg font-bold text-blue-600">
                        {getPlayersByPosition('DEF').length}/{FORMATION_RULES.POSITION_LIMITS.DEF.max}
                    </div>
                    <div className="text-xs text-gray-500">الحد الأدنى: {FORMATION_RULES.POSITION_LIMITS.DEF.min}</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="text-sm text-gray-600">لاعبو الوسط</div>
                    <div className="text-lg font-bold text-green-600">
                        {getPlayersByPosition('MID').length}/{FORMATION_RULES.POSITION_LIMITS.MID.max}
                    </div>
                    <div className="text-xs text-gray-500">الحد الأدنى: {FORMATION_RULES.POSITION_LIMITS.MID.min}</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="text-sm text-gray-600">مهاجمون</div>
                    <div className="text-lg font-bold text-red-600">
                        {getPlayersByPosition('FWD').length}/{FORMATION_RULES.POSITION_LIMITS.FWD.max}
                    </div>
                    <div className="text-xs text-gray-500">الحد الأدنى: {FORMATION_RULES.POSITION_LIMITS.FWD.min}</div>
                </div>
            </div>

            {/* Starting XI vs Substitutes */}
            <div className="grid grid-cols-2 gap-6">
                {/* Starting XI */}
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        التشكيلة الأساسية (11 لاعب)
                    </h3>
                    <div className="space-y-2">
                        {getStartingXIPlayers().map((player) => (
                            <div key={player.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <div className={`w-3 h-3 rounded-full ${positionColors[player.position as keyof typeof positionColors]}`}></div>
                                    <span className="text-sm font-medium">{player.name}</span>
                                    {captainId === player.id && <span className="text-yellow-600 text-xs">(C)</span>}
                                    {viceCaptainId === player.id && <span className="text-gray-600 text-xs">(VC)</span>}
                                </div>
                                <div className="text-xs text-gray-600">{player.current_week_points || 0} نقطة</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Substitutes */}
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        الاحتياط (4 لاعب)
                    </h3>
                    <div className="space-y-2">
                        {getSubstitutePlayers().map((player) => (
                            <div key={player.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <div className={`w-3 h-3 rounded-full ${positionColors[player.position as keyof typeof positionColors]}`}></div>
                                    <span className="text-sm font-medium">{player.name}</span>
                                </div>
                                <div className="text-xs text-gray-500">احتياط</div>
                            </div>
                        ))}
                        {getSubstitutePlayers().length === 0 && (
                            <div className="text-center text-gray-500 text-sm py-4">
                                لا يوجد لاعبين احتياط
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// New component for player cards on the field
interface PlayerFieldCardProps {
    player: Player
    position: string
    isStartingXI: boolean
    isCaptain: boolean
    isViceCaptain: boolean
    onRemove: (playerId: string) => void
    onSetCaptain: (playerId: string) => void
    onSetViceCaptain: (playerId: string) => void
    onToggleStartingXI: (playerId: string) => void
}

function PlayerFieldCard({
    player,
    position,
    isStartingXI,
    isCaptain,
    isViceCaptain,
    onRemove,
    onSetCaptain,
    onSetViceCaptain,
    onToggleStartingXI
}: PlayerFieldCardProps) {
    const baseClasses = `${positionColors[position as keyof typeof positionColors]} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform`
    const startingXIClasses = isStartingXI ? 'ring-2 ring-green-500' : 'opacity-70'
    const captainClasses = isCaptain ? 'ring-2 ring-yellow-500' : ''
    const viceCaptainClasses = isViceCaptain ? 'ring-2 ring-gray-500' : ''

    return (
        <div
            className={`${baseClasses} ${startingXIClasses} ${captainClasses} ${viceCaptainClasses}`}
            onClick={() => onRemove(player.id)}
        >
            <div className="text-xs font-medium text-gray-800 truncate">{player.name}</div>
            <div className="text-xs text-gray-600">{player.price}M</div>
            <div className="text-xs text-gray-500">{player.current_week_points || 0} نقطة</div>

            <div className="flex justify-center space-x-1 space-x-reverse mt-2">
                {/* Starting XI Toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleStartingXI(player.id)
                    }}
                    className={`px-2 py-1 text-xs rounded ${isStartingXI
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-green-400 hover:text-white'
                        }`}
                    title={isStartingXI ? 'إزالة من الأساسيين' : 'إضافة للأساسيين'}
                >
                    {isStartingXI ? '✓' : '○'}
                </button>

                {/* Captain Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onSetCaptain(player.id)
                    }}
                    className={`px-2 py-1 text-xs rounded ${isCaptain
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white bg-opacity-70 text-gray-700 hover:bg-yellow-400 hover:text-white'
                        }`}
                    title="تعيين كابتن"
                >
                    C
                </button>

                {/* Vice Captain Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onSetViceCaptain(player.id)
                    }}
                    className={`px-2 py-1 text-xs rounded ${isViceCaptain
                        ? 'bg-gray-500 text-white'
                        : 'bg-white bg-opacity-70 text-gray-700 hover:bg-gray-400 hover:text-white'
                        }`}
                    title="تعيين نائب كابتن"
                >
                    VC
                </button>
            </div>
        </div>
    )
}
