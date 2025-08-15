'use client'

import { AppLayout } from '@/components/layout/AppLayout'

export default function AdminUsersPage() {
	return (
		<AppLayout userRole="admin">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
				<p className="text-gray-500">قريبًا</p>
			</div>
		</AppLayout>
	)
}


