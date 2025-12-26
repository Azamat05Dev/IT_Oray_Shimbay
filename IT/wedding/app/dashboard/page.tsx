'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import styles from './page.module.css';

// Demo user data
const user = {
    fullName: 'Azamat Nurullayev',
    phone: '+998 90 123 45 67',
    email: 'azamat@example.com',
};

// Demo bookings data
const bookings = [
    {
        id: '1',
        venueName: 'Oq Saroy',
        venueImage: '🏛️',
        date: '2025-01-15',
        timeSlot: 'evening' as const,
        guestCount: 250,
        totalPrice: 180000,
        status: 'confirmed' as const,
    },
    {
        id: '2',
        venueName: 'Baxt Saroyi',
        venueImage: '💒',
        date: '2025-02-20',
        timeSlot: 'afternoon' as const,
        guestCount: 300,
        totalPrice: 200000,
        status: 'paid' as const,
    },
    {
        id: '3',
        venueName: 'Gulistan',
        venueImage: '🌸',
        date: '2024-12-10',
        timeSlot: 'evening' as const,
        guestCount: 200,
        totalPrice: 150000,
        status: 'cancelled' as const,
    },
];

const stats = [
    { icon: '📋', label: 'Jami bronlar', value: '3', color: '#667eea' },
    { icon: '✅', label: 'Faol bronlar', value: '2', color: '#43e97b' },
    { icon: '💰', label: "To'langan", value: '380,000 so\'m', color: '#f59e0b' },
    { icon: '📅', label: 'Keyingi bron', value: '15 yan', color: '#ef4444' },
];

const quickActions = [
    { icon: '🎊', label: 'Yangi bron qilish', href: '/venues', color: '#667eea' },
    { icon: '📅', label: 'Kalendar', href: '/calendar', color: '#f093fb' },
    { icon: '📞', label: "Qo'llab-quvvatlash", href: '/contact', color: '#43e97b' },
];

export default function DashboardPage() {
    const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
    const nextBooking = activeBookings[0];

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar user={user} />

            <main className={styles.mainContent}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>Xush kelibsiz, {user.fullName.split(' ')[0]}! 👋</h1>
                        <p>Sizning shaxsiy kabinetingiz</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={styles.statCard}
                            style={{ '--accent': stat.color } as React.CSSProperties}
                        >
                            <span className={styles.statIcon}>{stat.icon}</span>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className={styles.section}>
                    <h2>Tez harakatlar</h2>
                    <div className={styles.quickActions}>
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className={styles.actionCard}
                                style={{ '--accent': action.color } as React.CSSProperties}
                            >
                                <span className={styles.actionIcon}>{action.icon}</span>
                                <span className={styles.actionLabel}>{action.label}</span>
                                <span className={styles.actionArrow}>→</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>So'nggi bronlar</h2>
                        <Link href="/dashboard/bookings" className={styles.viewAll}>
                            Barchasini ko'rish →
                        </Link>
                    </div>

                    <div className={styles.bookingsList}>
                        {activeBookings.slice(0, 2).map((booking) => (
                            <div key={booking.id} className={styles.bookingCard}>
                                <div className={styles.bookingIcon}>{booking.venueImage}</div>
                                <div className={styles.bookingInfo}>
                                    <h3>{booking.venueName}</h3>
                                    <div className={styles.bookingDetails}>
                                        <span>📅 {new Date(booking.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}</span>
                                        <span>⏰ {booking.timeSlot === 'morning' ? 'Ertalab' : booking.timeSlot === 'afternoon' ? 'Tushlik' : 'Kechqurun'}</span>
                                        <span>👥 {booking.guestCount} kishi</span>
                                    </div>
                                </div>
                                <div className={styles.bookingPrice}>
                                    <span className={styles.price}>{booking.totalPrice.toLocaleString()} so'm</span>
                                    <span className={`${styles.status} ${styles[booking.status]}`}>
                                        {booking.status === 'confirmed' ? '✓ Tasdiqlangan' :
                                            booking.status === 'paid' ? '💳 To\'langan' :
                                                booking.status === 'pending' ? '⏳ Kutilmoqda' : 'Bekor qilingan'}
                                    </span>
                                </div>
                                <Link href={`/dashboard/bookings/${booking.id}`} className={styles.bookingArrow}>
                                    →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Booking Reminder */}
                {nextBooking && (
                    <div className={styles.reminder}>
                        <span className={styles.reminderIcon}>🔔</span>
                        <div className={styles.reminderContent}>
                            <h3>Keyingi bron</h3>
                            <p>
                                <strong>{nextBooking.venueName}</strong> - {new Date(nextBooking.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <Link href={`/dashboard/bookings/${nextBooking.id}`} className={styles.reminderBtn}>
                            Batafsil
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
