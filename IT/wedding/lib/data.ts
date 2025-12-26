// Chimbay to'yxonalari ma'lumotlari
export interface Venue {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    capacity: {
        min: number;
        max: number;
    };
    price: {
        min: number;
        max: number;
    };
    rating: number;
    reviewCount: number;
    address: string;
    phone: string;
    features: string[];
    halls: Hall[];
}

export interface Hall {
    id: number;
    name: string;
    capacity: number;
    pricePerPerson: number;
    description: string;
}

export interface TimeSlot {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

export interface BookedDate {
    date: string; // YYYY-MM-DD
    venueId: number;
    timeSlot: 'morning' | 'afternoon' | 'evening';
}

// Vaqt slotlari
export const timeSlots: TimeSlot[] = [
    { id: 'morning', name: 'Ertalab', startTime: '08:00', endTime: '12:00' },
    { id: 'afternoon', name: 'Tushlik', startTime: '12:00', endTime: '17:00' },
    { id: 'evening', name: 'Kechasi', startTime: '18:00', endTime: '23:00' },
];

// 10 ta Chimbay to'yxonalari
export const venues: Venue[] = [
    {
        id: 1,
        name: "Oq Saroy",
        slug: "oq-saroy",
        description: "Chimbayning eng zamonaviy va hashamatli to'yxonasi. Katta zal, VIP xonalar va professional xizmat.",
        image: "🏛️",
        capacity: { min: 200, max: 400 },
        price: { min: 85000, max: 120000 },
        rating: 4.8,
        reviewCount: 156,
        address: "Chimbay sh., Mustaqillik ko'chasi 45",
        phone: "+998 91 123 45 67",
        features: ["Konditsioner", "Avtoturargoh", "Sahna", "Musiqa tizimi", "VIP xona"],
        halls: [
            { id: 1, name: "Katta zal", capacity: 400, pricePerPerson: 85000, description: "Asosiy to'y zali" },
            { id: 2, name: "VIP zal", capacity: 100, pricePerPerson: 120000, description: "Eksklyuziv xizmat" },
        ]
    },
    {
        id: 2,
        name: "Gulistan",
        slug: "gulistan",
        description: "Go'zal bog' manzarasi bilan to'yxona. Ochiq va yopiq zallar mavjud.",
        image: "🌸",
        capacity: { min: 150, max: 300 },
        price: { min: 75000, max: 95000 },
        rating: 4.7,
        reviewCount: 98,
        address: "Chimbay sh., Gullar ko'chasi 12",
        phone: "+998 91 234 56 78",
        features: ["Bog'", "Ochiq maydon", "Konditsioner", "Avtoturargoh"],
        halls: [
            { id: 3, name: "Asosiy zal", capacity: 300, pricePerPerson: 75000, description: "Katta to'ylar uchun" },
            { id: 4, name: "Ochiq maydon", capacity: 200, pricePerPerson: 95000, description: "Yoz mavsumi uchun" },
        ]
    },
    {
        id: 3,
        name: "Shirin To'y",
        slug: "shirin-toy",
        description: "Oilaviy muhit va mazali taomlar bilan mashhur to'yxona.",
        image: "🎊",
        capacity: { min: 100, max: 250 },
        price: { min: 65000, max: 85000 },
        rating: 4.6,
        reviewCount: 134,
        address: "Chimbay sh., Navro'z ko'chasi 8",
        phone: "+998 91 345 67 89",
        features: ["Oilaviy muhit", "Mazali taomlar", "Konditsioner", "Bolalar xonasi"],
        halls: [
            { id: 5, name: "Asosiy zal", capacity: 250, pricePerPerson: 65000, description: "Standart to'ylar" },
        ]
    },
    {
        id: 4,
        name: "Baxt Saroyi",
        slug: "baxt-saroyi",
        description: "Chimbayning eng katta va premium to'yxonasi. VIP xizmat va zamonaviy jihozlar.",
        image: "💒",
        capacity: { min: 200, max: 500 },
        price: { min: 95000, max: 150000 },
        rating: 4.9,
        reviewCount: 203,
        address: "Chimbay sh., Baxt ko'chasi 1",
        phone: "+998 91 456 78 90",
        features: ["Premium xizmat", "2 ta zal", "VIP xona", "Sahna", "LED ekran", "Avtoturargoh"],
        halls: [
            { id: 6, name: "Oltin zal", capacity: 500, pricePerPerson: 95000, description: "Katta to'ylar uchun" },
            { id: 7, name: "Kumush zal", capacity: 200, pricePerPerson: 120000, description: "O'rtacha to'ylar" },
            { id: 8, name: "VIP zal", capacity: 80, pricePerPerson: 150000, description: "Eksklyuziv" },
        ]
    },
    {
        id: 5,
        name: "Navruz",
        slug: "navruz",
        description: "An'anaviy uslubda bezatilgan, milliy taomlar bilan mashhur to'yxona.",
        image: "🌷",
        capacity: { min: 150, max: 350 },
        price: { min: 70000, max: 90000 },
        rating: 4.5,
        reviewCount: 87,
        address: "Chimbay sh., Navruz ko'chasi 22",
        phone: "+998 91 567 89 01",
        features: ["Milliy uslub", "Milliy taomlar", "Konditsioner", "Musiqa"],
        halls: [
            { id: 9, name: "Milliy zal", capacity: 350, pricePerPerson: 70000, description: "An'anaviy uslub" },
        ]
    },
    {
        id: 6,
        name: "Arzon To'yxona",
        slug: "arzon-toyxona",
        description: "Byudjet uchun qulay narxlar bilan sifatli xizmat.",
        image: "🏠",
        capacity: { min: 80, max: 150 },
        price: { min: 50000, max: 65000 },
        rating: 4.3,
        reviewCount: 65,
        address: "Chimbay sh., Tinchlik ko'chasi 15",
        phone: "+998 91 678 90 12",
        features: ["Arzon narx", "Oddiy xizmat", "Konditsioner"],
        halls: [
            { id: 10, name: "Asosiy zal", capacity: 150, pricePerPerson: 50000, description: "Ekonom klass" },
        ]
    },
    {
        id: 7,
        name: "Meros",
        slug: "meros",
        description: "Tarixiy binoda joylashgan noyob to'yxona. Klassik uslub va yuqori sifat.",
        image: "🏰",
        capacity: { min: 200, max: 400 },
        price: { min: 80000, max: 110000 },
        rating: 4.7,
        reviewCount: 112,
        address: "Chimbay sh., Meros ko'chasi 5",
        phone: "+998 91 789 01 23",
        features: ["Klassik uslub", "Tarixiy bino", "Bog'", "Avtoturargoh", "Fotosessiya"],
        halls: [
            { id: 11, name: "Klassik zal", capacity: 400, pricePerPerson: 80000, description: "Klassik uslub" },
            { id: 12, name: "Bog' maydoni", capacity: 200, pricePerPerson: 110000, description: "Ochiq havo" },
        ]
    },
    {
        id: 8,
        name: "Xonqa",
        slug: "xonqa",
        description: "Qulay joylashuv va do'stona xizmat bilan kichik to'ylar uchun ideal.",
        image: "🎪",
        capacity: { min: 100, max: 200 },
        price: { min: 60000, max: 75000 },
        rating: 4.4,
        reviewCount: 76,
        address: "Chimbay sh., Xonqa ko'chasi 30",
        phone: "+998 91 890 12 34",
        features: ["Qulay joylashuv", "Do'stona xizmat", "Konditsioner"],
        halls: [
            { id: 13, name: "Asosiy zal", capacity: 200, pricePerPerson: 60000, description: "Kichik to'ylar" },
        ]
    },
    {
        id: 9,
        name: "Premium Hall",
        slug: "premium-hall",
        description: "Eng zamonaviy texnologiyalar va premium xizmat. Katta korporativ tadbirlar uchun ham mos.",
        image: "💎",
        capacity: { min: 300, max: 600 },
        price: { min: 100000, max: 180000 },
        rating: 4.8,
        reviewCount: 89,
        address: "Chimbay sh., Markaziy ko'cha 1",
        phone: "+998 91 901 23 45",
        features: ["Premium", "LED wall", "Konferens-zal", "VIP xona", "Karaoke", "Avtoturargoh"],
        halls: [
            { id: 14, name: "Grand Hall", capacity: 600, pricePerPerson: 100000, description: "Eng katta zal" },
            { id: 15, name: "Business Hall", capacity: 150, pricePerPerson: 150000, description: "Biznes tadbirlar" },
            { id: 16, name: "VIP Lounge", capacity: 50, pricePerPerson: 180000, description: "Eksklyuziv" },
        ]
    },
    {
        id: 10,
        name: "Chimbay Palace",
        slug: "chimbay-palace",
        description: "Chimbayning eng nufuzli va mashhur to'yxonasi. Qirollik darajasidagi xizmat.",
        image: "👑",
        capacity: { min: 250, max: 500 },
        price: { min: 110000, max: 160000 },
        rating: 4.9,
        reviewCount: 178,
        address: "Chimbay sh., Palace ko'chasi 1",
        phone: "+998 91 012 34 56",
        features: ["Qirollik xizmat", "3 ta zal", "VIP", "Spa", "Mehmonxona", "Restoran"],
        halls: [
            { id: 17, name: "Royal Hall", capacity: 500, pricePerPerson: 110000, description: "Qirollik zali" },
            { id: 18, name: "Prince Hall", capacity: 200, pricePerPerson: 140000, description: "O'rtacha to'ylar" },
            { id: 19, name: "Princess Suite", capacity: 80, pricePerPerson: 160000, description: "Maxsus marosimlar" },
        ]
    },
];

// Namuna uchun band sanalar (Demo data)
export const bookedDates: BookedDate[] = [
    // Dekabr 2024
    { date: '2024-12-21', venueId: 1, timeSlot: 'evening' },
    { date: '2024-12-21', venueId: 4, timeSlot: 'evening' },
    { date: '2024-12-22', venueId: 1, timeSlot: 'afternoon' },
    { date: '2024-12-22', venueId: 1, timeSlot: 'evening' },
    { date: '2024-12-22', venueId: 2, timeSlot: 'evening' },
    { date: '2024-12-22', venueId: 3, timeSlot: 'evening' },
    { date: '2024-12-22', venueId: 4, timeSlot: 'evening' },
    { date: '2024-12-22', venueId: 10, timeSlot: 'evening' },
    { date: '2024-12-25', venueId: 1, timeSlot: 'evening' },
    { date: '2024-12-25', venueId: 4, timeSlot: 'evening' },
    { date: '2024-12-25', venueId: 9, timeSlot: 'evening' },
    { date: '2024-12-28', venueId: 1, timeSlot: 'evening' },
    { date: '2024-12-28', venueId: 2, timeSlot: 'evening' },
    { date: '2024-12-28', venueId: 4, timeSlot: 'afternoon' },
    { date: '2024-12-28', venueId: 4, timeSlot: 'evening' },
    { date: '2024-12-28', venueId: 10, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 1, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 2, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 3, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 4, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 5, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 6, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 7, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 8, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 9, timeSlot: 'evening' },
    { date: '2024-12-29', venueId: 10, timeSlot: 'evening' },
    // Yanvar 2025
    { date: '2025-01-01', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-01', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-04', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-04', venueId: 2, timeSlot: 'evening' },
    { date: '2025-01-04', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-05', venueId: 1, timeSlot: 'afternoon' },
    { date: '2025-01-05', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-05', venueId: 3, timeSlot: 'evening' },
    { date: '2025-01-05', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-05', venueId: 10, timeSlot: 'evening' },
    { date: '2025-01-11', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-11', venueId: 2, timeSlot: 'evening' },
    { date: '2025-01-11', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-11', venueId: 7, timeSlot: 'evening' },
    { date: '2025-01-12', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-12', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-12', venueId: 9, timeSlot: 'evening' },
    { date: '2025-01-12', venueId: 10, timeSlot: 'evening' },
    { date: '2025-01-18', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-18', venueId: 2, timeSlot: 'evening' },
    { date: '2025-01-18', venueId: 3, timeSlot: 'evening' },
    { date: '2025-01-18', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-18', venueId: 5, timeSlot: 'evening' },
    { date: '2025-01-19', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-19', venueId: 4, timeSlot: 'afternoon' },
    { date: '2025-01-19', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-19', venueId: 10, timeSlot: 'evening' },
    { date: '2025-01-25', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-25', venueId: 2, timeSlot: 'evening' },
    { date: '2025-01-25', venueId: 4, timeSlot: 'evening' },
    { date: '2025-01-25', venueId: 6, timeSlot: 'evening' },
    { date: '2025-01-25', venueId: 8, timeSlot: 'evening' },
    { date: '2025-01-25', venueId: 9, timeSlot: 'evening' },
    { date: '2025-01-25', venueId: 10, timeSlot: 'evening' },
    { date: '2025-01-26', venueId: 1, timeSlot: 'evening' },
    { date: '2025-01-26', venueId: 4, timeSlot: 'evening' },
];

// Yordamchi funksiyalar
export function getVenueById(id: number): Venue | undefined {
    return venues.find(v => v.id === id);
}

export function getVenueBySlug(slug: string): Venue | undefined {
    return venues.find(v => v.slug === slug);
}

export function isDateBooked(date: string, venueId: number, timeSlot: string): boolean {
    return bookedDates.some(
        b => b.date === date && b.venueId === venueId && b.timeSlot === timeSlot
    );
}

export function getBookedSlotsForDate(date: string, venueId: number): string[] {
    return bookedDates
        .filter(b => b.date === date && b.venueId === venueId)
        .map(b => b.timeSlot);
}

export function getAvailableSlotsForDate(date: string, venueId: number): TimeSlot[] {
    const bookedSlots = getBookedSlotsForDate(date, venueId);
    return timeSlots.filter(slot => !bookedSlots.includes(slot.id));
}

export function getBookingsCountForDate(date: string): number {
    return bookedDates.filter(b => b.date === date).length;
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}
