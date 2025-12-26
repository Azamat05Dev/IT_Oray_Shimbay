import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerContainer}`}>
                {/* Top Section */}
                <div className={styles.footerGrid}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoIcon}>💒</span>
                            <span className={styles.logoText}>
                                Toy<span className={styles.logoAccent}>Bron</span>
                            </span>
                        </Link>
                        <p className={styles.brandDesc}>
                            Chimbay tumanidagi eng yaxshi to'yxonalarni toping va online bron qiling.
                            Oson, tez va ishonchli.
                        </p>
                        <div className={styles.social}>
                            <a href="https://t.me/toybron_chimbay" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Telegram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                            </a>
                            <a href="https://instagram.com/toybron_chimbay" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className={styles.linksSection}>
                        <h4 className={styles.linksTitle}>Sahifalar</h4>
                        <ul className={styles.linksList}>
                            <li><Link href="/venues">To'yxonalar</Link></li>
                            <li><Link href="/calendar">Kalendar</Link></li>
                            <li><Link href="/about">Biz haqimizda</Link></li>
                            <li><Link href="/contact">Aloqa</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.linksTitle}>To'yxona egalari</h4>
                        <ul className={styles.linksList}>
                            <li><Link href="/venue-register">To'yxonani ro'yxatdan o'tkazing</Link></li>
                            <li><Link href="/venue-admin">To'yxona paneli</Link></li>
                            <li><Link href="/faq">Ko'p so'raladigan savollar</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.linksTitle}>Aloqa</h4>
                        <ul className={styles.contactList}>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <a href="tel:+998911234567">+998 91 123 45 67</a>
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <a href="mailto:info@toybron.uz">info@toybron.uz</a>
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>Chimbay tumani, Qoraqalpog'iston</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>
                        © {currentYear} ToyBron Chimbay. Barcha huquqlar himoyalangan.
                    </p>
                    <div className={styles.legalLinks}>
                        <Link href="/privacy">Maxfiylik siyosati</Link>
                        <Link href="/terms">Foydalanish shartlari</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
