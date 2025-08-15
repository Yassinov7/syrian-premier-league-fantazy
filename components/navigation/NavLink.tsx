'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface NavLinkProps {
    href: string
    children: ReactNode
    className?: string
    activeClassName?: string
}

export function NavLink({ href, children, className = '', activeClassName = '' }: NavLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href
    
    return (
        <Link
            href={href}
            className={`transition-colors duration-200 ${
                isActive 
                    ? `text-primary-600 font-semibold ${activeClassName}` 
                    : `text-gray-700 hover:text-primary-600 ${className}`
            }`}
        >
            {children}
        </Link>
    )
}
