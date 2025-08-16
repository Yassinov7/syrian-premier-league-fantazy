'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, UserTeam, Player, Club } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Trophy, Users, TrendingUp, Plus, Edit, Trash2, Crown, Calendar } from 'lucide-react'
import { StatCard } from '@/components/stats/StatCard'

interface TeamPlayer extends Player {
	club: Club
	is_captain: boolean
	is_vice_captain: boolean
}

interface Season {
	id: string
	name: string
	start_date: string
	end_date: string
	is_active: boolean
}

export default function TeamsPage() {
	const { user, loading: authLoading } = useAuth()
	const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
	const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([])
	const [seasons, setSeasons] = useState<Season[]>([])
	const [loading, setLoading] = useState(true)
	const [showCreateTeam, setShowCreateTeam] = useState(false)
	const [teamName, setTeamName] = useState('')

	useEffect(() => {
		if (user) {
			fetchData()
		}
	}, [user])

	const fetchData = async () => {
		if (!user) return

		try {
			const [teamRes, seasonsRes] = await Promise.all([
				supabase
					.from('user_teams')
					.select('*')
					.eq('user_id', user.id)
					.single(),
				supabase.from('seasons').select('*').order('start_date', { ascending: false })
			])

			if (teamRes.data) {
				setUserTeam(teamRes.data)
				setTeamName(teamRes.data.name)

				// Fetch team players with club info
				const { data: players } = await supabase
					.from('user_team_players')
					.select(`
                        *,
                        players (
                            *,
                            clubs (*)
                        )
                    `)
					.eq('user_team_id', teamRes.data.id)

				if (players) {
					const formattedPlayers = players.map(p => ({
						...p.players,
						club: p.players.clubs,
						is_captain: p.is_captain,
						is_vice_captain: p.is_vice_captain
					}))
					setTeamPlayers(formattedPlayers)
				}
			}

			if (seasonsRes.data) {
				setSeasons(seasonsRes.data)
			}
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const createTeam = async () => {
		if (!user || !teamName.trim()) return

		try {
			const { data: team } = await supabase
				.from('user_teams')
				.insert([
					{
						user_id: user.id,
						name: teamName.trim(),
						total_points: 0
					}
				])
				.select()
				.single()

			if (team) {
				setUserTeam(team)
				setShowCreateTeam(false)
				fetchData()
			}
		} catch (error) {
			console.error('Error creating team:', error)
		}
	}

	const updateTeamName = async () => {
		if (!userTeam || !teamName.trim()) return

		try {
			const { data: team } = await supabase
				.from('user_teams')
				.update({ name: teamName.trim() })
				.eq('id', userTeam.id)
				.select()
				.single()

			if (team) {
				setUserTeam(team)
			}
		} catch (error) {
			console.error('Error updating team name:', error)
		}
	}

	const removePlayer = async (playerId: string) => {
		if (!userTeam) return

		try {
			await supabase
				.from('user_team_players')
				.delete()
				.eq('user_team_id', userTeam.id)
				.eq('player_id', playerId)

			fetchData()
		} catch (error) {
			console.error('Error removing player:', error)
		}
	}

	const setCaptain = async (playerId: string, isCaptain: boolean) => {
		if (!userTeam) return

		try {
			// Remove captain from all players
			await supabase
				.from('user_team_players')
				.update({ is_captain: false, is_vice_captain: false })
				.eq('user_team_id', userTeam.id)

			// Set new captain
			await supabase
				.from('user_team_players')
				.update({
					is_captain: isCaptain,
					is_vice_captain: !isCaptain
				})
				.eq('user_team_id', userTeam.id)
				.eq('player_id', playerId)

			fetchData()
		} catch (error) {
			console.error('Error setting captain:', error)
		}
	}

	const getActiveSeason = () => {
		return seasons.find(s => s.is_active) || seasons[0]
	}

	if (authLoading || loading) {
		return (
			<AppLayout userRole="user">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
				</div>
			</AppLayout>
		)
	}

	if (!user) {
		window.location.href = '/'
		return null
	}

	const activeSeason = getActiveSeason()

	return (
		<AppLayout userRole="user">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">فريقي</h1>
					<p className="mt-2 text-gray-600">
						إدارة فريقك الفانتازي وتتبع أدائه
					</p>
					{activeSeason && (
						<div className="mt-4 p-4 bg-blue-50 rounded-lg">
							<p className="text-sm text-blue-800">
								<strong>الموسم الحالي:</strong> {activeSeason.name}
							</p>
						</div>
					)}
				</div>

				{!userTeam ? (
					/* Create Team Section */
					<div className="bg-white rounded-lg shadow-lg p-8 text-center">
						<Trophy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							لم تقم بإنشاء فريق بعد
						</h2>
						<p className="text-gray-600 mb-6">
							ابدأ بإنشاء فريقك الفانتازي واختر أفضل اللاعبين
						</p>

						{showCreateTeam ? (
							<div className="max-w-md mx-auto">
								<input
									type="text"
									placeholder="اسم الفريق"
									value={teamName}
									onChange={(e) => setTeamName(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<div className="flex gap-3 justify-center">
									<button
										onClick={createTeam}
										className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
									>
										إنشاء الفريق
									</button>
									<button
										onClick={() => setShowCreateTeam(false)}
										className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
									>
										إلغاء
									</button>
								</div>
							</div>
						) : (
							<button
								onClick={() => setShowCreateTeam(true)}
								className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
							>
								<Plus className="h-5 w-5 ml-2" />
								إنشاء فريق جديد
							</button>
						)}
					</div>
				) : (
					/* Team Management Section */
					<div className="space-y-6">
						{/* Team Info */}
						<div className="bg-white rounded-lg shadow-lg p-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">{userTeam.name}</h2>
									<p className="text-gray-600">فريق {user?.user_metadata?.full_name || user?.email}</p>
								</div>
								<div className="flex items-center gap-3">
									<input
										type="text"
										value={teamName}
										onChange={(e) => setTeamName(e.target.value)}
										className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<button
										onClick={updateTeamName}
										className="text-blue-600 hover:text-blue-800"
									>
										<Edit className="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							<StatCard
								title="إجمالي النقاط"
								value={userTeam.total_points}
								icon={<Trophy className="h-6 w-6" />}
								color="yellow"
							/>
							<StatCard
								title="عدد اللاعبين"
								value={teamPlayers.length}
								icon={<Users className="h-6 w-6" />}
								color="blue"
							/>
							<StatCard
								title="متوسط النقاط"
								value={teamPlayers.length > 0 ? Math.round(userTeam.total_points / teamPlayers.length) : 0}
								icon={<TrendingUp className="h-6 w-6" />}
								color="green"
							/>
							<StatCard
								title="الميزانية المستخدمة"
								value={teamPlayers.reduce((sum, p) => sum + p.price, 0)}
								icon={<Crown className="h-6 w-6" />}
								color="purple"
							/>
						</div>

						{/* Team Players */}
						<div className="bg-white rounded-lg shadow-lg overflow-hidden">
							<div className="px-6 py-4 border-b border-gray-200">
								<h3 className="text-lg font-medium text-gray-900">لاعبي الفريق</h3>
							</div>

							{teamPlayers.length === 0 ? (
								<div className="text-center py-12">
									<Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										لا يوجد لاعبون في الفريق
									</h3>
									<p className="text-gray-500">
										اذهب إلى صفحة اختيار الفريق لإضافة لاعبين
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													اللاعب
												</th>
												<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													النادي
												</th>
												<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													النقاط
												</th>
												<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													السعر
												</th>
												<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													الإجراءات
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{teamPlayers.map((player) => (
												<tr key={player.id} className="hover:bg-gray-50">
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="flex items-center">
															<div className="flex-shrink-0 h-10 w-10">
																<div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
																	{player.name.charAt(0).toUpperCase()}
																</div>
															</div>
															<div className="mr-4">
																<div className="text-sm font-medium text-gray-900">
																	{player.name}
																	{player.is_captain && (
																		<Crown className="inline h-4 w-4 text-yellow-500 mr-2" />
																	)}
																	{player.is_vice_captain && (
																		<Crown className="inline h-4 w-4 text-gray-500 mr-2" />
																	)}
																</div>
																<div className="text-sm text-gray-500">
																	{player.position === 'GK' ? 'حارس مرمى' :
																		player.position === 'DEF' ? 'مدافع' :
																			player.position === 'MID' ? 'لاعب وسط' : 'مهاجم'}
																</div>
															</div>
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{player.club?.name || 'غير محدد'}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{player.total_points}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{player.price}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
														<div className="flex items-center gap-2">
															{!player.is_captain && (
																<button
																	onClick={() => setCaptain(player.id, true)}
																	className="text-yellow-600 hover:text-yellow-900"
																	title="تعيين كقائد"
																>
																	<Crown className="h-4 w-4" />
																</button>
															)}
															{!player.is_vice_captain && !player.is_captain && (
																<button
																	onClick={() => setCaptain(player.id, false)}
																	className="text-gray-600 hover:text-gray-900"
																	title="تعيين كنائب قائد"
																>
																	<Crown className="h-4 w-4" />
																</button>
															)}
															<button
																onClick={() => removePlayer(player.id)}
																className="text-red-600 hover:text-red-900"
																title="إزالة من الفريق"
															>
																<Trash2 className="h-4 w-4" />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</AppLayout>
	)
}