'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    {/* Hero */}
                    <div className={styles.hero}>
                        <h1>Biz bilan bog'laning</h1>
                        <p>Savollaringiz bormi? Biz yordam berishga tayyormiz!</p>
                    </div>

                    <div className={styles.contentGrid}>
                        {/* Contact Info */}
                        <div className={styles.contactInfo}>
                            <div className={styles.infoCard}>
                                <span className={styles.infoIcon}>📍</span>
                                <h3>Manzil</h3>
                                <p>Qoraqalpog'iston Respublikasi,<br />Chimbay tumani, Mustaqillik ko'chasi 1</p>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoIcon}>📞</span>
                                <h3>Telefon</h3>
                                <p>
                                    <a href="tel:+998611234567">+998 61 123 45 67</a><br />
                                    <a href="tel:+998901234567">+998 90 123 45 67</a>
                                </p>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoIcon}>✉️</span>
                                <h3>Email</h3>
                                <p>
                                    <a href="mailto:info@toybron.uz">info@toybron.uz</a><br />
                                    <a href="mailto:support@toybron.uz">support@toybron.uz</a>
                                </p>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoIcon}>⏰</span>
                                <h3>Ish vaqti</h3>
                                <p>Dushanba - Shanba<br />09:00 - 18:00</p>
                            </div>

                            {/* Social Links */}
                            <div className={styles.socialLinks}>
                                <h3>Ijtimoiy tarmoqlar</h3>
                                <div className={styles.socialIcons}>
                                    <a href="#" className={styles.socialIcon}>📱 Telegram</a>
                                    <a href="#" className={styles.socialIcon}>📸 Instagram</a>
                                    <a href="#" className={styles.socialIcon}>📘 Facebook</a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className={styles.formCard}>
                            <h2>Xabar yuborish</h2>
                            <p>Formani to'ldiring, biz tez orada bog'lanamiz</p>

                            {submitted && (
                                <div className={styles.successMessage}>
                                    ✅ Xabaringiz muvaffaqiyatli yuborildi!
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Ismingiz *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="To'liq ismingiz"
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Telefon *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+998 90 123 45 67"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Mavzu *</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    >
                                        <option value="">Mavzuni tanlang</option>
                                        <option value="booking">Bron qilish haqida</option>
                                        <option value="venue">To'yxona haqida</option>
                                        <option value="payment">To'lov haqida</option>
                                        <option value="complaint">Shikoyat</option>
                                        <option value="other">Boshqa</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Xabar *</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Xabaringizni yozing..."
                                        rows={5}
                                        required
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn}>
                                    Yuborish →
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* FAQ */}
                    <section className={styles.faq}>
                        <h2>Ko'p so'raladigan savollar</h2>
                        <div className={styles.faqGrid}>
                            <div className={styles.faqItem}>
                                <h3>Qanday bron qilaman?</h3>
                                <p>To'yxonani tanlang, kalendarda bo'sh sanani belgilang va 7 qadamli jarayonni yakunlang.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3>To'lov qanday amalga oshiriladi?</h3>
                                <p>QR kod orqali Click yoki Payme ilovasi bilan 30% oldindan to'lov qilasiz.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3>Bronni bekor qilsam bo'ladimi?</h3>
                                <p>Ha, 7 kundan oldin bekor qilsangiz, oldindan to'lov qaytariladi.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3>Qo'llab-quvvatlash bilan qanday bog'lanaman?</h3>
                                <p>Telegram, telefon yoki email orqali 24/7 bog'lanishingiz mumkin.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
