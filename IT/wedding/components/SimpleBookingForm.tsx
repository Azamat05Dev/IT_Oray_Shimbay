'use client';

import { useState } from 'react';
import styles from './SimpleBookingForm.module.css';

interface SimpleBookingFormProps {
    venueName: string;
}

export default function SimpleBookingForm({ venueName }: SimpleBookingFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
        if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
        return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 9)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        if (formatted.replace(/\s/g, '').length <= 9) {
            setFormData({ ...formData, phone: formatted });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className={styles.successCard}>
                <span className={styles.successIcon}>✅</span>
                <h3>So'rovingiz qabul qilindi!</h3>
                <p>Menejer tez orada qo'ng'iroq qiladi va barcha savollarga javob beradi.</p>
                <a href="tel:+998611234567" className={styles.callNow}>
                    📞 Hoziroq qo'ng'iroq qilish
                </a>
            </div>
        );
    }

    return (
        <div className={styles.formCard}>
            <h2 className={styles.formTitle}>📋 Bron qilish</h2>
            <p className={styles.formSubtitle}>
                Ma'lumotlaringizni qoldiring - menejer qo'ng'iroq qiladi
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Ismingiz</label>
                    <input
                        type="text"
                        placeholder="Ism Familiya"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Telefon raqamingiz</label>
                    <div className={styles.phoneInput}>
                        <span>+998</span>
                        <input
                            type="tel"
                            placeholder="90 123 45 67"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Taxminiy sana</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className={styles.input}
                    />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                    {isLoading ? '⏳ Yuborilmoqda...' : '✅ So\'rovni yuborish'}
                </button>
            </form>

            <div className={styles.orDivider}>
                <span>yoki</span>
            </div>

            <a href="tel:+998611234567" className={styles.callBtn}>
                📞 Hoziroq qo'ng'iroq qiling
            </a>

            <p className={styles.helpText}>
                💬 WhatsApp orqali yozing: <a href="https://wa.me/998901234567">+998 90 123 45 67</a>
            </p>
        </div>
    );
}
