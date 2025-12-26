// Seed database with demo data
const pool = require('./database');

const seedDatabase = async () => {
    const client = await pool.connect();

    try {
        console.log('🌱 Seeding database...\n');

        // Create admin user
        const adminResult = await client.query(`
      INSERT INTO users (full_name, phone, phone_verified, role)
      VALUES ('Super Admin', '998911234567', TRUE, 'admin')
      ON CONFLICT (phone) DO NOTHING
      RETURNING id
    `);
        console.log('✅ Admin user created');

        // Create venue owner
        const ownerResult = await client.query(`
      INSERT INTO users (full_name, phone, phone_verified, role)
      VALUES ('Abdullayev Karim', '998911112233', TRUE, 'venue_owner')
      ON CONFLICT (phone) DO NOTHING
      RETURNING id
    `);
        console.log('✅ Venue owner created');

        // Venues data
        const venuesSeed = [
            { name: "Oq Saroy", slug: "oq-saroy", address: "Chimbay, Mustaqillik 15", phone: "+998 61 123 45 67", image: "🏛️", capacity_min: 50, capacity_max: 350, price_min: 180000, price_max: 220000, rating: 4.8, features: ["Wi-Fi", "Avtoturargoh", "Konditsioner", "Sahna"] },
            { name: "Gulistan", slug: "gulistan", address: "Chimbay, Navoiy 28", phone: "+998 61 234 56 78", image: "🌸", capacity_min: 30, capacity_max: 200, price_min: 150000, price_max: 180000, rating: 4.6, features: ["Bog'", "Fotostudiya", "Konditsioner"] },
            { name: "Shirin To'y", slug: "shirin-toy", address: "Chimbay, A.Navoiy 45", phone: "+998 61 345 67 89", image: "🎂", capacity_min: 40, capacity_max: 250, price_min: 160000, price_max: 200000, rating: 4.7, features: ["Shirinlik bufeti", "Bolalar xonasi", "Wi-Fi"] },
            { name: "Baxt Saroyi", slug: "baxt-saroyi", address: "Chimbay, Bog'ishamol 12", phone: "+998 61 456 78 90", image: "💐", capacity_min: 80, capacity_max: 400, price_min: 200000, price_max: 250000, rating: 4.9, features: ["VIP xona", "Avtoturargoh", "LED ekran", "Sahna"] },
            { name: "Navruz", slug: "navruz", address: "Chimbay, Xorazm 78", phone: "+998 61 567 89 01", image: "🎪", capacity_min: 60, capacity_max: 300, price_min: 170000, price_max: 210000, rating: 4.5, features: ["Milliy uslub", "Hovuz", "Bog'"] },
            { name: "Sarbon", slug: "sarbon", address: "Chimbay, Amir Temur 33", phone: "+998 61 678 90 12", image: "🏰", capacity_min: 100, capacity_max: 500, price_min: 190000, price_max: 240000, rating: 4.7, features: ["3 zal", "VIP", "Sahna", "Avtoturargoh"] },
            { name: "Yoshlik", slug: "yoshlik", address: "Chimbay, Yoshlar 56", phone: "+998 61 789 01 23", image: "🎈", capacity_min: 30, capacity_max: 180, price_min: 140000, price_max: 170000, rating: 4.4, features: ["Zamonaviy dizayn", "Wi-Fi", "Bolalar xonasi"] },
            { name: "Oila", slug: "oila", address: "Chimbay, Oila 22", phone: "+998 61 890 12 34", image: "👨‍👩‍👧‍👦", capacity_min: 40, capacity_max: 200, price_min: 155000, price_max: 185000, rating: 4.6, features: ["Oilaviy muhit", "Bog'", "Avtoturargoh"] },
            { name: "Dilkash", slug: "dilkash", address: "Chimbay, Dilkash 8", phone: "+998 61 901 23 45", image: "💎", capacity_min: 50, capacity_max: 280, price_min: 175000, price_max: 215000, rating: 4.8, features: ["Premium xizmat", "Fotograf", "LED ekran"] },
            { name: "Mehr", slug: "mehr", address: "Chimbay, Mehr 14", phone: "+998 61 012 34 56", image: "❤️", capacity_min: 60, capacity_max: 320, price_min: 165000, price_max: 205000, rating: 4.5, features: ["Romantik muhit", "Gullar bezagi", "Sahna"] }
        ];

        for (const v of venuesSeed) {
            const venueResult = await client.query(`
        INSERT INTO venues (name, slug, description, address, phone, image, capacity_min, capacity_max, price_min, price_max, rating, features)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [v.name, v.slug, `${v.name} - Chimbay tumanidagi eng yaxshi to'yxonalardan biri`, v.address, v.phone, v.image, v.capacity_min, v.capacity_max, v.price_min, v.price_max, v.rating, v.features]);

            if (venueResult.rows.length > 0) {
                const venueId = venueResult.rows[0].id;

                // Add halls
                await client.query(`
          INSERT INTO halls (venue_id, name, description, capacity, price_per_person)
          VALUES 
            ($1, 'Katta zal', 'Asosiy to''y zali', $2, $3),
            ($1, 'VIP zal', 'Maxsus mehmonlar uchun', ${Math.floor(v.capacity_max * 0.3)}, ${v.price_max + 30000})
        `, [venueId, v.capacity_max, v.price_min]);
            }
        }
        console.log('✅ Venues and halls created');

        // Add some booked dates
        const bookingDates = [
            { venue: 1, date: '2025-01-15', slot: 'evening' },
            { venue: 1, date: '2025-01-18', slot: 'evening' },
            { venue: 1, date: '2025-01-20', slot: 'afternoon' },
            { venue: 2, date: '2025-01-22', slot: 'evening' },
            { venue: 3, date: '2025-01-25', slot: 'evening' },
            { venue: 4, date: '2025-01-28', slot: 'evening' },
        ];

        for (const bd of bookingDates) {
            await client.query(`
        INSERT INTO booked_dates (venue_id, date, time_slot)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [bd.venue, bd.date, bd.slot]);
        }
        console.log('✅ Sample booked dates created');

        console.log('\n🎉 Database seeded successfully!');

    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    seedDatabase().catch(console.error);
}

module.exports = seedDatabase;
