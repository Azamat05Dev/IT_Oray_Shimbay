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
const allBookings = [
    {
        id: '1',
        venueId: 1,
        venueName: 'Oq Saroy',
        venueImage: '🏛️',
        date: '2025-01-15',
        timeSlot: 'evening' as const,
        guestCount: 250,
        totalPrice: 180000,
        paidAmount: 54000,
        status: 'confirmed' as const,
        createdAt: '2024-12-10',
    },
    {
        id: '2',
        venueId: 4,
        venueName: 'Baxt Saroyi',
        venueImage: '💒',
        date: '2025-02-20',
        timeSlot: 'afternoon' as const,
        guestCount: 300,
        totalPrice: 200000,
        paidAmount: 200000,
        status: 'paid' as const,
        createdAt: '2024-12-15',
    },
    {
        id: '3',
        venueId: 2,
        venueName: 'Gulistan',
        venueImage: '🌸',
        date: '2024-12-10',
        timeSlot: 'evening' as const,
        guestCount: 200,
        totalPrice: 150000,
        paidAmount: 45000,
        status: 'cancelled' as const,
        createdAt: '2024-11-20',
    },
    {
        id: '4',
        venueId: 9,
        venueName: 'Premium Hall',
        venueImage: '💎',
        date: '2024-11-25',
        timeSlot: 'evening' as const,
        guestCount: 350,
        totalPrice: 220000,
        paidAmount: 220000,
        status: 'completed' as const,
        createdAt: '2024-10-01',
    },
    {
        id: '5',
        venueId: 10,
        venueName: 'Chimbay Palace',
        venueImage: '👑',
        date: '2025-03-10',
        timeSlot: 'morning' as const,
        guestCount: 400,
        totalPrice: 250000,
        paidAmount: 0,
        status: 'pending' as const,
        createdAt: '2024-12-18',
    },
];

type FilterType = 'all' | 'active' | 'completed' | 'cancelled';

export default function BookingsPage() {
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBookings = allBookings.filter(booking => {
        // Filter by status
        if (filter === 'active' && !['pending', 'confirmed', 'paid'].includes(booking.status)) return false;
        if (filter === 'completed' && booking.status !== 'completed') return false;
        if (filter === 'cancelled' && booking.status !== 'cancelled') return false;

        // Filter by search query
        if (searchQuery && !booking.venueName.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        return true;
    });

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return '⏳ Kutilmoqda';
            case 'confirmed': return '✓ Tasdiqlangan';
            case 'paid': return '💳 To\'langan';
            case 'completed': return '✅ Yakunlangan';
            case 'cancelled': return '❌ Bekor qilingan';
            default: return status;
        }
    };

    const getTimeSlotText = (slot: string) => {
        switch (slot) {
            case 'morning': return '🌅 Ertalab';
            case 'afternoon': return '☀️ Tushlik';
            case 'evening': return '🌙 Kechqurun';
            default: return slot;
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar user={user} />

            <main className={styles.mainContent}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>Mening bronlarim</h1>
                        <p>Barcha bronlaringizni boshqaring</p>
                    </div>
                    <Link href="/venues" className={styles.newBookingBtn}>
                        <span>+</span>
                        <span>Yangi bron</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.filterTabs}>
                        <button
                            className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Hammasi ({allBookings.length})
                        </button>
                        <button
                            className={`${styles.filterTab} ${filter === 'active' ? styles.active : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Faol ({allBookings.filter(b => ['pending', 'confirmed', 'paid'].includes(b.status)).length})
                        </button>
                        <button
                            className={`${styles.filterTab} ${filter === 'completed' ? styles.active : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Yakunlangan ({allBookings.filter(b => b.status === 'completed').length})
                        </button>
                        <button
                            className={`${styles.filterTab} ${filter === 'cancelled' ? styles.active : ''}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Bekor qilingan ({allBookings.filter(b => b.status === 'cancelled').length})
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="To'yxona nomi bo'yicha qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Bookings List */}
                <div className={styles.bookingsList}>
                    {filteredBookings.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>📋</span>
                            <h3>Bronlar topilmadi</h3>
                            <p>Hech qanday bron mavjud emas</p>
                            <Link href="/venues" className={styles.emptyBtn}>
                                Yangi bron qilish
                            </Link>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div key={booking.id} className={styles.bookingCard}>
                                <div className={styles.bookingHeader}>
                                    <div className={styles.bookingVenue}>
                                        <span className={styles.bookingIcon}>{booking.venueImage}</span>
                                        <div>
                                            <h3>{booking.venueName}</h3>
                                            <span className={styles.bookingId}>ID: #{booking.id}</span>
                                        </div>
                                    </div>
                                    <span className={`${styles.status} ${styles[booking.status]}`}>
                                        {getStatusText(booking.status)}
                                    </span>
                                </div>

                                <div className={styles.bookingBody}>
                                    <div className={styles.bookingDetail}>
                                        <span className={styles.detailLabel}>📅 Sana</span>
                                        <span className={styles.detailValue}>
                                            {new Date(booking.date).toLocaleDateString('uz-UZ', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className={styles.bookingDetail}>
                                        <span className={styles.detailLabel}>⏰ Vaqt</span>
                                        <span className={styles.detailValue}>{getTimeSlotText(booking.timeSlot)}</span>
                                    </div>

                                    <div className={styles.bookingDetail}>
                                        <span className={styles.detailLabel}>👥 Mehmonlar</span>
                                        <span className={styles.detailValue}>{booking.guestCount} kishi</span>
                                    </div>

                                    <div className={styles.bookingDetail}>
                                        <span className={styles.detailLabel}>💰 Narx</span>
                                        <span className={styles.detailValue}>{booking.totalPrice.toLocaleString()} so'm</span>
                                    </div>

                                    {booking.paidAmount > 0 && (
                                        <div className={styles.bookingDetail}>
                                            <span className={styles.detailLabel}>💳 To'langan</span>
                                            <span className={styles.detailValue}>{booking.paidAmount.toLocaleString()} so'm</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.bookingActions}>
                                    <Link href={`/dashboard/bookings/${booking.id}`} className={styles.actionBtn}>
                                        Batafsil
                                    </Link>
                                    {booking.status === 'pending' && (
                                        <button className={`${styles.actionBtn} ${styles.pay}`}>
                                            To'lov qilish
                                        </button>
                                    )}
                                    {['pending', 'confirmed'].includes(booking.status) && (
                                        <button className={`${styles.actionBtn} ${styles.cancel}`}>
                                            Bekor qilish
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
