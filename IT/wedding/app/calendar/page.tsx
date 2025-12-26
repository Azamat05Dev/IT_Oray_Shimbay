'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { venues } from '@/lib/data';
import styles from './page.module.css';

const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

const dayNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

// Demo booked dates
const bookedDates: Record<number, { date: string; time: string; venue: string }[]> = {
    1: [
        { date: '2025-01-15', time: 'evening', venue: 'Oq Saroy' },
        { date: '2025-01-18', time: 'evening', venue: 'Oq Saroy' },
        { date: '2025-01-25', time: 'afternoon', venue: 'Oq Saroy' },
    ],
    2: [{ date: '2025-01-20', time: 'evening', venue: 'Gulistan' }],
    3: [{ date: '2025-02-01', time: 'evening', venue: "Shirin To'y" }],
    4: [{ date: '2025-01-28', time: 'evening', venue: 'Baxt Saroyi' }],
};

export default function CalendarPage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedVenue, setSelectedVenue] = useState<number>(0);

    const daysInMonth = useMemo(() => {
        return new Date(currentYear, currentMonth + 1, 0).getDate();
    }, [currentMonth, currentYear]);

    const firstDayOfMonth = useMemo(() => {
        const day = new Date(currentYear, currentMonth, 1).getDay();
        return day === 0 ? 6 : day - 1;
    }, [currentMonth, currentYear]);

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const getBookingsForDate = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const allBookings: { date: string; time: string; venue: string; venueId: number }[] = [];

        Object.entries(bookedDates).forEach(([venueId, bookings]) => {
            if (selectedVenue === 0 || selectedVenue === parseInt(venueId)) {
                bookings.forEach(b => {
                    if (b.date === dateStr) {
                        allBookings.push({ ...b, venueId: parseInt(venueId) });
                    }
                });
            }
        });

        return allBookings;
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.pageHeader}>
                        <h1>📅 Kalendar</h1>
                        <p>Barcha to'yxonalardagi band va bo'sh sanalarni ko'ring</p>
                    </div>

                    {/* Filters */}
                    <div className={styles.filters}>
                        <select
                            value={selectedVenue}
                            onChange={(e) => setSelectedVenue(parseInt(e.target.value))}
                            className={styles.venueFilter}
                        >
                            <option value={0}>Barcha to'yxonalar</option>
                            {venues.map(v => (
                                <option key={v.id} value={v.id}>{v.image} {v.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Calendar */}
                    <div className={styles.calendarCard}>
                        <div className={styles.calendarHeader}>
                            <button onClick={prevMonth} className={styles.navBtn}>←</button>
                            <h2>{monthNames[currentMonth]} {currentYear}</h2>
                            <button onClick={nextMonth} className={styles.navBtn}>→</button>
                        </div>

                        <div className={styles.dayNames}>
                            {dayNames.map(day => (
                                <div key={day} className={styles.dayName}>{day}</div>
                            ))}
                        </div>

                        <div className={styles.calendarGrid}>
                            {/* Empty cells */}
                            {[...Array(firstDayOfMonth)].map((_, i) => (
                                <div key={`empty-${i}`} className={styles.emptyDay}></div>
                            ))}

                            {/* Days */}
                            {[...Array(daysInMonth)].map((_, i) => {
                                const day = i + 1;
                                const bookings = getBookingsForDate(day);
                                const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                                return (
                                    <div
                                        key={day}
                                        className={`${styles.calendarDay} ${isPast ? styles.past : ''} ${isToday ? styles.today : ''} ${bookings.length > 0 ? styles.hasBookings : ''}`}
                                    >
                                        <span className={styles.dayNumber}>{day}</span>
                                        {bookings.length > 0 && (
                                            <div className={styles.bookings}>
                                                {bookings.map((b, idx) => (
                                                    <div key={idx} className={styles.booking}>
                                                        <span className={styles.bookingTime}>
                                                            {b.time === 'morning' ? '🌅' : b.time === 'afternoon' ? '☀️' : '🌙'}
                                                        </span>
                                                        <span className={styles.bookingVenue}>{b.venue}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className={styles.legend}>
                            <div className={styles.legendItem}>
                                <span className={`${styles.legendDot} ${styles.available}`}></span>
                                <span>Bo'sh</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={`${styles.legendDot} ${styles.booked}`}></span>
                                <span>Band</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span>🌅 Ertalab</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span>☀️ Tushlik</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span>🌙 Kechqurun</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className={styles.ctaSection}>
                        <p>O'zingizga mos sanani topdingizmi?</p>
                        <Link href="/venues" className={styles.ctaBtn}>
                            To'yxonalarni ko'rish →
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
