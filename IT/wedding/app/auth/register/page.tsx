'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'info' | 'code'>('info');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
    });
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Format phone number
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
        if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
        return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 9)}`;
    };

    // Handle input change
    const handleChange = (field: string, value: string) => {
        if (field === 'phone') {
            const formatted = formatPhone(value);
            if (formatted.replace(/\s/g, '').length <= 9) {
                setFormData(prev => ({ ...prev, phone: formatted }));
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        setError('');
    };

    // Handle code input
    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        setError('');

        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    // Handle code paste
    const handleCodePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            setCode(pastedData.split(''));
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    // Submit registration
    const submitRegistration = async () => {
        if (!formData.fullName.trim()) {
            setError('Ism familiyani kiriting');
            return;
        }

        const phoneNumber = formData.phone.replace(/\s/g, '');
        if (phoneNumber.length !== 9) {
            setError("To'liq telefon raqamini kiriting");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setStep('code');
        setCountdown(60);

        // Start countdown
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Verify code
    const verifyCode = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError("Kodni to'liq kiriting");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        router.push('/dashboard');
    };

    // Resend code
    const resendCode = async () => {
        setCode(['', '', '', '', '', '']);
        setCountdown(60);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                {/* Left - Form */}
                <div className={styles.authForm}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>💒</span>
                        <span className={styles.logoText}>
                            Toy<span className={styles.logoAccent}>Bron</span>
                        </span>
                    </Link>

                    <div className={styles.formContent}>
                        <h1 className={styles.title}>
                            {step === 'info' ? "Ro'yxatdan o'tish" : 'Kodni tasdiqlang'}
                        </h1>
                        <p className={styles.subtitle}>
                            {step === 'info'
                                ? "Ma'lumotlaringizni kiriting"
                                : `+998 ${formData.phone} raqamiga yuborilgan kodni kiriting`
                            }
                        </p>

                        {step === 'info' ? (
                            <div className={styles.infoStep}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Ism va familiya</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                        placeholder="Ismingiz Familiyangiz"
                                        className={styles.input}
                                        autoFocus
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Telefon raqam</label>
                                    <div className={styles.phoneInput}>
                                        <span className={styles.phonePrefix}>+998</span>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="90 123 45 67"
                                            className={styles.phoneField}
                                        />
                                    </div>
                                </div>

                                {error && <p className={styles.error}>{error}</p>}

                                <button
                                    onClick={submitRegistration}
                                    disabled={isLoading}
                                    className={`btn btn-primary btn-lg btn-full ${styles.submitBtn}`}
                                >
                                    {isLoading ? (
                                        <span className={styles.loading}>
                                            <span className={styles.loadingDot}></span>
                                            <span className={styles.loadingDot}></span>
                                            <span className={styles.loadingDot}></span>
                                        </span>
                                    ) : (
                                        "Ro'yxatdan o'tish"
                                    )}
                                </button>

                                <p className={styles.terms}>
                                    Ro'yxatdan o'tish orqali <Link href="/terms">Foydalanish shartlari</Link> va{' '}
                                    <Link href="/privacy">Maxfiylik siyosati</Link>ga rozilik bildirasiz.
                                </p>
                            </div>
                        ) : (
                            <div className={styles.codeStep}>
                                <div className={styles.codeInputs} onPaste={handleCodePaste}>
                                    {code.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`code-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className={styles.codeInput}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                {error && <p className={styles.error}>{error}</p>}

                                <button
                                    onClick={verifyCode}
                                    disabled={isLoading || code.join('').length !== 6}
                                    className={`btn btn-primary btn-lg btn-full ${styles.submitBtn}`}
                                >
                                    {isLoading ? (
                                        <span className={styles.loading}>
                                            <span className={styles.loadingDot}></span>
                                            <span className={styles.loadingDot}></span>
                                            <span className={styles.loadingDot}></span>
                                        </span>
                                    ) : (
                                        'Tasdiqlash'
                                    )}
                                </button>

                                <div className={styles.resend}>
                                    {countdown > 0 ? (
                                        <span>Qayta yuborish: {countdown}s</span>
                                    ) : (
                                        <button onClick={resendCode} className={styles.resendBtn}>
                                            Kodni qayta yuborish
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setStep('info')}
                                    className={styles.backBtn}
                                >
                                    ← Orqaga
                                </button>
                            </div>
                        )}

                        <div className={styles.divider}>
                            <span>yoki</span>
                        </div>

                        <p className={styles.switchAuth}>
                            Hisobingiz bormi?{' '}
                            <Link href="/auth/login">Tizimga kiring</Link>
                        </p>

                        <Link href="/" className={styles.homeBtn}>
                            ← Asosiy sahifaga qaytish
                        </Link>
                    </div>
                </div>

                {/* Right - Image */}
                <div className={styles.authImage}>
                    <div className={styles.imageContent}>
                        <div className={styles.imageIcon}>🎊</div>
                        <h2>ToyBron'ga xush kelibsiz!</h2>
                        <p>Ro'yxatdan o'ting va Chimbayning eng yaxshi to'yxonalarini bron qiling</p>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <span>✅</span>
                                <span>Bepul ro'yxatdan o'tish</span>
                            </div>
                            <div className={styles.feature}>
                                <span>📱</span>
                                <span>Tez va oson autentifikatsiya</span>
                            </div>
                            <div className={styles.feature}>
                                <span>💾</span>
                                <span>Bronlaringizni saqlang</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
