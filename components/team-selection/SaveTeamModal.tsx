'use client'

import { useState } from 'react'
import { Player, League } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Save, X, Trophy } from 'lucide-react'

interface SaveTeamModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (teamName: string, captainId: string, viceCaptainId: string) => void
    selectedPlayers: Player[]
    budget: number
    captainId?: string
    viceCaptainId?: string
    selectedLeague?: League | null
}

export function SaveTeamModal({
    isOpen,
    onClose,
    onSave,
    selectedPlayers,
    budget,
    captainId,
    viceCaptainId,
    selectedLeague
}: SaveTeamModalProps) {
    const [teamName, setTeamName] = useState('')
    const [selectedCaptain, setSelectedCaptain] = useState(captainId || '')
    const [selectedViceCaptain, setSelectedViceCaptain] = useState(viceCaptainId || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const getTotalCost = () => {
        return selectedPlayers.reduce((sum, player) => sum + player.price, 0)
    }

    const getPositionCount = (position: string) => {
        return selectedPlayers.filter(p => p.position === position).length
    }

    const getStartingXICount = () => {
        return selectedPlayers.filter(p => p.isStartingXI !== false).length
    }

    const isTeamValid = () => {
        const hasValidSize = selectedPlayers.length >= 11 && selectedPlayers.length <= 15
        const hasValidBudget = (budget - getTotalCost()) >= 0
        const hasValidStartingXI = getStartingXICount() === 11
        const hasValidPositions =
            getPositionCount('GK') >= 1 && getPositionCount('GK') <= 2 &&
            getPositionCount('DEF') >= 3 && getPositionCount('DEF') <= 6 &&
            getPositionCount('MID') >= 3 && getPositionCount('MID') <= 6 &&
            getPositionCount('FWD') >= 1 && getPositionCount('FWD') <= 3
        const hasCaptain = selectedCaptain !== ''
        const hasViceCaptain = selectedViceCaptain !== ''
        const hasValidName = teamName.trim().length > 0
        const hasLeague = selectedLeague !== null

        return hasValidSize && hasValidBudget && hasValidStartingXI && hasValidPositions &&
            hasCaptain && hasViceCaptain && hasValidName && hasLeague
    }

    const handleSave = async () => {
        if (!isTeamValid()) return

        setIsSubmitting(true)
        try {
            await onSave(teamName, selectedCaptain, selectedViceCaptain)
            onClose()
        } catch (error) {
            console.error('Error saving team:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getValidationErrors = () => {
        const errors: string[] = []

        if (selectedPlayers.length < 11) {
            errors.push('يجب أن يكون عدد اللاعبين 11 على الأقل')
        }

        if (selectedPlayers.length > 15) {
            errors.push('لا يمكن أن يتجاوز عدد اللاعبين 15')
        }

        if (getStartingXICount() !== 11) {
            errors.push('يجب أن يكون لديك 11 لاعب أساسيين')
        }

        if ((budget - getTotalCost()) < 0) {
            errors.push('تجاوزت الميزانية المخصصة')
        }

        if (getPositionCount('GK') < 1) {
            errors.push('يجب أن يكون لديك حارس مرمى واحد على الأقل')
        }

        if (getPositionCount('GK') > 2) {
            errors.push('لا يمكن أن يكون لديك أكثر من حارسين مرمى')
        }

        if (getPositionCount('DEF') < 3) {
            errors.push('يجب أن يكون لديك 3 مدافعين على الأقل')
        }

        if (getPositionCount('DEF') > 6) {
            errors.push('لا يمكن أن يكون لديك أكثر من 6 مدافعين')
        }

        if (getPositionCount('MID') < 3) {
            errors.push('يجب أن يكون لديك 3 لاعبي وسط على الأقل')
        }

        if (getPositionCount('MID') > 6) {
            errors.push('لا يمكن أن يكون لديك أكثر من 6 لاعبي وسط')
        }

        if (getPositionCount('FWD') < 1) {
            errors.push('يجب أن يكون لديك مهاجم واحد على الأقل')
        }

        if (getPositionCount('FWD') > 3) {
            errors.push('لا يمكن أن يكون لديك أكثر من 3 مهاجمين')
        }

        if (!selectedCaptain) {
            errors.push('يجب اختيار قائد للفريق')
        }

        if (!selectedViceCaptain) {
            errors.push('يجب اختيار نائب قائد للفريق')
        }

        if (!teamName.trim()) {
            errors.push('يجب إدخال اسم للفريق')
        }

        if (!selectedLeague) {
            errors.push('يجب اختيار دوري للفريق')
        }

        return errors
    }

    const getPositionSummary = () => {
        return [
            { position: 'GK', label: 'حارس مرمى', count: getPositionCount('GK'), min: 1, max: 2, color: 'bg-yellow-100 text-yellow-800' },
            { position: 'DEF', label: 'مدافعون', count: getPositionCount('DEF'), min: 3, max: 6, color: 'bg-blue-100 text-blue-800' },
            { position: 'MID', label: 'لاعبو الوسط', count: getPositionCount('MID'), min: 3, max: 6, color: 'bg-green-100 text-green-800' },
            { position: 'FWD', label: 'مهاجمون', count: getPositionCount('FWD'), min: 1, max: 3, color: 'bg-red-100 text-red-800' }
        ]
    }

    const validationErrors = getValidationErrors()

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">حفظ الفريق</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* League Info */}
                        {selectedLeague && (
                            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <Trophy className="h-5 w-5 text-purple-600" />
                                    <span className="font-medium text-purple-800">
                                        {selectedLeague.name} - {selectedLeague.type === 'public' ? 'دوري عام' : 'دوري خاص'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Team Name Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اسم الفريق *
                            </label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="أدخل اسم الفريق"
                            />
                        </div>

                        {/* Team Summary */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص الفريق</h3>

                            {/* Basic Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900">{selectedPlayers.length}</div>
                                    <div className="text-sm text-gray-600">إجمالي اللاعبين</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900">{getStartingXICount()}</div>
                                    <div className="text-sm text-gray-600">اللاعبين الأساسيين</div>
                                </div>
                            </div>

                            {/* Position Summary */}
                            <div className="grid grid-cols-2 gap-3">
                                {getPositionSummary().map((pos) => (
                                    <div key={pos.position} className={`p-3 rounded-lg ${pos.color}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{pos.label}</span>
                                            <span className="text-sm font-bold">{pos.count}/{pos.max}</span>
                                        </div>
                                        <div className="text-xs opacity-75">الحد الأدنى: {pos.min}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Captain Selection */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">اختيار القائد ونائبه</h3>

                            {/* Captain */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    قائد الفريق *
                                </label>
                                <select
                                    value={selectedCaptain}
                                    onChange={(e) => setSelectedCaptain(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">اختر قائد الفريق</option>
                                    {selectedPlayers.map((player) => (
                                        <option key={player.id} value={player.id}>
                                            {player.name} ({player.position}) - {player.price}M
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vice Captain */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نائب قائد الفريق *
                                </label>
                                <select
                                    value={selectedViceCaptain}
                                    onChange={(e) => setSelectedViceCaptain(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">اختر نائب قائد الفريق</option>
                                    {selectedPlayers
                                        .filter(player => player.id !== selectedCaptain)
                                        .map((player) => (
                                            <option key={player.id} value={player.id}>
                                                {player.name} ({player.position}) - {player.price}M
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        {/* Budget Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">الميزانية المتبقية:</span>
                                <span className={`text-lg font-bold ${(budget - getTotalCost()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(budget - getTotalCost()).toFixed(1)} مليون
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                إجمالي تكلفة الفريق: {getTotalCost().toFixed(1)} مليون
                            </div>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="text-red-800 font-medium mb-2 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    أخطاء في التحقق:
                                </h4>
                                <ul className="text-red-700 text-sm space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Success Message */}
                        {validationErrors.length === 0 && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center text-green-800">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    <span className="font-medium">الفريق جاهز للحفظ!</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isTeamValid() || isSubmitting}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 space-x-reverse ${isTeamValid() && !isSubmitting
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Save className="h-5 w-5" />
                            <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ الفريق'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
