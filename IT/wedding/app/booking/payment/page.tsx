'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { venues, formatPrice } from '@/lib/data';
import styles from './page.module.css';

// Payment statuses
type PaymentStatus = 'pending' | 'processing' | 'success' | 'expired' | 'error';

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const venueId = parseInt(searchParams.get('venue') || '1');
    const dateParam = searchParams.get('date') || '';
    const timeParam = searchParams.get('time') || '';
    const guestsParam = parseInt(searchParams.get('guests') || '150');
    const totalParam = parseInt(searchParams.get('total') || '0');
    const advanceParam = parseInt(searchParams.get('advance') || '0');

    const venue = venues.find(v => v.id === venueId);

    // Generate unique order ID
    const [orderId] = useState(() => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `TB-${timestamp}-${random}`;
    });

    // State
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
    const [isSimulating, setIsSimulating] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (paymentStatus !== 'pending' && paymentStatus !== 'processing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setPaymentStatus('expired');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [paymentStatus]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Simulate payment (for demo)
    const simulatePayment = useCallback(() => {
        setIsSimulating(true);
        setPaymentStatus('processing');

        // Simulate payment processing
        setTimeout(() => {
            setPaymentStatus('success');
            setIsSimulating(false);
        }, 3000);
    }, []);

    // Reset payment
    const resetPayment = () => {
        setPaymentStatus('pending');
        setTimeLeft(15 * 60);
    };

    // Generate QR code data (simplified - in production would use real payment provider)
    const qrData = JSON.stringify({
        orderId,
        amount: advanceParam,
        venue: venue?.name,
        date: dateParam,
        time: timeParam,
    });

    // Simple QR code visualization (in production, use a real QR library)
    const generateQRPattern = () => {
        const size = 21; // QR code size
        const pattern = [];

        // Create a deterministic pattern based on orderId
        const seed = orderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        for (let i = 0; i < size * size; i++) {
            // Fixed patterns for QR code corners
            const row = Math.floor(i / size);
            const col = i % size;

            // Top-left corner
            if (row < 7 && col < 7) {
                if (row === 0 || row === 6 || col === 0 || col === 6 ||
                    (row >= 2 && row <= 4 && col >= 2 && col <= 4)) {
                    pattern.push(1);
                } else {
                    pattern.push(0);
                }
            }
            // Top-right corner
            else if (row < 7 && col >= size - 7) {
                const localCol = col - (size - 7);
                if (row === 0 || row === 6 || localCol === 0 || localCol === 6 ||
                    (row >= 2 && row <= 4 && localCol >= 2 && localCol <= 4)) {
                    pattern.push(1);
                } else {
                    pattern.push(0);
                }
            }
            // Bottom-left corner
            else if (row >= size - 7 && col < 7) {
                const localRow = row - (size - 7);
                if (localRow === 0 || localRow === 6 || col === 0 || col === 6 ||
                    (localRow >= 2 && localRow <= 4 && col >= 2 && col <= 4)) {
                    pattern.push(1);
                } else {
                    pattern.push(0);
                }
            }
            // Random pattern for the rest (seeded)
            else {
                pattern.push((seed * (i + 1) * 7) % 3 === 0 ? 1 : 0);
            }
        }

        return pattern;
    };

    const qrPattern = generateQRPattern();

    if (!venue) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                        <h1>To'yxona topilmadi</h1>
                        <Link href="/venues" className="btn btn-primary">Orqaga</Link>
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
                <div className="container">
                    <div className={styles.paymentContainer}>
                        {/* Left - QR Code */}
                        <div className={styles.qrSection}>
                            {paymentStatus === 'success' ? (
                                <div className={styles.successBox}>
                                    <div className={styles.successIcon}>✅</div>
                                    <h2>To'lov muvaffaqiyatli!</h2>
                                    <p>Sizning bronlashingiz tasdiqlandi</p>
                                    <div className={styles.orderNumber}>
                                        <span>Buyurtma raqami:</span>
                                        <strong>{orderId}</strong>
                                    </div>
                                    <div className={styles.successActions}>
                                        <Link href={`/booking/confirmation?order=${orderId}`} className="btn btn-primary btn-lg">
                                            Bronlash tafsilotlari
                                        </Link>
                                        <Link href="/" className="btn btn-outline btn-lg">
                                            Bosh sahifaga
                                        </Link>
                                    </div>
                                </div>
                            ) : paymentStatus === 'expired' ? (
                                <div className={styles.expiredBox}>
                                    <div className={styles.expiredIcon}>⏰</div>
                                    <h2>Vaqt tugadi</h2>
                                    <p>To'lov vaqti tugadi. Iltimos, qaytadan urinib ko'ring.</p>
                                    <button onClick={resetPayment} className="btn btn-primary btn-lg">
                                        Qaytadan boshlash
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.qrCard}>
                                        <div className={styles.qrHeader}>
                                            <span className={styles.paymentLogo}>💳</span>
                                            <span>QR to'lov</span>
                                        </div>

                                        {/* QR Code */}
                                        <div className={`${styles.qrCode} ${paymentStatus === 'processing' ? styles.processing : ''}`}>
                                            {paymentStatus === 'processing' ? (
                                                <div className={styles.processingOverlay}>
                                                    <div className={styles.spinner}></div>
                                                    <span>To'lov tekshirilmoqda...</span>
                                                </div>
                                            ) : null}
                                            <div className={styles.qrGrid}>
                                                {qrPattern.map((cell, i) => (
                                                    <div
                                                        key={i}
                                                        className={`${styles.qrCell} ${cell ? styles.filled : ''}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.qrAmount}>
                                            <span>To'lov miqdori:</span>
                                            <strong>{formatPrice(advanceParam)}</strong>
                                        </div>

                                        {/* Timer */}
                                        <div className={`${styles.timer} ${timeLeft < 60 ? styles.warning : ''}`}>
                                            <span>⏱️ Qolgan vaqt:</span>
                                            <strong>{formatTime(timeLeft)}</strong>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className={styles.instructions}>
                                        <h3>Qanday to'lash mumkin?</h3>
                                        <ol>
                                            <li>
                                                <span className={styles.stepNum}>1</span>
                                                <span>Telefon ilovasini oching (Click, Payme, yoki bank ilovasi)</span>
                                            </li>
                                            <li>
                                                <span className={styles.stepNum}>2</span>
                                                <span>QR kod skanerlash bo'limini tanlang</span>
                                            </li>
                                            <li>
                                                <span className={styles.stepNum}>3</span>
                                                <span>Yuqoridagi QR kodni skanerlang</span>
                                            </li>
                                            <li>
                                                <span className={styles.stepNum}>4</span>
                                                <span>To'lovni tasdiqlang</span>
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Demo button */}
                                    <button
                                        onClick={simulatePayment}
                                        disabled={isSimulating}
                                        className={`btn btn-secondary btn-lg btn-full ${styles.demoBtn}`}
                                    >
                                        {isSimulating ? 'Kutilmoqda...' : '🎮 Demo: To\'lovni tasdiqlash'}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Right - Order Summary */}
                        <div className={styles.summarySection}>
                            <div className={styles.summaryCard}>
                                <h2 className={styles.summaryTitle}>Buyurtma ma'lumotlari</h2>

                                <div className={styles.orderInfo}>
                                    <div className={styles.orderRow}>
                                        <span className={styles.orderLabel}>Buyurtma №</span>
                                        <span className={styles.orderValue}>{orderId}</span>
                                    </div>
                                </div>

                                <div className={styles.venueBox}>
                                    <span className={styles.venueIcon}>{venue.image}</span>
                                    <div>
                                        <h3>{venue.name}</h3>
                                        <p>{venue.address}</p>
                                    </div>
                                </div>

                                <div className={styles.detailsGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailIcon}>📅</span>
                                        <div>
                                            <span className={styles.detailLabel}>Sana</span>
                                            <span className={styles.detailValue}>
                                                {dateParam ? new Date(dateParam + 'T12:00:00').toLocaleDateString('uz-UZ', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                }) : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span className={styles.detailIcon}>⏰</span>
                                        <div>
                                            <span className={styles.detailLabel}>Vaqt</span>
                                            <span className={styles.detailValue}>
                                                {timeParam === 'morning' && 'Ertalab (08:00-12:00)'}
                                                {timeParam === 'afternoon' && 'Tushlik (12:00-17:00)'}
                                                {timeParam === 'evening' && 'Kechasi (18:00-23:00)'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span className={styles.detailIcon}>👥</span>
                                        <div>
                                            <span className={styles.detailLabel}>Mehmonlar</span>
                                            <span className={styles.detailValue}>{guestsParam} kishi</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.priceBreakdown}>
                                    <div className={styles.priceRow}>
                                        <span>Umumiy summa</span>
                                        <span>{formatPrice(totalParam)}</span>
                                    </div>
                                    <div className={`${styles.priceRow} ${styles.advance}`}>
                                        <span>Oldindan to'lov (30%)</span>
                                        <span>{formatPrice(advanceParam)}</span>
                                    </div>
                                    <div className={styles.priceRow}>
                                        <span>Qolgan summa (joyida)</span>
                                        <span>{formatPrice(totalParam - advanceParam)}</span>
                                    </div>
                                </div>

                                <div className={styles.paymentNote}>
                                    <span className={styles.noteIcon}>ℹ️</span>
                                    <p>
                                        Oldindan to'lov bronlashni tasdiqlaydi.
                                        Qolgan summani to'y kunida to'lashingiz mumkin.
                                    </p>
                                </div>
                            </div>

                            {/* Support */}
                            <div className={styles.supportCard}>
                                <h3>Yordam kerakmi?</h3>
                                <p>Bizga bog'laning:</p>
                                <a href="tel:+998911234567" className={styles.supportPhone}>
                                    📞 +998 91 123 45 67
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
