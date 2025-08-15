'use client'

import { ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    icon: ReactNode
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
}

const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
}

export function StatCard({ title, value, icon, color, change, changeType }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-opacity-20">
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                </div>
                {change && (
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${changeType === 'positive' ? 'bg-green-100 text-green-800' :
                            changeType === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {change}
                    </span>
                )}
            </div>

            <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    )
}
