import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  return (
    <ProtectedRoute roleRequired="admin">
      <Layout>
        <h1>Admin Dashboard</h1>
        {/* Admin specific content */}
      </Layout>
    </ProtectedRoute>
  );
}