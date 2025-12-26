'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

// To'yxonalar ro'yxati - rasmlar va videolar bilan
const venues = [
    {
        id: 1,
        name: "Oq Saroy",
        capacity: "200-400",
        price: "180,000",
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=500&fit=crop",
        video: "https://assets.mixkit.co/videos/preview/mixkit-wedding-guests-raising-their-glasses-for-a-toast-4327-large.mp4"
    },
    {
        id: 2,
        name: "Gulistan",
        capacity: "150-300",
        price: "150,000",
        image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=500&fit=crop",
        video: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-walking-together-4311-large.mp4"
    },
    {
        id: 3,
        name: "Shirin To'y",
        capacity: "100-250",
        price: "160,000",
        image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&h=500&fit=crop",
        video: "https://assets.mixkit.co/videos/preview/mixkit-elegant-wedding-table-setting-4317-large.mp4"
    },
    {
        id: 4,
        name: "Baxt Saroyi",
        capacity: "200-500",
        price: "200,000",
        image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=500&fit=crop",
        video: "https://assets.mixkit.co/videos/preview/mixkit-newlyweds-dancing-at-their-wedding-reception-4324-large.mp4"
    },
    {
        id: 5,
        name: "Navruz",
        capacity: "150-350",
        price: "170,000",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop",
        video: "https://assets.mixkit.co/videos/preview/mixkit-wedding-cake-being-cut-4322-large.mp4"
    },
    {
        id: 6,
        name: "Arzon To'yxona",
        capacity: "80-150",
        price: "140,000",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop",
        video: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-throwing-confetti-at-a-wedding-4323-large.mp4"
    },
];

export default function BookingPage() {
    const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        guestCount: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const venue = venues.find(v => v.id === selectedVenue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={styles.successSection}>
                        <div className={styles.successContent}>
                            <div className={styles.successIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h1>Arizangiz qabul qilindi!</h1>
                            <p>Tez orada siz bilan bog'lanamiz</p>
                            <div className={styles.successDetails}>
                                <div className={styles.successItem}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    <span>{venue?.name}</span>
                                </div>
                                <div className={styles.successItem}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>{formData.date}</span>
                                </div>
                            </div>
                            <Link href="/" className={styles.homeBtn}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                                Bosh sahifaga
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main className={styles.main}>
                {/* Hero with video background */}
                <section className={styles.hero}>
                    <div className={styles.videoContainer}>
                        <video
                            key={venue?.video || 'default'}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className={styles.bgVideo}
                        >
                            <source src={venue?.video || "https://assets.mixkit.co/videos/preview/mixkit-newlyweds-dancing-at-their-wedding-reception-4324-large.mp4"} type="video/mp4" />
                        </video>
                        <div className={styles.videoOverlay}></div>
                    </div>

                    <div className={styles.heroContent}>
                        <div className={styles.heroIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                                <path d="M9 16l2 2 4-4" />
                            </svg>
                        </div>
                        <h1 className={styles.heroTitle}>Online ariza berish</h1>
                        <p className={styles.heroDescription}>
                            To'yxona tanlang va ariza qoldiring - biz tez orada aloqaga chiqamiz
                        </p>
                    </div>
                </section>

                {/* Venue Selection */}
                <section className={styles.venueSelection}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <h2>To'yxonani tanlang</h2>
                        </div>

                        <div className={styles.venueGrid}>
                            {venues.map((v) => (
                                <button
                                    key={v.id}
                                    className={`${styles.venueCard} ${selectedVenue === v.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedVenue(v.id)}
                                >
                                    <div className={styles.venueImage}>
                                        <img src={v.image} alt={v.name} />
                                        {selectedVenue === v.id && (
                                            <div className={styles.selectedBadge}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.venueInfo}>
                                        <h3>{v.name}</h3>
                                        <div className={styles.venueDetails}>
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                </svg>
                                                {v.capacity}
                                            </span>
                                            <span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="1" x2="12" y2="23" />
                                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                                </svg>
                                                {v.price}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Booking Form */}
                {selectedVenue && (
                    <section className={styles.formSection}>
                        <div className="container">
                            <div className={styles.formWrapper}>
                                <div className={styles.formHeader}>
                                    <div className={styles.formIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </div>
                                    <h2>Ma'lumotlaringizni kiriting</h2>
                                    <p>{venue?.name} uchun ariza</p>
                                </div>

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Ismingiz
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ismingizni kiriting"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                            Telefon raqam
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+998 90 123 45 67"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            To'y sanasi
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                            Mehmonlar soni
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="100"
                                            required
                                            min="50"
                                            max="500"
                                            value={formData.guestCount}
                                            onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className={styles.submitBtn}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Ariza yuborish
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}
