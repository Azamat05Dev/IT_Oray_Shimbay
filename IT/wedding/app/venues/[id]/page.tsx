'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SimpleBookingForm from '@/components/SimpleBookingForm';
import { venues, formatPrice } from '@/lib/data';
import styles from './page.module.css';

export default function VenueDetailPage() {
    const params = useParams();
    const venueId = parseInt(params.id as string);
    const venue = venues.find(v => v.id === venueId);

    if (!venue) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container" style={{ textAlign: 'center', padding: '150px 20px' }}>
                        <span style={{ fontSize: '64px' }}>😔</span>
                        <h1 style={{ fontSize: '32px', margin: '20px 0' }}>To'yxona topilmadi</h1>
                        <Link href="/venues" className="btn btn-primary" style={{ marginTop: '20px' }}>
                            ← Barcha to'yxonalarga qaytish
                        </Link>
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
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                    <div className="container">
                        <Link href="/">Bosh sahifa</Link>
                        <span>/</span>
                        <Link href="/venues">To'yxonalar</Link>
                        <span>/</span>
                        <span>{venue.name}</span>
                    </div>
                </div>

                {/* Venue Info + Booking */}
                <section className={styles.venueSection}>
                    <div className="container">
                        <div className={styles.venueGrid}>
                            {/* Venue Info */}
                            <div className={styles.venueInfo}>
                                <div className={styles.venueIcon}>{venue.image}</div>

                                <h1 className={styles.venueName}>{venue.name}</h1>

                                <div className={styles.venueStats}>
                                    <span className={styles.rating}>⭐ {venue.rating}</span>
                                    <span className={styles.reviews}>({venue.reviewCount} sharh)</span>
                                </div>

                                <p className={styles.description}>{venue.description}</p>

                                {/* Quick Info */}
                                <div className={styles.quickInfo}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>👥</span>
                                        <div>
                                            <span className={styles.infoLabel}>Sig'imi</span>
                                            <span className={styles.infoValue}>{venue.capacity.min} - {venue.capacity.max} kishi</span>
                                        </div>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>💰</span>
                                        <div>
                                            <span className={styles.infoLabel}>Narxi</span>
                                            <span className={styles.infoValue}>{formatPrice(venue.price.min)} / kishi</span>
                                        </div>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>📍</span>
                                        <div>
                                            <span className={styles.infoLabel}>Manzil</span>
                                            <span className={styles.infoValue}>{venue.address}</span>
                                        </div>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>📞</span>
                                        <div>
                                            <span className={styles.infoLabel}>Telefon</span>
                                            <a href={`tel:${venue.phone}`} className={styles.infoValue}>{venue.phone}</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className={styles.features}>
                                    <h3>Imkoniyatlar:</h3>
                                    <div className={styles.featuresList}>
                                        {venue.features.map((feature, i) => (
                                            <span key={i} className={styles.featureTag}>✓ {feature}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Halls */}
                                <div className={styles.halls}>
                                    <h3>Zallar:</h3>
                                    <div className={styles.hallsList}>
                                        {venue.halls.map(hall => (
                                            <div key={hall.id} className={styles.hallCard}>
                                                <h4>{hall.name}</h4>
                                                <p>{hall.description}</p>
                                                <div className={styles.hallInfo}>
                                                    <span>👥 {hall.capacity} kishi</span>
                                                    <span>💰 {formatPrice(hall.pricePerPerson)}/kishi</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Booking Form */}
                            <div className={styles.bookingColumn}>
                                <SimpleBookingForm venueName={venue.name} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call Banner */}
                <section className={styles.callBanner}>
                    <div className="container">
                        <div className={styles.callContent}>
                            <span className={styles.callIcon}>📞</span>
                            <div>
                                <h3>Savollaringiz bormi?</h3>
                                <p>Qo'ng'iroq qiling - bepul maslahat beramiz!</p>
                            </div>
                            <a href={`tel:${venue.phone}`} className={styles.callButton}>
                                {venue.phone}
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
