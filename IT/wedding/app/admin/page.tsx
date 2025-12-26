'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { venues, formatPrice } from '@/lib/data';
import styles from './page.module.css';

// Demo all bookings (from all venues)
const allBookings = [
    { id: "TB-V1-001", venueId: 1, customerName: "Rustamov Jasur", phone: "+998 90 123 45 67", date: "2025-01-15", time: "evening", guests: 150, total: 29750000, paid: 8925000, status: "confirmed", createdAt: "2024-12-20" },
    { id: "TB-V1-002", venueId: 1, customerName: "Karimova Dilnoza", phone: "+998 91 234 56 78", date: "2025-01-18", time: "evening", guests: 200, total: 38500000, paid: 11550000, status: "confirmed", createdAt: "2024-12-19" },
    { id: "TB-V1-003", venueId: 1, customerName: "Aliyev Bekzod", phone: "+998 93 345 67 89", date: "2025-01-25", time: "afternoon", guests: 100, total: 18000000, paid: 0, status: "pending", createdAt: "2024-12-18" },
    { id: "TB-V2-001", venueId: 2, customerName: "Yusupov Sardor", phone: "+998 94 456 78 90", date: "2025-01-20", time: "evening", guests: 180, total: 32400000, paid: 9720000, status: "confirmed", createdAt: "2024-12-17" },
    { id: "TB-V3-001", venueId: 3, customerName: "Nazarov Jamshid", phone: "+998 95 567 89 01", date: "2025-02-01", time: "evening", guests: 120, total: 21600000, paid: 0, status: "pending", createdAt: "2024-12-16" },
    { id: "TB-V4-001", venueId: 4, customerName: "Toshmatov Ulugbek", phone: "+998 97 678 90 12", date: "2025-01-28", time: "evening", guests: 250, total: 47500000, paid: 14250000, status: "confirmed", createdAt: "2024-12-15" },
    { id: "TB-V5-001", venueId: 5, customerName: "Ergashev Nodir", phone: "+998 90 789 01 23", date: "2025-02-05", time: "evening", guests: 160, total: 28800000, paid: 8640000, status: "confirmed", createdAt: "2024-12-14" },
    { id: "TB-V6-001", venueId: 6, customerName: "Xolmatov Anvar", phone: "+998 91 890 12 34", date: "2025-02-10", time: "evening", guests: 300, total: 54000000, paid: 16200000, status: "confirmed", createdAt: "2024-12-13" },
    { id: "TB-V7-001", venueId: 7, customerName: "Qodirov Bobur", phone: "+998 93 901 23 45", date: "2024-11-15", time: "evening", guests: 120, total: 16800000, paid: 16800000, status: "completed", createdAt: "2024-10-20" },
    { id: "TB-V8-001", venueId: 8, customerName: "Salimov Davron", phone: "+998 94 012 34 56", date: "2024-12-01", time: "evening", guests: 150, total: 23250000, paid: 23250000, status: "completed", createdAt: "2024-11-05" },
];

// Demo users
const users = [
    { id: 1, name: "Azamat Nurullayev", phone: "+998 90 123 45 67", email: "azamat@mail.uz", bookings: 3, totalSpent: 86250000, role: "user", status: "active", createdAt: "2024-10-15", lastLogin: "2024-12-20" },
    { id: 2, name: "Karimova Dilnoza", phone: "+998 91 234 56 78", email: "dilnoza@mail.uz", bookings: 1, totalSpent: 38500000, role: "user", status: "active", createdAt: "2024-11-20", lastLogin: "2024-12-19" },
    { id: 3, name: "Abdullayev Karim", phone: "+998 91 111 22 33", email: "karim@toysaroy.uz", bookings: 0, totalSpent: 0, role: "venue_owner", status: "active", createdAt: "2024-09-01", lastLogin: "2024-12-20" },
    { id: 4, name: "Aliyev Bekzod", phone: "+998 93 345 67 89", email: "bekzod@mail.uz", bookings: 2, totalSpent: 45000000, role: "user", status: "active", createdAt: "2024-12-01", lastLogin: "2024-12-18" },
    { id: 5, name: "Yusupov Sardor", phone: "+998 94 456 78 90", email: "sardor@mail.uz", bookings: 1, totalSpent: 32400000, role: "user", status: "inactive", createdAt: "2024-12-10", lastLogin: "2024-12-17" },
    { id: 6, name: "Ergasheva Malika", phone: "+998 95 123 45 67", email: "malika@gulistan.uz", bookings: 0, totalSpent: 0, role: "venue_owner", status: "active", createdAt: "2024-09-15", lastLogin: "2024-12-19" },
    { id: 7, name: "Super Admin", phone: "+998 91 000 00 00", email: "admin@toybron.uz", bookings: 0, totalSpent: 0, role: "admin", status: "active", createdAt: "2024-08-01", lastLogin: "2024-12-20" },
];

// Activity log
const activityLog = [
    { id: 1, action: "Yangi bron yaratildi", details: "TB-V1-001 - Oq Saroy", user: "Rustamov Jasur", time: "10 daqiqa oldin", type: "booking" },
    { id: 2, action: "To'lov qabul qilindi", details: "8,925,000 so'm - TB-V1-001", user: "Tizim", time: "15 daqiqa oldin", type: "payment" },
    { id: 3, action: "Foydalanuvchi ro'yxatdan o'tdi", details: "Azamat Nurullayev", user: "Tizim", time: "1 soat oldin", type: "user" },
    { id: 4, action: "Bron tasdiqlandi", details: "TB-V4-001 - Baxt Saroyi", user: "Admin", time: "2 soat oldin", type: "booking" },
    { id: 5, action: "To'yxona yangilandi", details: "Oq Saroy - narxlar o'zgartirildi", user: "Abdullayev Karim", time: "3 soat oldin", type: "venue" },
];

// Status labels
const statusLabels: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Tasdiqlangan", color: "success" },
    pending: { label: "Kutilmoqda", color: "warning" },
    completed: { label: "Bajarilgan", color: "info" },
    cancelled: { label: "Bekor qilingan", color: "error" },
};

// Role labels
const roleLabels: Record<string, string> = {
    user: "Foydalanuvchi",
    venue_owner: "To'yxona egasi",
    admin: "Admin",
};

// Monthly revenue data for chart
const monthlyData = [
    { month: "Sen", revenue: 45000000, bookings: 3 },
    { month: "Okt", revenue: 78000000, bookings: 5 },
    { month: "Noy", revenue: 92000000, bookings: 6 },
    { month: "Dek", revenue: 156000000, bookings: 10 },
    { month: "Yan", revenue: 210000000, bookings: 14 },
];

type TabType = 'overview' | 'venues' | 'bookings' | 'users' | 'analytics' | 'settings';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [venueFilter, setVenueFilter] = useState<number>(0);
    const [showModal, setShowModal] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [dateRange, setDateRange] = useState({ start: '2024-12-01', end: '2024-12-31' });

    // Stats
    const stats = useMemo(() => {
        const totalVenues = venues.length;
        const totalBookings = allBookings.length;
        const totalUsers = users.length;
        const totalRevenue = allBookings.reduce((sum, b) => sum + b.total, 0);
        const paidRevenue = allBookings.reduce((sum, b) => sum + b.paid, 0);
        const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
        const completedBookings = allBookings.filter(b => b.status === 'completed').length;
        const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const venueOwners = users.filter(u => u.role === 'venue_owner').length;

        return {
            totalVenues, totalBookings, totalUsers, totalRevenue, paidRevenue,
            pendingBookings, completedBookings, avgBookingValue, activeUsers, venueOwners
        };
    }, []);

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        return allBookings.filter(b => {
            const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.phone.includes(searchQuery);
            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            const matchesVenue = venueFilter === 0 || b.venueId === venueFilter;
            return matchesSearch && matchesStatus && matchesVenue;
        });
    }, [searchQuery, statusFilter, venueFilter]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.phone.includes(searchQuery) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [searchQuery]);

    // Handle view details
    const handleViewDetails = (type: string, item: any) => {
        setSelectedItem(item);
        setShowModal(type);
    };

    // Handle status change
    const handleStatusChange = (bookingId: string, newStatus: string) => {
        // In real app, this would call API
        console.log(`Changing ${bookingId} status to ${newStatus}`);
        setShowModal(null);
    };

    // Export to CSV
    const exportToCSV = (data: any[], filename: string) => {
        // Simplified CSV export
        const csv = data.map(row => Object.values(row).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
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
                    <span className={styles.adminBadge}>Super Admin</span>
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
                        className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <span>📈</span>
                        <span>Analitika</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'venues' ? styles.active : ''}`}
                        onClick={() => setActiveTab('venues')}
                    >
                        <span>🏛️</span>
                        <span>To'yxonalar</span>
                        <span className={styles.navBadge}>{stats.totalVenues}</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <span>📋</span>
                        <span>Bronlar</span>
                        {stats.pendingBookings > 0 && (
                            <span className={styles.navBadgeWarning}>{stats.pendingBookings}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <span>👥</span>
                        <span>Foydalanuvchilar</span>
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
                    <div className={styles.adminInfo}>
                        <div className={styles.adminAvatar}>👑</div>
                        <div>
                            <span className={styles.adminName}>Super Admin</span>
                            <span className={styles.adminRole}>admin@toybron.uz</span>
                        </div>
                    </div>
                    <button className={styles.logoutBtn}>
                        🚪 Chiqish
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.pageTitle}>
                            {activeTab === 'overview' && 'Bosh sahifa'}
                            {activeTab === 'analytics' && 'Analitika'}
                            {activeTab === 'venues' && "To'yxonalar"}
                            {activeTab === 'bookings' && 'Bronlar'}
                            {activeTab === 'users' && 'Foydalanuvchilar'}
                            {activeTab === 'settings' && 'Sozlamalar'}
                        </h1>
                        <span className={styles.currentDate}>
                            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <div className={styles.headerRight}>
                        <button className={styles.notificationBtn}>
                            🔔
                            <span className={styles.notificationBadge}>3</span>
                        </button>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>Super Admin</span>
                            <div className={styles.userAvatar}>👑</div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className={styles.content}>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>🏛️</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalVenues}</span>
                                        <span className={styles.statLabel}>To'yxonalar</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>📅</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalBookings}</span>
                                        <span className={styles.statLabel}>Jami bronlar</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon}>👥</div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalUsers}</span>
                                        <span className={styles.statLabel}>Foydalanuvchilar</span>
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

                            {/* Two column layout */}
                            <div className={styles.overviewGrid}>
                                {/* Left column */}
                                <div className={styles.overviewLeft}>
                                    {/* Revenue Card */}
                                    <div className={styles.overviewCard}>
                                        <h3>💵 Daromad statistikasi</h3>
                                        <div className={styles.revenueStats}>
                                            <div className={styles.revenueStat}>
                                                <span className={styles.revenueLabel}>Jami kutilayotgan:</span>
                                                <span className={styles.revenueValue}>{formatPrice(stats.totalRevenue)}</span>
                                            </div>
                                            <div className={styles.revenueStat}>
                                                <span className={styles.revenueLabel}>To'langan:</span>
                                                <span className={`${styles.revenueValue} ${styles.success}`}>{formatPrice(stats.paidRevenue)}</span>
                                            </div>
                                            <div className={styles.revenueStat}>
                                                <span className={styles.revenueLabel}>Kutilmoqda:</span>
                                                <span className={`${styles.revenueValue} ${styles.warning}`}>{formatPrice(stats.totalRevenue - stats.paidRevenue)}</span>
                                            </div>
                                            <div className={styles.revenueStat}>
                                                <span className={styles.revenueLabel}>O'rtacha bron:</span>
                                                <span className={styles.revenueValue}>{formatPrice(stats.avgBookingValue)}</span>
                                            </div>
                                        </div>

                                        {/* Simple bar chart */}
                                        <div className={styles.chartContainer}>
                                            <h4>Oylik daromad</h4>
                                            <div className={styles.barChart}>
                                                {monthlyData.map((data, i) => (
                                                    <div key={i} className={styles.barItem}>
                                                        <div
                                                            className={styles.bar}
                                                            style={{ height: `${(data.revenue / 210000000) * 100}%` }}
                                                        >
                                                            <span className={styles.barValue}>{data.bookings}</span>
                                                        </div>
                                                        <span className={styles.barLabel}>{data.month}</span>
                                                    </div>
                                                ))}
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
                                                        <th>To'yxona</th>
                                                        <th>Mijoz</th>
                                                        <th>Sana</th>
                                                        <th>Summa</th>
                                                        <th>Holat</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allBookings.slice(0, 5).map(booking => {
                                                        const venue = venues.find(v => v.id === booking.venueId);
                                                        const status = statusLabels[booking.status];
                                                        return (
                                                            <tr key={booking.id} onClick={() => handleViewDetails('booking', booking)}>
                                                                <td className={styles.bookingId}>{booking.id}</td>
                                                                <td>
                                                                    <div className={styles.venueCell}>
                                                                        <span>{venue?.image}</span>
                                                                        <span>{venue?.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td>{booking.customerName}</td>
                                                                <td>{new Date(booking.date + 'T12:00:00').toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</td>
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
                                </div>

                                {/* Right column */}
                                <div className={styles.overviewRight}>
                                    {/* Top Venues */}
                                    <div className={styles.overviewCard}>
                                        <h3>📊 Eng mashhur to'yxonalar</h3>
                                        <div className={styles.topVenues}>
                                            {venues.slice(0, 5).map((venue, index) => {
                                                const venueBookings = allBookings.filter(b => b.venueId === venue.id);
                                                const venueRevenue = venueBookings.reduce((s, b) => s + b.paid, 0);
                                                return (
                                                    <div key={venue.id} className={styles.topVenueItem}>
                                                        <span className={styles.topRank}>#{index + 1}</span>
                                                        <span className={styles.topIcon}>{venue.image}</span>
                                                        <div className={styles.topVenueInfo}>
                                                            <span className={styles.topName}>{venue.name}</span>
                                                            <span className={styles.topStats}>{venueBookings.length} bron • {formatPrice(venueRevenue)}</span>
                                                        </div>
                                                        <span className={styles.topRating}>⭐ {venue.rating}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Activity Log */}
                                    <div className={styles.overviewCard}>
                                        <h3>📝 Oxirgi faoliyat</h3>
                                        <div className={styles.activityLog}>
                                            {activityLog.map(activity => (
                                                <div key={activity.id} className={styles.activityItem}>
                                                    <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
                                                        {activity.type === 'booking' && '📋'}
                                                        {activity.type === 'payment' && '💳'}
                                                        {activity.type === 'user' && '👤'}
                                                        {activity.type === 'venue' && '🏛️'}
                                                    </div>
                                                    <div className={styles.activityContent}>
                                                        <span className={styles.activityAction}>{activity.action}</span>
                                                        <span className={styles.activityDetails}>{activity.details}</span>
                                                        <span className={styles.activityTime}>{activity.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className={styles.quickStats}>
                                        <div className={styles.quickStatItem}>
                                            <span className={styles.quickStatIcon}>✅</span>
                                            <span className={styles.quickStatValue}>{stats.completedBookings}</span>
                                            <span className={styles.quickStatLabel}>Bajarilgan</span>
                                        </div>
                                        <div className={styles.quickStatItem}>
                                            <span className={styles.quickStatIcon}>⏳</span>
                                            <span className={styles.quickStatValue}>{stats.pendingBookings}</span>
                                            <span className={styles.quickStatLabel}>Kutilmoqda</span>
                                        </div>
                                        <div className={styles.quickStatItem}>
                                            <span className={styles.quickStatIcon}>🏢</span>
                                            <span className={styles.quickStatValue}>{stats.venueOwners}</span>
                                            <span className={styles.quickStatLabel}>Egalar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className={styles.analyticsSection}>
                            {/* Date Range Picker */}
                            <div className={styles.filterBar}>
                                <div className={styles.dateRange}>
                                    <label>Davr:</label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    />
                                    <span>—</span>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    />
                                </div>
                                <button className="btn btn-outline btn-sm" onClick={() => exportToCSV(allBookings, 'hisobot')}>
                                    📥 Export CSV
                                </button>
                            </div>

                            {/* Analytics Cards */}
                            <div className={styles.analyticsGrid}>
                                <div className={styles.analyticsCard}>
                                    <h3>📈 Umumiy ko'rsatkichlar</h3>
                                    <div className={styles.metricsList}>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>Jami bronlar</span>
                                            <span className={styles.metricValue}>{stats.totalBookings}</span>
                                            <span className={styles.metricChange}>+23% o'tgan oyga</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>Jami daromad</span>
                                            <span className={styles.metricValue}>{formatPrice(stats.totalRevenue)}</span>
                                            <span className={styles.metricChange}>+18% o'tgan oyga</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>O'rtacha bron qiymati</span>
                                            <span className={styles.metricValue}>{formatPrice(stats.avgBookingValue)}</span>
                                            <span className={styles.metricChange}>+5% o'tgan oyga</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>Aktiv foydalanuvchilar</span>
                                            <span className={styles.metricValue}>{stats.activeUsers}</span>
                                            <span className={styles.metricChange}>+12% o'tgan oyga</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.analyticsCard}>
                                    <h3>🏛️ To'yxonalar bo'yicha</h3>
                                    <div className={styles.venueAnalytics}>
                                        {venues.slice(0, 6).map(venue => {
                                            const venueBookings = allBookings.filter(b => b.venueId === venue.id);
                                            const venueRevenue = venueBookings.reduce((s, b) => s + b.total, 0);
                                            const percentage = stats.totalRevenue > 0 ? Math.round((venueRevenue / stats.totalRevenue) * 100) : 0;
                                            return (
                                                <div key={venue.id} className={styles.venueAnalyticItem}>
                                                    <div className={styles.venueAnalyticHeader}>
                                                        <span>{venue.image} {venue.name}</span>
                                                        <span>{percentage}%</span>
                                                    </div>
                                                    <div className={styles.progressBar}>
                                                        <div className={styles.progressFill} style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <span className={styles.venueRevenue}>{formatPrice(venueRevenue)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.analyticsCard}>
                                    <h3>📅 Vaqt slotlari</h3>
                                    <div className={styles.timeSlotAnalytics}>
                                        {['morning', 'afternoon', 'evening'].map(slot => {
                                            const slotBookings = allBookings.filter(b => b.time === slot);
                                            const percentage = stats.totalBookings > 0 ? Math.round((slotBookings.length / stats.totalBookings) * 100) : 0;
                                            return (
                                                <div key={slot} className={styles.timeSlotItem}>
                                                    <div className={styles.timeSlotHeader}>
                                                        <span>
                                                            {slot === 'morning' && '🌅 Ertalab'}
                                                            {slot === 'afternoon' && '☀️ Tushlik'}
                                                            {slot === 'evening' && '🌙 Kechasi'}
                                                        </span>
                                                        <span>{slotBookings.length} bron</span>
                                                    </div>
                                                    <div className={styles.progressBar}>
                                                        <div className={`${styles.progressFill} ${styles[slot]}`} style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.analyticsCard}>
                                    <h3>📊 Holat taqsimoti</h3>
                                    <div className={styles.statusAnalytics}>
                                        {Object.entries(statusLabels).map(([key, value]) => {
                                            const count = allBookings.filter(b => b.status === key).length;
                                            return (
                                                <div key={key} className={styles.statusItem}>
                                                    <div className={`${styles.statusDot} ${styles[value.color]}`}></div>
                                                    <span className={styles.statusName}>{value.label}</span>
                                                    <span className={styles.statusCount}>{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Venues Tab */}
                    {activeTab === 'venues' && (
                        <div className={styles.venuesSection}>
                            {/* Toolbar */}
                            <div className={styles.toolbar}>
                                <div className={styles.searchBox}>
                                    <span>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="To'yxona qidirish..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-primary">+ Yangi to'yxona</button>
                            </div>

                            {/* Venues Grid */}
                            <div className={styles.venuesGrid}>
                                {venues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase())).map(venue => {
                                    const venueBookings = allBookings.filter(b => b.venueId === venue.id);
                                    const venueRevenue = venueBookings.reduce((s, b) => s + b.paid, 0);
                                    return (
                                        <div key={venue.id} className={styles.venueCard}>
                                            <div className={styles.venueCardHeader}>
                                                <span className={styles.venueIcon}>{venue.image}</span>
                                                <div>
                                                    <h3>{venue.name}</h3>
                                                    <span className={styles.venueRating}>⭐ {venue.rating} ({venue.reviewCount})</span>
                                                </div>
                                                <span className={styles.venueStatus}>✅ Aktiv</span>
                                            </div>
                                            <div className={styles.venueCardDetails}>
                                                <p>📍 {venue.address}</p>
                                                <p>📞 {venue.phone}</p>
                                                <p>👥 {venue.capacity.min}-{venue.capacity.max} kishi</p>
                                                <p>💰 {formatPrice(venue.price.min)}/kishi</p>
                                            </div>
                                            <div className={styles.venueCardStats}>
                                                <div>
                                                    <span>{venueBookings.length}</span>
                                                    <span>Bronlar</span>
                                                </div>
                                                <div>
                                                    <span>{formatPrice(venueRevenue)}</span>
                                                    <span>Daromad</span>
                                                </div>
                                            </div>
                                            <div className={styles.venueCardActions}>
                                                <button className="btn btn-outline btn-sm" onClick={() => handleViewDetails('venue', venue)}>✏️ Tahrirlash</button>
                                                <button className="btn btn-primary btn-sm">👁️ Ko'rish</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className={styles.bookingsSection}>
                            {/* Toolbar */}
                            <div className={styles.toolbar}>
                                <div className={styles.searchBox}>
                                    <span>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="ID, ism yoki telefon..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="all">Barcha holatlar</option>
                                    <option value="pending">Kutilmoqda</option>
                                    <option value="confirmed">Tasdiqlangan</option>
                                    <option value="completed">Bajarilgan</option>
                                    <option value="cancelled">Bekor qilingan</option>
                                </select>
                                <select
                                    value={venueFilter}
                                    onChange={(e) => setVenueFilter(parseInt(e.target.value))}
                                    className={styles.filterSelect}
                                >
                                    <option value={0}>Barcha to'yxonalar</option>
                                    {venues.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                                <button className="btn btn-outline btn-sm" onClick={() => exportToCSV(filteredBookings, 'bronlar')}>
                                    📥 Export
                                </button>
                            </div>

                            {/* Results count */}
                            <div className={styles.resultsCount}>
                                {filteredBookings.length} ta natija topildi
                            </div>

                            {/* Table */}
                            <div className={styles.section}>
                                <div className={styles.bookingsTable}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>To'yxona</th>
                                                <th>Mijoz</th>
                                                <th>Telefon</th>
                                                <th>Sana</th>
                                                <th>Mehmonlar</th>
                                                <th>Summa</th>
                                                <th>To'langan</th>
                                                <th>Holat</th>
                                                <th>Amallar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBookings.map(booking => {
                                                const venue = venues.find(v => v.id === booking.venueId);
                                                const status = statusLabels[booking.status];
                                                return (
                                                    <tr key={booking.id}>
                                                        <td className={styles.bookingId}>{booking.id}</td>
                                                        <td>
                                                            <div className={styles.venueCell}>
                                                                <span>{venue?.image}</span>
                                                                <span>{venue?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{booking.customerName}</td>
                                                        <td className={styles.phone}>{booking.phone}</td>
                                                        <td>{new Date(booking.date + 'T12:00:00').toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
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
                                                                <button className={styles.actionBtn} title="Ko'rish" onClick={() => handleViewDetails('booking', booking)}>👁️</button>
                                                                {booking.status === 'pending' && (
                                                                    <button className={styles.actionBtn} title="Tasdiqlash" onClick={() => handleStatusChange(booking.id, 'confirmed')}>✅</button>
                                                                )}
                                                                <button className={styles.actionBtn} title="Chop etish">🖨️</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className={styles.usersSection}>
                            {/* Toolbar */}
                            <div className={styles.toolbar}>
                                <div className={styles.searchBox}>
                                    <span>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Ism, telefon yoki email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-primary">+ Yangi foydalanuvchi</button>
                            </div>

                            {/* User Stats */}
                            <div className={styles.userStatsGrid}>
                                <div className={styles.userStatCard}>
                                    <span className={styles.userStatIcon}>👥</span>
                                    <span className={styles.userStatValue}>{users.filter(u => u.role === 'user').length}</span>
                                    <span className={styles.userStatLabel}>Foydalanuvchilar</span>
                                </div>
                                <div className={styles.userStatCard}>
                                    <span className={styles.userStatIcon}>🏢</span>
                                    <span className={styles.userStatValue}>{users.filter(u => u.role === 'venue_owner').length}</span>
                                    <span className={styles.userStatLabel}>To'yxona egalari</span>
                                </div>
                                <div className={styles.userStatCard}>
                                    <span className={styles.userStatIcon}>👑</span>
                                    <span className={styles.userStatValue}>{users.filter(u => u.role === 'admin').length}</span>
                                    <span className={styles.userStatLabel}>Adminlar</span>
                                </div>
                                <div className={styles.userStatCard}>
                                    <span className={styles.userStatIcon}>✅</span>
                                    <span className={styles.userStatValue}>{users.filter(u => u.status === 'active').length}</span>
                                    <span className={styles.userStatLabel}>Aktiv</span>
                                </div>
                            </div>

                            {/* Table */}
                            <div className={styles.section}>
                                <div className={styles.bookingsTable}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Foydalanuvchi</th>
                                                <th>Email</th>
                                                <th>Telefon</th>
                                                <th>Rol</th>
                                                <th>Bronlar</th>
                                                <th>Jami xarajat</th>
                                                <th>Holat</th>
                                                <th>Amallar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td>#{user.id}</td>
                                                    <td>
                                                        <div className={styles.userCell}>
                                                            <div className={styles.userAvatar}>
                                                                {user.role === 'admin' ? '👑' : user.role === 'venue_owner' ? '🏢' : '👤'}
                                                            </div>
                                                            <div className={styles.userDetails}>
                                                                <span className={styles.userNameCell}>{user.name}</span>
                                                                <span className={styles.userLastLogin}>Oxirgi kirish: {new Date(user.lastLogin).toLocaleDateString('uz-UZ')}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={styles.email}>{user.email}</td>
                                                    <td className={styles.phone}>{user.phone}</td>
                                                    <td>
                                                        <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                                                            {roleLabels[user.role]}
                                                        </span>
                                                    </td>
                                                    <td>{user.bookings}</td>
                                                    <td className={styles.amount}>{formatPrice(user.totalSpent)}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.success : styles.error}`}>
                                                            {user.status === 'active' ? 'Aktiv' : 'Noaktiv'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.actions}>
                                                            <button className={styles.actionBtn} title="Ko'rish" onClick={() => handleViewDetails('user', user)}>👁️</button>
                                                            <button className={styles.actionBtn} title="Tahrirlash">✏️</button>
                                                            {user.role !== 'admin' && (
                                                                <button className={styles.actionBtn} title="O'chirish">🗑️</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className={styles.settingsSection}>
                            <div className={styles.settingsGrid}>
                                {/* General Settings */}
                                <div className={styles.settingsCard}>
                                    <h3>⚙️ Umumiy sozlamalar</h3>
                                    <div className={styles.settingsForm}>
                                        <div className={styles.formGroup}>
                                            <label>Platforma nomi</label>
                                            <input type="text" value="ToyBron Chimbay" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Bog'lanish telefoni</label>
                                            <input type="tel" value="+998 61 123 45 67" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Email</label>
                                            <input type="email" value="info@toybron.uz" />
                                        </div>
                                        <button className="btn btn-primary btn-sm">Saqlash</button>
                                    </div>
                                </div>

                                {/* Payment Settings */}
                                <div className={styles.settingsCard}>
                                    <h3>💳 To'lov sozlamalari</h3>
                                    <div className={styles.settingsForm}>
                                        <div className={styles.formGroup}>
                                            <label>Oldindan to'lov (%)</label>
                                            <input type="number" value="30" min="0" max="100" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>QR to'lov muddati (daqiqa)</label>
                                            <input type="number" value="15" min="5" max="60" />
                                        </div>
                                        <div className={styles.toggleGroup}>
                                            <label>Naqd to'lovni qo'llab-quvvatlash</label>
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <button className="btn btn-primary btn-sm">Saqlash</button>
                                    </div>
                                </div>

                                {/* Notification Settings */}
                                <div className={styles.settingsCard}>
                                    <h3>🔔 Bildirishnomalar</h3>
                                    <div className={styles.settingsForm}>
                                        <div className={styles.toggleGroup}>
                                            <label>SMS bildirishnomalar</label>
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <div className={styles.toggleGroup}>
                                            <label>Email bildirishnomalar</label>
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <div className={styles.toggleGroup}>
                                            <label>Yangi bron haqida xabar</label>
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <div className={styles.toggleGroup}>
                                            <label>To'lov haqida xabar</label>
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <button className="btn btn-primary btn-sm">Saqlash</button>
                                    </div>
                                </div>

                                {/* Security Settings */}
                                <div className={styles.settingsCard}>
                                    <h3>🔒 Xavfsizlik</h3>
                                    <div className={styles.settingsForm}>
                                        <div className={styles.formGroup}>
                                            <label>Joriy parol</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Yangi parol</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Parolni tasdiqlash</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                        <button className="btn btn-primary btn-sm">Parolni o'zgartirish</button>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className={styles.dangerZone}>
                                <h3>⚠️ Xavfli zona</h3>
                                <div className={styles.dangerActions}>
                                    <div className={styles.dangerItem}>
                                        <div>
                                            <strong>Barcha keshni tozalash</strong>
                                            <p>Tizim keshini tozalash. Bu vaqtincha sekinlashishga olib kelishi mumkin.</p>
                                        </div>
                                        <button className="btn btn-outline btn-sm">Tozalash</button>
                                    </div>
                                    <div className={styles.dangerItem}>
                                        <div>
                                            <strong>Ma'lumotlar bazasini zaxiralash</strong>
                                            <p>Barcha ma'lumotlarning zaxira nusxasini yaratish.</p>
                                        </div>
                                        <button className="btn btn-outline btn-sm">Zaxiralash</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {showModal && selectedItem && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>
                                {showModal === 'booking' && `Bron: ${selectedItem.id}`}
                                {showModal === 'venue' && `To'yxona: ${selectedItem.name}`}
                                {showModal === 'user' && `Foydalanuvchi: ${selectedItem.name}`}
                            </h2>
                            <button className={styles.modalClose} onClick={() => setShowModal(null)}>✕</button>
                        </div>
                        <div className={styles.modalContent}>
                            {showModal === 'booking' && (
                                <div className={styles.bookingDetails}>
                                    <div className={styles.detailRow}>
                                        <span>To'yxona:</span>
                                        <span>{venues.find(v => v.id === selectedItem.venueId)?.name}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Mijoz:</span>
                                        <span>{selectedItem.customerName}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Telefon:</span>
                                        <span>{selectedItem.phone}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Sana:</span>
                                        <span>{selectedItem.date}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Mehmonlar:</span>
                                        <span>{selectedItem.guests} kishi</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Jami:</span>
                                        <span className={styles.amount}>{formatPrice(selectedItem.total)}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>To'langan:</span>
                                        <span className={styles.paidAmount}>{formatPrice(selectedItem.paid)}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Qolgan:</span>
                                        <span>{formatPrice(selectedItem.total - selectedItem.paid)}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Holat:</span>
                                        <span className={`${styles.statusBadge} ${styles[statusLabels[selectedItem.status].color]}`}>
                                            {statusLabels[selectedItem.status].label}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {showModal === 'user' && (
                                <div className={styles.userDetailsModal}>
                                    <div className={styles.detailRow}>
                                        <span>Email:</span>
                                        <span>{selectedItem.email}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Telefon:</span>
                                        <span>{selectedItem.phone}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Rol:</span>
                                        <span className={`${styles.roleBadge} ${styles[selectedItem.role]}`}>
                                            {roleLabels[selectedItem.role]}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Bronlar:</span>
                                        <span>{selectedItem.bookings}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Jami xarajat:</span>
                                        <span>{formatPrice(selectedItem.totalSpent)}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Ro'yxatdan:</span>
                                        <span>{selectedItem.createdAt}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            {showModal === 'booking' && selectedItem.status === 'pending' && (
                                <button className="btn btn-primary" onClick={() => handleStatusChange(selectedItem.id, 'confirmed')}>
                                    ✅ Tasdiqlash
                                </button>
                            )}
                            <button className="btn btn-outline" onClick={() => setShowModal(null)}>Yopish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
