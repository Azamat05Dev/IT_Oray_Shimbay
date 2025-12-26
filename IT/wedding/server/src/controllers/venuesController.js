// Venues controller
const pool = require('../config/database');

// Get all venues
const getAllVenues = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT v.*, 
             COALESCE(
               (SELECT json_agg(json_build_object('id', h.id, 'name', h.name, 'capacity', h.capacity, 'pricePerPerson', h.price_per_person))
                FROM halls h WHERE h.venue_id = v.id), '[]'
             ) as halls
      FROM venues v
      WHERE is_active = TRUE
      ORDER BY rating DESC, review_count DESC
    `);

        const venues = result.rows.map(v => ({
            id: v.id,
            name: v.name,
            slug: v.slug,
            description: v.description,
            address: v.address,
            phone: v.phone,
            image: v.image,
            capacity: { min: v.capacity_min, max: v.capacity_max },
            price: { min: v.price_min, max: v.price_max },
            rating: parseFloat(v.rating),
            reviewCount: v.review_count,
            features: v.features || [],
            halls: v.halls
        }));

        res.json({ venues });
    } catch (error) {
        console.error('Get venues error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get venue by ID or slug
const getVenueById = async (req, res) => {
    try {
        const { idOrSlug } = req.params;

        const isId = !isNaN(parseInt(idOrSlug));

        const result = await pool.query(`
      SELECT v.*, 
             COALESCE(
               (SELECT json_agg(json_build_object('id', h.id, 'name', h.name, 'description', h.description, 'capacity', h.capacity, 'pricePerPerson', h.price_per_person))
                FROM halls h WHERE h.venue_id = v.id), '[]'
             ) as halls
      FROM venues v
      WHERE ${isId ? 'v.id = $1' : 'v.slug = $1'} AND is_active = TRUE
    `, [isId ? parseInt(idOrSlug) : idOrSlug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "To'yxona topilmadi" });
        }

        const v = result.rows[0];

        res.json({
            venue: {
                id: v.id,
                name: v.name,
                slug: v.slug,
                description: v.description,
                address: v.address,
                phone: v.phone,
                image: v.image,
                capacity: { min: v.capacity_min, max: v.capacity_max },
                price: { min: v.price_min, max: v.price_max },
                rating: parseFloat(v.rating),
                reviewCount: v.review_count,
                features: v.features || [],
                halls: v.halls
            }
        });
    } catch (error) {
        console.error('Get venue error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get venue availability (calendar)
const getVenueAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        const targetMonth = parseInt(month) || new Date().getMonth() + 1;
        const targetYear = parseInt(year) || new Date().getFullYear();

        // Get booked dates for the month
        const result = await pool.query(`
      SELECT date, time_slot
      FROM booked_dates
      WHERE venue_id = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
    `, [id, targetMonth, targetYear]);

        // Group by date
        const bookedDates: Record<string, string[]> = {};
        result.rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0];
            if (!bookedDates[dateStr]) {
                bookedDates[dateStr] = [];
            }
            bookedDates[dateStr].push(row.time_slot);
        });

        res.json({
            venueId: parseInt(id),
            month: targetMonth,
            year: targetYear,
            bookedDates
        });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get venue halls
const getVenueHalls = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT id, name, description, capacity, price_per_person
      FROM halls
      WHERE venue_id = $1
      ORDER BY capacity DESC
    `, [id]);

        const halls = result.rows.map(h => ({
            id: h.id,
            name: h.name,
            description: h.description,
            capacity: h.capacity,
            pricePerPerson: h.price_per_person
        }));

        res.json({ halls });
    } catch (error) {
        console.error('Get halls error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get venue menu
const getVenueMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT id, name, description, price_per_person, price_per_table, category, image, is_popular
      FROM menu_items
      WHERE venue_id = $1 AND is_active = TRUE
      ORDER BY category, is_popular DESC
    `, [id]);

        const menuItems = result.rows.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            pricePerPerson: m.price_per_person,
            pricePerTable: m.price_per_table,
            category: m.category,
            image: m.image,
            isPopular: m.is_popular
        }));

        res.json({ menuItems });
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get venue decorations
const getVenueDecorations = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT id, name, description, price, category, image, colors
      FROM decorations
      WHERE venue_id = $1 AND is_active = TRUE
      ORDER BY category, price
    `, [id]);

        const decorations = result.rows.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            price: d.price,
            category: d.category,
            image: d.image,
            colors: d.colors
        }));

        res.json({ decorations });
    } catch (error) {
        console.error('Get decorations error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

module.exports = {
    getAllVenues,
    getVenueById,
    getVenueAvailability,
    getVenueHalls,
    getVenueMenu,
    getVenueDecorations
};
