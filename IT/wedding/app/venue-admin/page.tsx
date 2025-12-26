'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { venues, bookedDates, timeSlots, formatPrice } from '@/lib/data';
import styles from './page.module.css';

// Demo venue owner data
const venueOwner = {
    id: 1,
    name: "Abdullayev Karim",
    phone: "+998 91 111 22 33",
    venueId: 1, // Oq Saroy
};

// Demo bookings for this venue
const venueBookings = [
    {
        id: "TB-V1-001",
        customerName: "Rustamov Jasur",
        customerPhone: "+998 90 123 45 67",
        date: "2025-01-15",
        time: "evening",
        guests: 150,
        hall: "Katta zal",
        total: 29750000,
        paid: 8925000,
        status: "confirmed",
        createdAt: "2024-12-20",
    },
    {
        id: "TB-V1-002",
        customerName: "Karimova Dilnoza",
        customerPhone: "+998 91 234 56 78",
        date: "2025-01-18",
        time: "evening",
        guests: 200,
        hall: "Katta zal",
        total: 38500000,
        paid: 11550000,
        status: "confirmed",
        createdAt: "2024-12-19",
    },
    {
        id: "TB-V1-003",
        customerName: "Aliyev Bekzod",
        customerPhone: "+998 93 345 67 89",
        date: "2025-01-25",
        time: "afternoon",
        guests: 100,
        hall: "VIP zal",
        total: 18000000,
        paid: 0,
        status: "pending",
        createdAt: "2024-12-18",
    },
];

// Month names
const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const dayNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

// Status labels
const statusLabels: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Tasdiqlangan", color: "success" },
    pending: { label: "Kutilmoqda", color: "warning" },
    completed: { label: "Bajarilgan", color: "info" },
    cancelled: { label: "Bekor qilingan", color: "error" },
};

export default function VenueAdminPage() {
    const venue = venues.find(v => v.id === venueOwner.venueId)!;
    const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'bookings' | 'settings'>('overview');
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1)); // January 2025

    // Calculate stats
    const stats = useMemo(() => {
        const totalBookings = venueBookings.length;
        const confirmedBookings = venueBookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = venueBookings.filter(b => b.status === 'pending').length;
        const totalRevenue = venueBookings.reduce((sum, b) => sum + b.total, 0);
        const paidRevenue = venueBookings.reduce((sum, b) => sum + b.paid, 0);
        const pendingRevenue = totalRevenue - paidRevenue;

        return { totalBookings, confirmedBookings, pendingBookings, totalRevenue, paidRevenue, pendingRevenue };
    }, []);

    // Calendar data
    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const days: { date: Date; isCurrentMonth: boolean; bookings: typeof venueBookings }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = startDay - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false, bookings: [] });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toISOString().split('T')[0];
            const dayBookings = venueBookings.filter(b => b.date === dateStr);
            days.push({ date, isCurrentMonth: true, bookings: dayBookings });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, bookings: [] });
        }

        return days;
    }, [currentMonth]);

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
        <div className={styles.adminPage}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>💒</span>
                        <span className={styles.logoText}>ToyBron</span>
                    </Link>
                    <span className={styles.adminBadge}>Admin</span>
                </div>

                <nav className={styles.sidebarNav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span>📊</span>
                        <span>Bosh sahifa</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'calendar' ? styles.active : ''}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        <span>📅</span>
                        <span>Kalendar</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <span>📋</span>
                        <span>Bronlar</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <span>⚙️</span>
                        <span>Sozlamalar</span>
                    </button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.venueInfo}>
                        <span className={styles.venueIcon}>{venue.image}</span>
                        <div>
                            <span className={styles.venueName}>{venue.name}</span>
                            <span className={styles.venueRating}>⭐ {venue.rating}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.pageTitle}>
                            {activeTab === 'overview' && 'Bosh sahifa'}
                            {activeTab === 'calendar' && 'Kalendar'}
                            {activeTab === 'bookings' && 'Bronlar'}
                            {activeTab === 'settings' && 'Sozlamalar'}
                        </h1>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{venueOwner.name}</span>
                            <div className={styles.userAvatar}>👤</div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className={styles.content}>
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>📅</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalBookings}</span>
                                        <span className={styles.statLabel}>Jami bronlar</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>✅</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.confirmedBookings}</span>
                                        <span className={styles.statLabel}>Tasdiqlangan</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>⏳</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.pendingBookings}</span>
                                        <span className={styles.statLabel}>Kutilmoqda</span>
                                    </div>
                                </div>
                                <div className={`${styles.statCard} ${styles.revenue}`}>
                                    <div className={styles.statIcon}>💰</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{formatPrice(stats.paidRevenue)}</span>
                                        <span className={styles.statLabel}>To'langan</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Bookings */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Oxirgi bronlar</h2>
                                    <button onClick={() => setActiveTab('bookings')} className={styles.viewAllBtn}>
                                        Barchasini ko'rish →
                                    </button>
                                </div>
                                <div className={styles.bookingsTable}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Mijoz</th>
                                                <th>Sana</th>
                                                <th>Mehmonlar</th>
                                                <th>Summa</th>
                                                <th>Holat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {venueBookings.slice(0, 5).map(booking => {
                                                const status = statusLabels[booking.status];
                                                return (
                                                    <tr key={booking.id}>
                                                        <td className={styles.bookingId}>{booking.id}</td>
                                                        <td>
                                                            <div className={styles.customerInfo}>
                                                                <span>{booking.customerName}</span>
                                                                <span className={styles.customerPhone}>{booking.customerPhone}</span>
                                                            </div>
                                                        </td>
                                                        <td>{new Date(booking.date + 'T12:00:00').toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</td>
                                                        <td>{booking.guests}</td>
                                                        <td className={styles.amount}>{formatPrice(booking.total)}</td>
                                                        <td>
                                                            <span className={`${styles.statusBadge} ${styles[status.color]}`}>
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'calendar' && (
                        <div className={styles.calendarSection}>
                            <div className={styles.calendarCard}>
                                <div className={styles.calendarHeader}>
                                    <button onClick={goToPrevMonth} className={styles.calendarNav}>←</button>
                                    <span className={styles.currentMonth}>
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </span>
                                    <button onClick={goToNextMonth} className={styles.calendarNav}>→</button>
                                </div>

                                <div className={styles.dayNames}>
                                    {dayNames.map(day => (
                                        <span key={day} className={styles.dayName}>{day}</span>
                                    ))}
                                </div>

                                <div className={styles.calendarGrid}>
                                    {calendarData.map((day, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.calendarDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${day.bookings.length > 0 ? styles.hasBookings : ''}`}
                                        >
                                            <span className={styles.dayNumber}>{day.date.getDate()}</span>
                                            {day.bookings.length > 0 && (
                                                <div className={styles.dayBookings}>
                                                    {day.bookings.map(b => (
                                                        <div key={b.id} className={`${styles.bookingDot} ${styles[statusLabels[b.status].color]}`} title={b.customerName}>
                                                            {b.guests}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className={styles.bookingsSection}>
                            <div className={styles.bookingsTable}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Mijoz</th>
                                            <th>Sana</th>
                                            <th>Vaqt</th>
                                            <th>Zal</th>
                                            <th>Mehmonlar</th>
                                            <th>Summa</th>
                                            <th>To'langan</th>
                                            <th>Holat</th>
                                            <th>Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {venueBookings.map(booking => {
                                            const status = statusLabels[booking.status];
                                            return (
                                                <tr key={booking.id}>
                                                    <td className={styles.bookingId}>{booking.id}</td>
                                                    <td>
                                                        <div className={styles.customerInfo}>
                                                            <span>{booking.customerName}</span>
                                                            <span className={styles.customerPhone}>{booking.customerPhone}</span>
                                                        </div>
                                                    </td>
                                                    <td>{new Date(booking.date + 'T12:00:00').toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                    <td>{booking.time === 'evening' ? 'Kechasi' : booking.time === 'afternoon' ? 'Tushlik' : 'Ertalab'}</td>
                                                    <td>{booking.hall}</td>
                                                    <td>{booking.guests}</td>
                                                    <td className={styles.amount}>{formatPrice(booking.total)}</td>
                                                    <td className={styles.paidAmount}>{formatPrice(booking.paid)}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${styles[status.color]}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.actions}>
                                                            <button className={styles.actionBtn} title="Ko'rish">👁️</button>
                                                            {booking.status === 'pending' && (
                                                                <button className={styles.actionBtn} title="Tasdiqlash">✅</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className={styles.settingsSection}>
                            <div className={styles.settingsCard}>
                                <h2>To'yxona ma'lumotlari</h2>
                                <div className={styles.settingsForm}>
                                    <div className={styles.formGroup}>
                                        <label>To'yxona nomi</label>
                                        <input type="text" value={venue.name} readOnly />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Manzil</label>
                                        <input type="text" value={venue.address} readOnly />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Telefon</label>
                                        <input type="tel" value={venue.phone} readOnly />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Sig'imi</label>
                                        <input type="text" value={`${venue.capacity.min} - ${venue.capacity.max} kishi`} readOnly />
                                    </div>
                                    <button className="btn btn-outline">Ma'lumotlarni tahrirlash</button>
                                </div>
                            </div>

                            <div className={styles.settingsCard}>
                                <h2>Narxlar</h2>
                                <div className={styles.priceList}>
                                    {venue.halls.map(hall => (
                                        <div key={hall.id} className={styles.priceItem}>
                                            <span>{hall.name}</span>
                                            <span>{formatPrice(hall.pricePerPerson)}/kishi</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
