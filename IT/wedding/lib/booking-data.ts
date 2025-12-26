// Menyu elementlari
export interface MenuItem {
    id: number;
    name: string;
    description: string;
    pricePerPerson?: number;
    pricePerTable?: number;
    category: 'table' | 'hot' | 'drink' | 'dessert';
    image: string;
    isPopular?: boolean;
}

// Bezaklar
export interface Decoration {
    id: number;
    name: string;
    description: string;
    price: number;
    category: 'flower' | 'light' | 'tablecloth' | 'other';
    image: string;
    colors?: string[];
}

// Stol
export interface Table {
    id: number;
    number: number;
    capacity: number;
    type: 'round' | 'rectangular' | 'oval';
    x: number;
    y: number;
    zone: 'main' | 'vip' | 'side';
}

// Dasturxon (stol ustidagi taomlar)
export const tableItems: MenuItem[] = [
    { id: 1, name: "Mevalar to'plami", description: "Olma, banan, uzum, anor, mandarin", pricePerTable: 150000, category: 'table', image: "🍎", isPopular: true },
    { id: 2, name: "Salatlar (3 xil)", description: "Olivye, vinegret, sabzavot salat", pricePerTable: 200000, category: 'table', image: "🥗" },
    { id: 3, name: "Shirinliklar", description: "Tort, pechenye, konfetlar", pricePerTable: 180000, category: 'table', image: "🍰", isPopular: true },
    { id: 4, name: "Ichimliklar", description: "Coca-Cola, Fanta, Sprite, suv", pricePerTable: 100000, category: 'table', image: "🥤" },
    { id: 5, name: "Non va patir", description: "Issiq non, patir, somsa", pricePerTable: 80000, category: 'table', image: "🍞" },
    { id: 6, name: "Qo'shimcha mevalar", description: "Ananas, kivi, shaftoli", pricePerTable: 120000, category: 'table', image: "🍍" },
    { id: 7, name: "Import shirinliklar", description: "Shokoladlar, Rafaello, Ferrero", pricePerTable: 250000, category: 'table', image: "🍫" },
    { id: 8, name: "Pishiriqlar", description: "Samsa, chuchvara, manti", pricePerTable: 160000, category: 'table', image: "🥟" },
];

// Issiq taomlar
export const hotMeals: MenuItem[] = [
    { id: 101, name: "Palov", description: "An'anaviy o'zbek palovi, go'sht bilan", pricePerPerson: 45000, category: 'hot', image: "🍚", isPopular: true },
    { id: 102, name: "Osh + Go'sht", description: "Palov va qo'shimcha go'sht porsiyasi", pricePerPerson: 65000, category: 'hot', image: "🍖", isPopular: true },
    { id: 103, name: "Qozon kabob", description: "Yumshoq qo'zichoq go'shti", pricePerPerson: 80000, category: 'hot', image: "🥩" },
    { id: 104, name: "Tandir go'sht", description: "Tandirda pishirilgan mol go'shti", pricePerPerson: 75000, category: 'hot', image: "🍗" },
    { id: 105, name: "Shashlik", description: "4 ta shashlik (qo'y, mol, tovuq, jigar)", pricePerPerson: 70000, category: 'hot', image: "🍢" },
    { id: 106, name: "Aralash menyu", description: "Palov + kabob + shashlik", pricePerPerson: 95000, category: 'hot', image: "🍱" },
    { id: 107, name: "Baliq menyu", description: "Qovurilgan baliq va sabzavotlar", pricePerPerson: 85000, category: 'hot', image: "🐟" },
    { id: 108, name: "Vegetarian", description: "Sabzavotli taomlar to'plami", pricePerPerson: 40000, category: 'hot', image: "🥬" },
];

// Bezaklar
export const decorations: Decoration[] = [
    { id: 201, name: "Atirgul bezagi", description: "Har bir stolga atirgul kompozitsiyasi", price: 300000, category: 'flower', image: "🌹", colors: ['qizil', 'pushti', 'oq'] },
    { id: 202, name: "Sakura uslubi", description: "Yapon sakura gullari", price: 450000, category: 'flower', image: "🌸", colors: ['pushti', 'oq'] },
    { id: 203, name: "Aralash gullar", description: "Turli xil gullardan kompozitsiya", price: 250000, category: 'flower', image: "💐" },
    { id: 204, name: "Shamlar", description: "Har bir stolga dekorativ shamlar", price: 150000, category: 'light', image: "🕯️" },
    { id: 205, name: "LED chiroqlar", description: "LED yoritish va dekor", price: 200000, category: 'light', image: "💡" },
    { id: 206, name: "Girlyanda", description: "Zal bo'ylab yoritish", price: 350000, category: 'light', image: "✨" },
    { id: 207, name: "Oq stol qoplama", description: "Premium oq matolar", price: 100000, category: 'tablecloth', image: "⬜", colors: ['oq'] },
    { id: 208, name: "Oltin stol qoplama", description: "Oltin rangli bezak", price: 180000, category: 'tablecloth', image: "🟨", colors: ['oltin'] },
    { id: 209, name: "Qizil stol qoplama", description: "Klassik qizil rangda", price: 150000, category: 'tablecloth', image: "🟥", colors: ['qizil'] },
    { id: 210, name: "Balonlar", description: "Zal bezagi uchun balonlar", price: 200000, category: 'other', image: "🎈" },
    { id: 211, name: "Fotozona", description: "Suratga olish uchun zona", price: 500000, category: 'other', image: "📸" },
    { id: 212, name: "Sahna bezagi", description: "Kelin-kuyov uchun sahna", price: 600000, category: 'other', image: "🎭" },
];

// Stol joylashuvi - Oq Saroy zali uchun namuna
export const sampleTableLayout: Table[] = [
    // VIP zona (sahna oldida)
    { id: 1, number: 1, capacity: 8, type: 'rectangular', x: 50, y: 10, zone: 'vip' },

    // Asosiy zona (o'rta)
    { id: 2, number: 2, capacity: 10, type: 'round', x: 15, y: 30, zone: 'main' },
    { id: 3, number: 3, capacity: 10, type: 'round', x: 35, y: 30, zone: 'main' },
    { id: 4, number: 4, capacity: 10, type: 'round', x: 55, y: 30, zone: 'main' },
    { id: 5, number: 5, capacity: 10, type: 'round', x: 75, y: 30, zone: 'main' },

    { id: 6, number: 6, capacity: 10, type: 'round', x: 15, y: 50, zone: 'main' },
    { id: 7, number: 7, capacity: 10, type: 'round', x: 35, y: 50, zone: 'main' },
    { id: 8, number: 8, capacity: 10, type: 'round', x: 55, y: 50, zone: 'main' },
    { id: 9, number: 9, capacity: 10, type: 'round', x: 75, y: 50, zone: 'main' },

    { id: 10, number: 10, capacity: 10, type: 'round', x: 15, y: 70, zone: 'main' },
    { id: 11, number: 11, capacity: 10, type: 'round', x: 35, y: 70, zone: 'main' },
    { id: 12, number: 12, capacity: 10, type: 'round', x: 55, y: 70, zone: 'main' },
    { id: 13, number: 13, capacity: 10, type: 'round', x: 75, y: 70, zone: 'main' },

    // Yon zona
    { id: 14, number: 14, capacity: 8, type: 'round', x: 5, y: 90, zone: 'side' },
    { id: 15, number: 15, capacity: 8, type: 'round', x: 25, y: 90, zone: 'side' },
    { id: 16, number: 16, capacity: 8, type: 'round', x: 45, y: 90, zone: 'side' },
    { id: 17, number: 17, capacity: 8, type: 'round', x: 65, y: 90, zone: 'side' },
    { id: 18, number: 18, capacity: 8, type: 'round', x: 85, y: 90, zone: 'side' },
];

// Marosim turlari
export const eventTypes = [
    { id: 1, name: "To'y marosimi", icon: "💒", slug: "wedding" },
    { id: 2, name: "Sunnat to'y", icon: "👶", slug: "circumcision" },
    { id: 3, name: "Beshik to'y", icon: "🍼", slug: "cradle" },
    { id: 4, name: "Tug'ilgan kun", icon: "🎂", slug: "birthday" },
    { id: 5, name: "Fotiha", icon: "🤝", slug: "engagement" },
    { id: 6, name: "Boshqa", icon: "🎉", slug: "other" },
];
