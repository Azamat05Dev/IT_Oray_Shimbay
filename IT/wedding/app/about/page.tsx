import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    {/* Hero */}
                    <div className={styles.hero}>
                        <h1>Biz haqimizda</h1>
                        <p>Chimbay tumanidagi to'yxonalarni online bron qilish platformasi</p>
                    </div>

                    {/* Story */}
                    <section className={styles.section}>
                        <div className={styles.storyGrid}>
                            <div className={styles.storyContent}>
                                <span className={styles.tag}>Bizning tarix</span>
                                <h2>ToyBron.uz qanday paydo bo'ldi?</h2>
                                <p>
                                    ToyBron.uz 2024 yilda Chimbay tumanida to'y marosimlarini rejalashtirish
                                    jarayonini osonlashtirish maqsadida yaratildi. Biz turmush qurayotgan
                                    juftliklar uchun eng yaxshi xizmatni taqdim etishga intilamiz.
                                </p>
                                <p>
                                    Bizning maqsadimiz - har bir oilaga o'zlarining eng muhim kunini
                                    qiyinchiliksiz va stresssiz o'tkazish imkoniyatini berish.
                                </p>
                            </div>
                            <div className={styles.storyImage}>
                                <span>💒</span>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>10</span>
                            <span className={styles.statLabel}>To'yxonalar</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>500+</span>
                            <span className={styles.statLabel}>Muvaffaqiyatli to'ylar</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>1000+</span>
                            <span className={styles.statLabel}>Baxtli mijozlar</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>4.7</span>
                            <span className={styles.statLabel}>O'rtacha reyting</span>
                        </div>
                    </section>

                    {/* Values */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.tag}>Qadriyatlar</span>
                            <h2>Nimaga ishonamiz</h2>
                        </div>
                        <div className={styles.valuesGrid}>
                            <div className={styles.valueCard}>
                                <span className={styles.valueIcon}>🎯</span>
                                <h3>Sifat</h3>
                                <p>Har bir mijozga eng yuqori sifatli xizmat ko'rsatamiz</p>
                            </div>
                            <div className={styles.valueCard}>
                                <span className={styles.valueIcon}>💡</span>
                                <h3>Innovatsiya</h3>
                                <p>Zamonaviy texnologiyalar bilan xizmat ko'rsatamiz</p>
                            </div>
                            <div className={styles.valueCard}>
                                <span className={styles.valueIcon}>🤝</span>
                                <h3>Ishonch</h3>
                                <p>Mijozlarimiz bilan shaffof munosabatlar quramiz</p>
                            </div>
                            <div className={styles.valueCard}>
                                <span className={styles.valueIcon}>❤️</span>
                                <h3>Mehribonlik</h3>
                                <p>Har bir to'y bizning yuragimizda alohida o'rin tutadi</p>
                            </div>
                        </div>
                    </section>

                    {/* Team */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.tag}>Jamoa</span>
                            <h2>Bizning jamoa</h2>
                        </div>
                        <div className={styles.teamGrid}>
                            <div className={styles.teamCard}>
                                <div className={styles.teamAvatar}>👨‍💼</div>
                                <h3>Azamat Nurullayev</h3>
                                <p>Asoschisi</p>
                            </div>
                            <div className={styles.teamCard}>
                                <div className={styles.teamAvatar}>👩‍💻</div>
                                <h3>Dilnoza Karimova</h3>
                                <p>Texnik direktor</p>
                            </div>
                            <div className={styles.teamCard}>
                                <div className={styles.teamAvatar}>👨‍🎨</div>
                                <h3>Bobur Yusupov</h3>
                                <p>Dizayner</p>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className={styles.cta}>
                        <h2>Savollaringiz bormi?</h2>
                        <p>Biz bilan bog'laning, yordam berishdan xursand bo'lamiz!</p>
                        <div className={styles.ctaButtons}>
                            <Link href="/contact" className={styles.ctaBtn}>
                                Bog'lanish →
                            </Link>
                            <Link href="/venues" className={styles.ctaBtnOutline}>
                                To'yxonalarni ko'rish
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
