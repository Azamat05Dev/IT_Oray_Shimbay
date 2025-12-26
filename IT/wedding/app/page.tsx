'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

// Chimbay to'yxonalari - haqiqiy tashqi rasmlar bilan
const venues = [
  {
    id: 1,
    name: "Oq Saroy",
    capacity: "200-400",
    price: "180,000",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Gulistan",
    capacity: "150-300",
    price: "150,000",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    name: "Shirin To'y",
    capacity: "100-250",
    price: "160,000",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&h=400&fit=crop"
  },
  {
    id: 4,
    name: "Baxt Saroyi",
    capacity: "200-500",
    price: "200,000",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=400&fit=crop"
  },
  {
    id: 5,
    name: "Navruz",
    capacity: "150-350",
    price: "170,000",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop"
  },
  {
    id: 6,
    name: "Arzon To'yxona",
    capacity: "80-150",
    price: "140,000",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"
  },
];

const stats = [
  { value: "10+", label: "To'yxonalar" },
  { value: "500+", label: "Baxtli oilalar" },
  { value: "24/7", label: "Yordam" },
];

export default function Home() {
  return (
    <>
      <Header />

      <main className={styles.main}>
        {/* Hero Section - Kinematik video orqa fon */}
        <section className={styles.hero}>
          {/* Video Background */}
          <div className={styles.videoContainer}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className={styles.bgVideo}
              poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-on-their-wedding-day-4327-large.mp4" type="video/mp4" />
            </video>
            <div className={styles.videoOverlay}></div>
          </div>

          {/* Content */}
          <div className="container">
            <div className={styles.heroContent}>
              {/* Icon */}
              <div className={styles.heroIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              <h1 className={styles.heroTitle}>
                Chimbayda <span>baxtli to'y</span> o'tkazing
              </h1>
              <p className={styles.heroDescription}>
                Eng yaxshi to'yxonalarni tanlang, biz sizning baxtli kuningizni
                unutilmas qilamiz
              </p>

              {/* CTA Buttons */}
              <div className={styles.heroButtons}>
                <Link href="/venues" className={styles.primaryBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  To'yxonalarni ko'rish
                </Link>
                <Link href="/booking" className={styles.secondaryBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M9 16l2 2 4-4" />
                  </svg>
                  Online ariza berish
                </Link>
              </div>

              {/* Stats */}
              <div className={styles.heroStats}>
                {stats.map((stat, i) => (
                  <div key={i} className={styles.heroStat}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Scroll indicator */}
              <div className={styles.scrollIndicator}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* To'yxonalar */}
        <section className={styles.venues}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Bizning to'yxonalar</span>
              <h2 className={styles.sectionTitle}>Eng yaxshi tanlov sizni kutmoqda</h2>
              <p className={styles.sectionSubtitle}>
                Chimbay tumanidagi eng zamonaviy va qulay to'yxonalar
              </p>
            </div>

            <div className={styles.venuesGrid}>
              {venues.map((venue) => (
                <Link href={`/venues/${venue.id}`} key={venue.id} className={styles.venueCard}>
                  <div className={styles.venueImage}>
                    <img
                      src={venue.image}
                      alt={venue.name}
                    />
                    <div className={styles.venueOverlay}>
                      <span className={styles.viewBtn}>
                        Batafsil ko'rish
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className={styles.venueContent}>
                    <div className={styles.venueRating}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {venue.rating}
                    </div>
                    <h3 className={styles.venueName}>{venue.name}</h3>
                    <div className={styles.venueInfo}>
                      <span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {venue.capacity} kishi
                      </span>
                    </div>
                    <div className={styles.venuePrice}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      {venue.price} so'm/kishi
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.viewAllWrapper}>
              <Link href="/venues" className={styles.viewAllBtn}>
                Barcha to'yxonalar
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Qanday ishlaydi */}
        <section className={styles.howItWorks}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Oson va qulay</span>
              <h2 className={styles.sectionTitle}>Qanday bron qilish mumkin?</h2>
            </div>

            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3>To'yxonani tanlang</h3>
                <p>Ro'yxatdan o'zingizga yoqqanini tanlang</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepIcon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                  </svg>
                </div>
                <h3>Qo'ng'iroq qiling</h3>
                <p>Yoki formani to'ldiring, biz qo'ng'iroq qilamiz</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Tayyor!</h3>
                <p>Menejer hamma narsada yordam beradi</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.ctaVideo}>
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-newlyweds-dancing-at-their-wedding-reception-4324-large.mp4" type="video/mp4" />
            </video>
            <div className={styles.ctaOverlay}></div>
          </div>
          <div className="container">
            <div className={styles.ctaContent}>
              <div className={styles.ctaIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h2>Baxtli kuningizni biz bilan o'tkazing</h2>
              <p>Hoziroq online ariza qoldiring va bepul maslahat oling!</p>
              <Link href="/booking" className={styles.ctaButton}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M9 16l2 2 4-4" />
                </svg>
                Online ariza berish
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
