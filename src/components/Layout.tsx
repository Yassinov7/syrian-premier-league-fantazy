import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState, ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

interface NavigationLink {
    name: string;
    path: string;
}

export default function Layout({ children }: LayoutProps) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Set loading to false after component mounts
        setIsLoading(false);
    }, []);

    // Show loading state during SSR/static generation
    if (typeof window === 'undefined' || isLoading) {
        return <div>Loading...</div>;
    }

    const role = user?.user_metadata?.role || 'user';

    const adminLinks: NavigationLink[] = [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Clubs', path: '/admin/clubs' },
        { name: 'Players', path: '/admin/players' },
        { name: 'Matches', path: '/admin/matches' },
        { name: 'Performances', path: '/admin/performances' }
    ];

    const userLinks: NavigationLink[] = [
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
