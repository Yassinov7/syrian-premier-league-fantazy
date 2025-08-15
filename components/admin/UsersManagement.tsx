'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/supabase'

interface UsersManagementProps {
    onClose: () => void
}

interface UserWithStats extends User {
    teamCount?: number
    totalPoints?: number
}

export default function UsersManagement({ onClose }: UsersManagementProps) {
    const [users, setUsers] = useState<UserWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all')
    const [updatingUser, setUpdatingUser] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            // إضافة إحصائيات المستخدمين
            const usersWithStats = await Promise.all(
                (data || []).map(async (user) => {
                    const teamCount = await getUserTeamCount(user.id)
                    const totalPoints = await getUserTotalPoints(user.id)
                    return { ...user, teamCount, totalPoints }
                })
            )

            setUsers(usersWithStats)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const getUserTeamCount = async (userId: string): Promise<number> => {
        try {
            const { count } = await supabase
                .from('user_teams')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
            return count || 0
        } catch {
            return 0
        }
    }

    const getUserTotalPoints = async (userId: string): Promise<number> => {
        try {
            const { data } = await supabase
                .from('user_teams')
                .select('total_points')
                .eq('user_id', userId)

            if (!data || data.length === 0) return 0

            return data.reduce((sum, team) => sum + (team.total_points || 0), 0)
        } catch {
            return 0
        }
    }

    const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
        try {
            setUpdatingUser(userId)
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            // تحديث القائمة المحلية
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ))
        } catch (error) {
            console.error('Error updating user role:', error)
            alert('حدث خطأ أثناء تحديث دور المستخدم')
        } finally {
            setUpdatingUser(null)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || user.role === filterRole
        return matchesSearch && matchesRole
    })

    const getRoleBadgeColor = (role: string) => {
        return role === 'admin'
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-blue-100 text-blue-800 border-blue-200'
    }

    const getStatsSummary = () => {
        const totalUsers = users.length
        const adminUsers = users.filter(u => u.role === 'admin').length
        const regularUsers = totalUsers - adminUsers
        const totalTeams = users.reduce((sum, user) => sum + (user.teamCount || 0), 0)
        const totalPoints = users.reduce((sum, user) => sum + (user.totalPoints || 0), 0)

        return { totalUsers, adminUsers, regularUsers, totalTeams, totalPoints }
    }

    const stats = getStatsSummary()

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">إدارة المستخدمين</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                    <div className="text-sm text-blue-600">إجمالي المستخدمين</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.regularUsers}</div>
                    <div className="text-sm text-green-600">المستخدمون العاديون</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.adminUsers}</div>
                    <div className="text-sm text-red-600">المدراء</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalTeams}</div>
                    <div className="text-sm text-purple-600">إجمالي الفرق</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
                    <div className="text-sm text-yellow-600">إجمالي النقاط</div>
                </div>
            </div>

            {/* أدوات البحث والفلترة */}
            <div className="mb-6 space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="البحث بالاسم أو البريد الإلكتروني..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as 'all' | 'user' | 'admin')}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">جميع الأدوار</option>
                        <option value="user">مستخدم</option>
                        <option value="admin">مدير</option>
                    </select>
                </div>

                <div className="text-sm text-gray-600">
                    إجمالي المستخدمين: {filteredUsers.length} من {users.length}
                </div>
            </div>

            {/* جدول المستخدمين */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                المستخدم
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الدور
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الفرق
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                النقاط
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                تاريخ التسجيل
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الإجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="mr-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.full_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                        {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.teamCount || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.totalPoints || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('ar-SA')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {user.role === 'admin' ? (
                                        <button
                                            onClick={() => updateUserRole(user.id, 'user')}
                                            disabled={updatingUser === user.id}
                                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                        >
                                            {updatingUser === user.id ? 'جاري...' : 'إلغاء الإدارة'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => updateUserRole(user.id, 'admin')}
                                            disabled={updatingUser === user.id}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        >
                                            {updatingUser === user.id ? 'جاري...' : 'ترقية لمدير'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    لا يوجد مستخدمون يطابقون معايير البحث
                </div>
            )}
        </div>
    )
}
