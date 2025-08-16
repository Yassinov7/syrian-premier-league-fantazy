'use client'

import { Player } from '@/lib/supabase'
import { Users, Trophy, DollarSign, CheckCircle, AlertCircle, Target, TrendingUp } from 'lucide-react'

interface TeamSummaryProps {
    selectedPlayers: Player[]
    budget: number
    captainId?: string
    viceCaptainId?: string
}

export function TeamSummary({
    selectedPlayers,
    budget,
    captainId,
    viceCaptainId
}: TeamSummaryProps) {
    const getTotalCost = () => {
        return selectedPlayers.reduce((sum, player) => sum + player.price, 0)
    }

    const getTotalPoints = () => {
        return selectedPlayers.reduce((sum, player) => sum + player.total_points, 0)
    }

    const getRemainingBudget = () => {
        return budget - getTotalCost()
    }

    const getPositionCount = (position: string) => {
        return selectedPlayers.filter(p => p.position === position).length
    }

    const getPositionRequirements = () => {
        const requirements = {
            GK: { min: 2, max: 2, current: getPositionCount('GK') },
            DEF: { min: 5, max: 5, current: getPositionCount('DEF') },
            MID: { min: 5, max: 5, current: getPositionCount('MID') },
            FWD: { min: 3, max: 3, current: getPositionCount('FWD') }
        }

        return requirements
    }

    const isTeamValid = () => {
        const requirements = getPositionRequirements()
        const hasValidPositions = Object.values(requirements).every(req => 
            req.current >= req.min && req.current <= req.max
        )
        const hasValidBudget = getRemainingBudget() >= 0
        const hasValidSize = selectedPlayers.length === 15

        return hasValidPositions && hasValidBudget && hasValidSize
    }

    const getTeamStrength = () => {
        if (selectedPlayers.length === 0) return 0
        const avgPoints = getTotalPoints() / selectedPlayers.length
        const avgPrice = getTotalCost() / selectedPlayers.length
        
        // Simple strength calculation based on points and price efficiency
        return Math.round((avgPoints * 0.7) + ((15 - avgPrice) * 0.3))
    }

    const getCaptainBonus = () => {
        if (!captainId) return 0
        const captain = selectedPlayers.find(p => p.id === captainId)
        return captain ? Math.round(captain.total_points * 0.5) : 0
    }

    const getViceCaptainBonus = () => {
        if (!viceCaptainId) return 0
        const viceCaptain = selectedPlayers.find(p => p.id === viceCaptainId)
        return viceCaptain ? Math.round(viceCaptain.total_points * 0.25) : 0
    }

    const requirements = getPositionRequirements()
    const remainingBudget = getRemainingBudget()
    const teamStrength = getTeamStrength()

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">ملخص الفريق</h2>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isTeamValid() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                }`}>
                    {isTeamValid() ? 'الفريق جاهز' : 'الفريق غير مكتمل'}
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">اللاعبين</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedPlayers.length}/15</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">الميزانية المتبقية</p>
                    <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {remainingBudget}M
                    </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">إجمالي النقاط</p>
                    <p className="text-2xl font-bold text-yellow-600">{getTotalPoints()}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">قوة الفريق</p>
                    <p className="text-2xl font-bold text-purple-600">{teamStrength}</p>
                </div>
            </div>

            {/* Budget Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">الميزانية</span>
                    <span className="text-sm text-gray-600">{getTotalCost()}M / {budget}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                            remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((getTotalCost() / budget) * 100, 100)}%` }}
                    ></div>
                </div>
                {remainingBudget < 0 && (
                    <p className="text-sm text-red-600 mt-1">تجاوزت الميزانية المخصصة</p>
                )}
            </div>

            {/* Position Requirements */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">متطلبات المراكز</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(requirements).map(([position, req]) => {
                        const isValid = req.current >= req.min && req.current <= req.max
                        const positionLabels = {
                            GK: 'حارس مرمى',
                            DEF: 'مدافع',
                            MID: 'لاعب وسط',
                            FWD: 'مهاجم'
                        }
                        
                        return (
                            <div key={position} className={`text-center p-3 rounded-lg border-2 ${
                                isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="text-sm text-gray-600">{positionLabels[position as keyof typeof positionLabels]}</div>
                                <div className={`text-lg font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {req.current}/{req.min}
                                </div>
                                {!isValid && (
                                    <div className="text-xs text-red-600">
                                        {req.current < req.min ? 'ناقص' : 'زائد'}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Captain and Vice Captain */}
            {(captainId || viceCaptainId) && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">القائد ونائب القائد</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {captainId && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                                        C
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {selectedPlayers.find(p => p.id === captainId)?.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            +{getCaptainBonus()} نقطة إضافية
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {viceCaptainId && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                                        VC
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {selectedPlayers.find(p => p.id === viceCaptainId)?.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            +{getViceCaptainBonus()} نقطة إضافية
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Team Analysis */}
            <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">تحليل الفريق</h4>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">متوسط السعر:</span>
                        <span className="text-sm font-medium text-gray-900">
                            {selectedPlayers.length > 0 ? Math.round((getTotalCost() / selectedPlayers.length) * 10) / 10 : 0}M
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">متوسط النقاط:</span>
                        <span className="text-sm font-medium text-gray-900">
                            {selectedPlayers.length > 0 ? Math.round((getTotalPoints() / selectedPlayers.length) * 10) / 10 : 0}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">كفاءة السعر:</span>
                        <span className="text-sm font-medium text-gray-900">
                            {selectedPlayers.length > 0 ? Math.round((getTotalPoints() / getTotalCost()) * 10) / 10 : 0} نقطة/مليون
                        </span>
                    </div>
                </div>
            </div>

            {/* Warnings */}
            {!isTeamValid() && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 ml-2" />
                        <div>
                            <p className="text-red-800 font-medium">يجب إصلاح المشاكل التالية:</p>
                            <ul className="text-red-700 text-sm mt-1 space-y-1">
                                {selectedPlayers.length !== 15 && (
                                    <li>• عدد اللاعبين يجب أن يكون 15</li>
                                )}
                                {remainingBudget < 0 && (
                                    <li>• تجاوزت الميزانية المخصصة</li>
                                )}
                                {Object.entries(requirements).map(([position, req]) => {
                                    if (req.current < req.min || req.current > req.max) {
                                        const positionLabels = {
                                            GK: 'حارس مرمى',
                                            DEF: 'مدافع',
                                            MID: 'لاعب وسط',
                                            FWD: 'مهاجم'
                                        }
                                        return (
                                            <li key={position}>
                                                • {positionLabels[position as keyof typeof positionLabels]}: {req.current}/{req.min}
                                            </li>
                                        )
                                    }
                                    return null
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
