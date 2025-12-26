// Database initialization script - creates all tables
const pool = require('./database');

const initDatabase = async () => {
    const client = await pool.connect();

    try {
        console.log('🚀 Initializing database...\n');

        // Users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        phone_verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'venue_owner', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Users table created');

        // Venues table
        await client.query(`
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        address VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        image VARCHAR(50),
        capacity_min INTEGER NOT NULL,
        capacity_max INTEGER NOT NULL,
        price_min INTEGER NOT NULL,
        price_max INTEGER NOT NULL,
        rating DECIMAL(2,1) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        features TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Venues table created');

        // Halls table
        await client.query(`
      CREATE TABLE IF NOT EXISTS halls (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        capacity INTEGER NOT NULL,
        price_per_person INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Halls table created');

        // Bookings table
        await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(20) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id),
        venue_id INTEGER REFERENCES venues(id),
        hall_id INTEGER REFERENCES halls(id),
        event_type VARCHAR(50),
        event_date DATE NOT NULL,
        time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
        guest_count INTEGER NOT NULL,
        total_amount INTEGER NOT NULL,
        paid_amount INTEGER DEFAULT 0,
        remaining_amount INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
        customer_name VARCHAR(100),
        customer_phone VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Bookings table created');

        // Booked dates table (for calendar)
        await client.query(`
      CREATE TABLE IF NOT EXISTS booked_dates (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time_slot VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(venue_id, date, time_slot)
      );
    `);
        console.log('✅ Booked dates table created');

        // Menu items table
        await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price_per_person INTEGER,
        price_per_table INTEGER,
        category VARCHAR(50) NOT NULL,
        image VARCHAR(50),
        is_popular BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Menu items table created');

        // Booking menu items (junction table)
        await client.query(`
      CREATE TABLE IF NOT EXISTS booking_menu_items (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        menu_item_id INTEGER REFERENCES menu_items(id),
        quantity INTEGER DEFAULT 1,
        price INTEGER NOT NULL
      );
    `);
        console.log('✅ Booking menu items table created');

        // Decorations table
        await client.query(`
      CREATE TABLE IF NOT EXISTS decorations (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL,
        image VARCHAR(50),
        colors TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Decorations table created');

        // Booking decorations (junction table)
        await client.query(`
      CREATE TABLE IF NOT EXISTS booking_decorations (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        decoration_id INTEGER REFERENCES decorations(id),
        price INTEGER NOT NULL
      );
    `);
        console.log('✅ Booking decorations table created');

        // Payments table
        await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('advance', 'final', 'refund')),
        payment_method VARCHAR(20) DEFAULT 'qr' CHECK (payment_method IN ('qr', 'cash', 'card')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Payments table created');

        // OTP codes table
        await client.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ OTP codes table created');

        // Create indexes
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
      CREATE INDEX IF NOT EXISTS idx_booked_dates_venue_date ON booked_dates(venue_id, date);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `);
        console.log('✅ Indexes created');

        console.log('\n🎉 Database initialized successfully!');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// Run if called directly
if (require.main === module) {
    initDatabase().catch(console.error);
}

module.exports = initDatabase;
