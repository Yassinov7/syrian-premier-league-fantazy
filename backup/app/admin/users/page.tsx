'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import UsersManagement from '@/components/admin/UsersManagement'

export default function AdminUsersPage() {
	const [showUsersManagement, setShowUsersManagement] = useState(true)

	return (
		<AppLayout userRole="admin">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
					<p className="mt-2 text-gray-600">
						إدارة حسابات المستخدمين، تغيير الأدوار، والتحكم في الصلاحيات
					</p>
				</div>

				{showUsersManagement && (
					<UsersManagement onClose={() => setShowUsersManagement(false)} />
				)}

				{!showUsersManagement && (
					<div className="text-center py-12">
						<button
							onClick={() => setShowUsersManagement(true)}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							عرض إدارة المستخدمين
						</button>
					</div>
				)}
			</div>
		</AppLayout>
	)
}

// Prevent static generation to avoid authentication issues during build
export const dynamic = 'force-dynamic';


