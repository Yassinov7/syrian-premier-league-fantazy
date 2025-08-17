'use client'

import { useState } from 'react'
import { Player } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Save, X } from 'lucide-react'

interface SaveTeamModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (teamName: string, captainId: string, viceCaptainId: string) => void
    selectedPlayers: Player[]
    budget: number
    captainId?: string
    viceCaptainId?: string
}

export function SaveTeamModal({
    isOpen,
    onClose,
    onSave,
    selectedPlayers,
    budget,
    captainId,
    viceCaptainId
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

    const isTeamValid = () => {
        const hasValidSize = selectedPlayers.length === 15
        const hasValidBudget = (budget - getTotalCost()) >= 0
        const hasValidPositions =
            getPositionCount('GK') === 2 &&
            getPositionCount('DEF') === 5 &&
            getPositionCount('MID') === 5 &&
            getPositionCount('FWD') === 3
        const hasCaptain = selectedCaptain !== ''
        const hasViceCaptain = selectedViceCaptain !== ''
        const hasValidName = teamName.trim().length > 0

        return hasValidSize && hasValidBudget && hasValidPositions && hasCaptain && hasViceCaptain && hasValidName
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

        if (selectedPlayers.length !== 15) {
            errors.push('يجب أن يكون عدد اللاعبين 15')
        }

        if ((budget - getTotalCost()) < 0) {
            errors.push('تجاوزت الميزانية المخصصة')
        }

        if (getPositionCount('GK') !== 2) {
            errors.push('يجب أن يكون لديك حارسين مرمى')
        }

        if (getPositionCount('DEF') !== 5) {
            errors.push('يجب أن يكون لديك 5 مدافعين')
        }

        if (getPositionCount('MID') !== 5) {
            errors.push('يجب أن يكون لديك 5 لاعبي وسط')
        }

        if (getPositionCount('FWD') !== 3) {
            errors.push('يجب أن يكون لديك 3 مهاجمين')
        }

        if (!selectedCaptain) {
            errors.push('يجب اختيار قائد للفريق')
        }

        if (!selectedViceCaptain) {
            errors.push('يجب اختيار نائب قائد للفريق')
        }

        if (teamName.trim().length === 0) {
            errors.push('يجب إدخال اسم للفريق')
        }

        return errors
    }

    const validationErrors = getValidationErrors()

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="p-6 space-y-6">
                    {/* Team Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            اسم الفريق
                        </label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="أدخل اسم الفريق..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Captain Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            قائد الفريق
                        </label>
                        <select
                            value={selectedCaptain}
                            onChange={(e) => setSelectedCaptain(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">اختر قائد الفريق</option>
                            {selectedPlayers.map((player) => (
                                <option key={player.id} value={player.id}>
                                    {player.name} ({player.position}) - {player.total_points} نقطة
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vice Captain Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            نائب قائد الفريق
                        </label>
                        <select
                            value={selectedViceCaptain}
                            onChange={(e) => setSelectedViceCaptain(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">اختر نائب قائد الفريق</option>
                            {selectedPlayers
                                .filter(player => player.id !== selectedCaptain)
                                .map((player) => (
                                    <option key={player.id} value={player.id}>
                                        {player.name} ({player.position}) - {player.total_points} نقطة
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Team Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">ملخص الفريق</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-sm text-gray-600">اللاعبين</div>
                                <div className="text-lg font-bold text-blue-600">{selectedPlayers.length}/15</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">الميزانية</div>
                                <div className="text-lg font-bold text-green-600">{getTotalCost()}/{budget}M</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">حارس مرمى</div>
                                <div className="text-lg font-bold text-yellow-600">{getPositionCount('GK')}/2</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">مدافعون</div>
                                <div className="text-lg font-bold text-blue-600">{getPositionCount('DEF')}/5</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">لاعبو وسط</div>
                                <div className="text-lg font-bold text-green-600">{getPositionCount('MID')}/5</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">مهاجمون</div>
                                <div className="text-lg font-bold text-red-600">{getPositionCount('FWD')}/3</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">القائد</div>
                                <div className="text-lg font-bold text-yellow-600">
                                    {selectedCaptain ? '✓' : '✗'}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">نائب القائد</div>
                                <div className="text-lg font-bold text-gray-600">
                                    {selectedViceCaptain ? '✓' : '✗'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <AlertCircle className="h-5 w-5 text-red-400 ml-2" />
                                <h4 className="text-red-800 font-medium">يجب إصلاح الأخطاء التالية:</h4>
                            </div>
                            <ul className="text-red-700 text-sm space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-red-400 rounded-full ml-2"></span>
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Success Message */}
                    {isTeamValid() && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-400 ml-2" />
                                <span className="text-green-800 font-medium">
                                    الفريق جاهز للحفظ! 🎉
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isTeamValid() || isSubmitting}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 space-x-reverse ${isTeamValid() && !isSubmitting
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
    )
}
