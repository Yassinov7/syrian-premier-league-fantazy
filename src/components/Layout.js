import { useUser } from '@supabase/auth-helpers-react';

export default function Layout({ children }) {
  const { user } = useUser();
  const role = user?.user_metadata?.role || 'user';

  const adminLinks = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Clubs', path: '/admin/clubs' },
    { name: 'Players', path: '/admin/players' },
    { name: 'Matches', path: '/admin/matches' },
    { name: 'Performances', path: '/admin/performances' }
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Team', path: '/my-team' },
    { name: 'Market', path: '/market' },
    { name: 'Standings', path: '/standings' }
  ];

  return (
    <div className="layout">
      <nav>
        {role === 'admin' ? (
          adminLinks.map(link => (
            <a key={link.path} href={link.path}>{link.name}</a>
          ))
        ) : (
          userLinks.map(link => (
            <a key={link.path} href={link.path}>{link.name}</a>
          ))
        )}
      </nav>
      <main>{children}</main>
    </div>
  );
}