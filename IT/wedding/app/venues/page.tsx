import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { venues, formatPrice } from '@/lib/data';
import styles from './page.module.css';

export const metadata = {
    title: "To'yxonalar | Chimbay ToyBron",
    description: "Chimbay tumanidagi barcha 10 ta to'yxonani ko'ring. Narxlar, sig'im, reyting va bo'sh sanalar.",
};

export default function VenuesPage() {
    return (
        <>
            <Header />

            <main className={styles.main}>
                {/* Hero */}
                <section className={styles.hero}>
                    <div className="container">
                        <h1 className={styles.title}>Chimbay To'yxonalari</h1>
                        <p className={styles.subtitle}>
                            Barcha {venues.length} ta to'yxonani ko'ring va o'zingizga mosini tanlang
                        </p>
                    </div>
                </section>

                {/* Venues Grid */}
                <section className={styles.venuesSection}>
                    <div className="container">
                        <div className={styles.venuesGrid}>
                            {venues.map((venue) => (
                                <Link
                                    key={venue.id}
                                    href={`/venues/${venue.id}`}
                                    className={styles.venueCard}
                                >
                                    <div className={styles.venueImageWrapper}>
                                        <span className={styles.venueImage}>{venue.image}</span>
                                        <span className={styles.venueRating}>
                                            ⭐ {venue.rating}
                                        </span>
                                    </div>

                                    <div className={styles.venueContent}>
                                        <h2 className={styles.venueName}>{venue.name}</h2>
                                        <p className={styles.venueDescription}>{venue.description}</p>

                                        <div className={styles.venueDetails}>
                                            <div className={styles.venueDetail}>
                                                <span className={styles.detailIcon}>👥</span>
                                                <span>{venue.capacity.min}-{venue.capacity.max} kishi</span>
                                            </div>
                                            <div className={styles.venueDetail}>
                                                <span className={styles.detailIcon}>📍</span>
                                                <span>{venue.address}</span>
                                            </div>
                                        </div>

                                        <div className={styles.venueFeatures}>
                                            {venue.features.slice(0, 3).map((feature, i) => (
                                                <span key={i} className={styles.featureTag}>{feature}</span>
                                            ))}
                                            {venue.features.length > 3 && (
                                                <span className={styles.featureMore}>+{venue.features.length - 3}</span>
                                            )}
                                        </div>

                                        <div className={styles.venueFooter}>
                                            <div className={styles.venuePrice}>
                                                <span className={styles.priceLabel}>1 kishi:</span>
                                                <span className={styles.priceValue}>
                                                    {formatPrice(venue.price.min)}
                                                </span>
                                            </div>
                                            <span className={styles.viewButton}>
                                                Ko'rish →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
