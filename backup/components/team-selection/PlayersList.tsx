'use client'

import { useState, useMemo } from 'react'
import { Player, Club } from '@/lib/supabase'
import { PlayerCard } from '@/components/players/PlayerCard'
import { Search, Filter, Users, TrendingUp, TrendingDown } from 'lucide-react'

interface PlayersListProps {
    players: Player[]
    clubs: Club[]
    selectedPlayers: Player[]
    onPlayerSelect: (player: Player) => void
    onPlayerDrop: (player: Player) => void
}

export function PlayersList({
    players,
    clubs,
    selectedPlayers,
    onPlayerSelect,
    onPlayerDrop
}: PlayersListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPosition, setSelectedPosition] = useState<string>('all')
    const [selectedClub, setSelectedClub] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'points' | 'position'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const filteredAndSortedPlayers = useMemo(() => {
        let filtered = players.filter(player => {
            const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition
            const matchesClub = selectedClub === 'all' || player.club_id === selectedClub
            const isNotSelected = !selectedPlayers.find(p => p.id === player.id)

            return matchesSearch && matchesPosition && matchesClub && isNotSelected
        })

        // Sort players
        filtered.sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sortBy) {
                case 'name':
                    aValue = a.name
                    bValue = b.name
                    break
                case 'price':
                    aValue = a.price
                    bValue = b.price
                    break
                case 'points':
                    aValue = a.total_points
                    bValue = b.total_points
                    break
                case 'position':
                    aValue = a.position
                    bValue = b.position
                    break
                default:
                    aValue = a.name
                    bValue = b.name
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        return filtered
    }, [players, searchTerm, selectedPosition, selectedClub, selectedPlayers, sortBy, sortOrder])

    const handleDragStart = (e: React.DragEvent, player: Player) => {
        e.dataTransfer.setData('player', JSON.stringify(player))
        e.dataTransfer.effectAllowed = 'copy'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const playerData = e.dataTransfer.getData('player')
        if (playerData) {
            const player = JSON.parse(playerData)
            onPlayerDrop(player)
        }
    }

    const getPositionCount = (position: string) => {
        return filteredAndSortedPlayers.filter(p => p.position === position).length
    }

    const getClubCount = (clubId: string) => {
        return filteredAndSortedPlayers.filter(p => p.club_id === clubId).length
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">قائمة اللاعبين</h2>
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">{filteredAndSortedPlayers.length} لاعب متاح</span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث عن لاعب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Position Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">المركز</label>
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">جميع المراكز</option>
                            <option value="GK">حارس مرمى ({getPositionCount('GK')})</option>
                            <option value="DEF">مدافع ({getPositionCount('DEF')})</option>
                            <option value="MID">لاعب وسط ({getPositionCount('MID')})</option>
                            <option value="FWD">مهاجم ({getPositionCount('FWD')})</option>
                        </select>
                    </div>

                    {/* Club Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">النادي</label>
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">جميع الأندية</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name} ({getClubCount(club.id)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">الاسم</option>
                            <option value="price">السعر</option>
                            <option value="points">النقاط</option>
                            <option value="position">المركز</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="asc">تصاعدي</option>
                            <option value="desc">تنازلي</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Players Grid */}
            <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {filteredAndSortedPlayers.length > 0 ? (
                    filteredAndSortedPlayers.map((player) => {
                        const isSelected = !!selectedPlayers.find(p => p.id === player.id)
                        return (
                            <div
                                key={player.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, player)}
                                className="cursor-grab active:cursor-grabbing"
                            >
                                <PlayerCard
                                    player={player}
                                    showStats={true}
                                    onSelect={onPlayerSelect}
                                    isSelected={isSelected}
                                />
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            لا يوجد لاعبون
                        </h3>
                        <p className="text-gray-500">
                            لا يوجد لاعبون يطابقون معايير البحث
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">إحصائيات سريعة</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-600">متوسط السعر</div>
                        <div className="text-lg font-bold text-gray-900">
                            {filteredAndSortedPlayers.length > 0 
                                ? Math.round(filteredAndSortedPlayers.reduce((sum, p) => sum + p.price, 0) / filteredAndSortedPlayers.length * 10) / 10
                                : 0
                            }M
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">أعلى سعر</div>
                        <div className="text-lg font-bold text-gray-900">
                            {filteredAndSortedPlayers.length > 0 
                                ? Math.max(...filteredAndSortedPlayers.map(p => p.price))
                                : 0
                            }M
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">أدنى سعر</div>
                        <div className="text-lg font-bold text-gray-900">
                            {filteredAndSortedPlayers.length > 0 
                                ? Math.min(...filteredAndSortedPlayers.map(p => p.price))
                                : 0
                            }M
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600">إجمالي النقاط</div>
                        <div className="text-lg font-bold text-gray-900">
                            {filteredAndSortedPlayers.reduce((sum, p) => sum + p.total_points, 0)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
