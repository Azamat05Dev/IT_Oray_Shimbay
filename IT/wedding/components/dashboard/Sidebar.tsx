'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

interface MenuItem {
    icon: string;
    label: string;
    href: string;
}

const menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Asosiy', href: '/dashboard' },
    { icon: '📋', label: 'Mening bronlarim', href: '/dashboard/bookings' },
    { icon: '⚙️', label: 'Sozlamalar', href: '/dashboard/settings' },
];

interface SidebarProps {
    user: {
        fullName: string;
        phone: string;
        avatar?: string;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        // Clear auth and redirect to home
        router.push('/');
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className={styles.mobileToggle}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{isOpen ? '✕' : '☰'}</span>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>💒</span>
                    <span className={styles.logoText}>
                        Toy<span className={styles.logoAccent}>Bron</span>
                    </span>
                </Link>

                {/* User Profile */}
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.fullName} />
                        ) : (
                            <span>{user.fullName.split(' ').map(n => n[0]).join('')}</span>
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <h3>{user.fullName}</h3>
                        <p>{user.phone}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <span>🚪</span>
                    <span>Chiqish</span>
                </button>
            </aside>
        </>
    );
}
