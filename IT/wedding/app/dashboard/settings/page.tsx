'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import styles from './page.module.css';

// Demo user data
const user = {
    fullName: 'Azamat Nurullayev',
    phone: '+998 90 123 45 67',
    email: 'azamat@example.com',
};

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        phone: user.phone.replace('+998 ', ''),
        email: user.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notifications, setNotifications] = useState({
        sms: true,
        email: false,
        booking: true,
        payment: true,
        promotional: false,
    });

    const [saved, setSaved] = useState(false);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Parollar mos kelmadi!");
            return;
        }
        setSaved(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar user={user} />

            <main className={styles.mainContent}>
                {/* Header */}
                <div className={styles.header}>
                    <h1>Sozlamalar</h1>
                    <p>Profil va xavfsizlik sozlamalari</p>
                </div>

                {saved && (
                    <div className={styles.successMessage}>
                        ✅ O'zgarishlar saqlandi!
                    </div>
                )}

                {/* Profile Settings */}
                <div className={styles.section}>
                    <h2>👤 Profil ma'lumotlari</h2>
                    <form onSubmit={handleSaveProfile} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>To'liq ism</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Ismingiz Familiyangiz"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Telefon raqam</label>
                                <div className={styles.phoneInput}>
                                    <span>+998</span>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="90 123 45 67"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email (ixtiyoriy)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                            />
                        </div>
                        <button type="submit" className={styles.saveBtn}>
                            Saqlash
                        </button>
                    </form>
                </div>

                {/* Password Settings */}
                <div className={styles.section}>
                    <h2>🔒 Parolni o'zgartirish</h2>
                    <form onSubmit={handleSavePassword} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Joriy parol</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Yangi parol</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Parolni tasdiqlang</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.saveBtn}>
                            Parolni o'zgartirish
                        </button>
                    </form>
                </div>

                {/* Notification Settings */}
                <div className={styles.section}>
                    <h2>🔔 Bildirishnomalar</h2>
                    <div className={styles.notificationsList}>
                        <div className={styles.notificationItem}>
                            <div className={styles.notificationInfo}>
                                <h3>SMS xabarnomalar</h3>
                                <p>Bron holati haqida SMS orqali xabar olish</p>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={notifications.sms}
                                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.notificationItem}>
                            <div className={styles.notificationInfo}>
                                <h3>Email xabarnomalar</h3>
                                <p>Email orqali xabar olish</p>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.notificationItem}>
                            <div className={styles.notificationInfo}>
                                <h3>Bron xabarlari</h3>
                                <p>Bron tasdiqlanganda va bekor qilinganda xabar</p>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={notifications.booking}
                                    onChange={(e) => setNotifications({ ...notifications, booking: e.target.checked })}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.notificationItem}>
                            <div className={styles.notificationInfo}>
                                <h3>To'lov xabarlari</h3>
                                <p>To'lov muvaffaqiyatli bo'lganda xabar</p>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={notifications.payment}
                                    onChange={(e) => setNotifications({ ...notifications, payment: e.target.checked })}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>

                        <div className={styles.notificationItem}>
                            <div className={styles.notificationInfo}>
                                <h3>Aksiya va yangiliklar</h3>
                                <p>Chegirmalar va yangiliklar haqida xabar</p>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={notifications.promotional}
                                    onChange={(e) => setNotifications({ ...notifications, promotional: e.target.checked })}
                                />
                                <span className={styles.toggleSlider}></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className={`${styles.section} ${styles.dangerZone}`}>
                    <h2>⚠️ Xavfli zona</h2>
                    <div className={styles.dangerContent}>
                        <div className={styles.dangerInfo}>
                            <h3>Hisobni o'chirish</h3>
                            <p>Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlaringiz o'chiriladi.</p>
                        </div>
                        <button className={styles.dangerBtn}>
                            Hisobni o'chirish
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
