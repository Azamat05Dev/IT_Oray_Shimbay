'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>💒</span>
                    <span className={styles.logoText}>
                        Toy<span className={styles.logoAccent}>Bron</span>
                        <span className={styles.logoLocation}>Chimbay</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.nav}>
                    <Link href="/venues" className={styles.navLink}>
                        To'yxonalar
                    </Link>
                    <Link href="/about" className={styles.navLink}>
                        Biz haqimizda
                    </Link>
                    <Link href="/contact" className={styles.navLink}>
                        Aloqa
                    </Link>
                </nav>

                {/* CTA Button */}
                <Link href="/booking" className={`btn btn-primary ${styles.ctaBtn}`}>
                    Online ariza
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className={styles.menuButton}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menu"
                >
                    {isMenuOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <nav className={styles.mobileNav}>
                            <Link href="/venues" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                                🏛️ To'yxonalar
                            </Link>
                            <Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                                ℹ️ Biz haqimizda
                            </Link>
                            <Link href="/contact" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                                📩 Aloqa
                            </Link>
                        </nav>

                        <Link
                            href="/booking"
                            className="btn btn-primary btn-full"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Online ariza
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
