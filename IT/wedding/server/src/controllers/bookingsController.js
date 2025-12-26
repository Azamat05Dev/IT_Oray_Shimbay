// Bookings controller
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Generate order ID
const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().slice(0, 4).toUpperCase();
    return `TB-${timestamp}-${random}`;
};

// Create booking
const createBooking = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            venueId,
            hallId,
            eventType,
            eventDate,
            timeSlot,
            guestCount,
            customerName,
            customerPhone,
            menuItems = [],
            decorations = [],
            notes
        } = req.body;

        // Validate required fields
        if (!venueId || !eventDate || !timeSlot || !guestCount) {
            return res.status(400).json({ error: "Majburiy maydonlar to'ldirilmagan" });
        }

        await client.query('BEGIN');

        // Check if date/time is available
        const availability = await client.query(
            'SELECT id FROM booked_dates WHERE venue_id = $1 AND date = $2 AND time_slot = $3',
            [venueId, eventDate, timeSlot]
        );

        if (availability.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Bu sana va vaqt allaqachon band' });
        }

        // Get venue pricing
        const venueResult = await client.query(
            'SELECT price_min FROM venues WHERE id = $1',
            [venueId]
        );

        if (venueResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "To'yxona topilmadi" });
        }

        const basePrice = venueResult.rows[0].price_min * guestCount;

        // Calculate total (base + menu + decorations)
        let totalAmount = basePrice;

        // Process menu items
        for (const item of menuItems) {
            const menuResult = await client.query(
                'SELECT price_per_person, price_per_table FROM menu_items WHERE id = $1',
                [item.id]
            );
            if (menuResult.rows.length > 0) {
                const m = menuResult.rows[0];
                if (m.price_per_person) {
                    totalAmount += m.price_per_person * guestCount;
                } else if (m.price_per_table) {
                    const tables = Math.ceil(guestCount / 10);
                    totalAmount += m.price_per_table * tables;
                }
            }
        }

        // Process decorations
        for (const item of decorations) {
            const decorResult = await client.query(
                'SELECT price FROM decorations WHERE id = $1',
                [item.id]
            );
            if (decorResult.rows.length > 0) {
                totalAmount += decorResult.rows[0].price;
            }
        }

        const orderId = generateOrderId();
        const advanceAmount = Math.round(totalAmount * 0.3);

        // Create booking
        const bookingResult = await client.query(`
      INSERT INTO bookings (
        order_id, venue_id, hall_id, event_type, event_date, time_slot,
        guest_count, total_amount, remaining_amount, customer_name, customer_phone, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, order_id
    `, [
            orderId, venueId, hallId, eventType, eventDate, timeSlot,
            guestCount, totalAmount, totalAmount, customerName, customerPhone, notes
        ]);

        const bookingId = bookingResult.rows[0].id;

        // Book the date
        await client.query(
            'INSERT INTO booked_dates (venue_id, booking_id, date, time_slot) VALUES ($1, $2, $3, $4)',
            [venueId, bookingId, eventDate, timeSlot]
        );

        // Save menu items
        for (const item of menuItems) {
            await client.query(
                'INSERT INTO booking_menu_items (booking_id, menu_item_id, price) VALUES ($1, $2, $3)',
                [bookingId, item.id, item.price || 0]
            );
        }

        // Save decorations
        for (const item of decorations) {
            await client.query(
                'INSERT INTO booking_decorations (booking_id, decoration_id, price) VALUES ($1, $2, $3)',
                [bookingId, item.id, item.price || 0]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Bron yaratildi',
            booking: {
                id: bookingId,
                orderId,
                totalAmount,
                advanceAmount,
                venueId,
                eventDate,
                timeSlot,
                guestCount
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    } finally {
        client.release();
    }
};

// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const isOrderId = id.startsWith('TB-');

        const result = await pool.query(`
      SELECT b.*, v.name as venue_name, v.image as venue_image, v.address as venue_address
      FROM bookings b
      JOIN venues v ON v.id = b.venue_id
      WHERE ${isOrderId ? 'b.order_id = $1' : 'b.id = $1'}
    `, [isOrderId ? id : parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Bron topilmadi' });
        }

        const b = result.rows[0];

        res.json({
            booking: {
                id: b.id,
                orderId: b.order_id,
                venue: {
                    id: b.venue_id,
                    name: b.venue_name,
                    image: b.venue_image,
                    address: b.venue_address
                },
                eventType: b.event_type,
                eventDate: b.event_date,
                timeSlot: b.time_slot,
                guestCount: b.guest_count,
                totalAmount: b.total_amount,
                paidAmount: b.paid_amount,
                remainingAmount: b.remaining_amount,
                status: b.status,
                customerName: b.customer_name,
                customerPhone: b.customer_phone,
                createdAt: b.created_at
            }
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get user bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
      SELECT b.*, v.name as venue_name, v.image as venue_image
      FROM bookings b
      JOIN venues v ON v.id = b.venue_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);

        const bookings = result.rows.map(b => ({
            id: b.id,
            orderId: b.order_id,
            venue: {
                id: b.venue_id,
                name: b.venue_name,
                image: b.venue_image
            },
            eventDate: b.event_date,
            timeSlot: b.time_slot,
            guestCount: b.guest_count,
            totalAmount: b.total_amount,
            paidAmount: b.paid_amount,
            status: b.status,
            createdAt: b.created_at
        }));

        res.json({ bookings });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Noto'g'ri holat" });
        }

        await pool.query(
            'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
            [status, id]
        );

        res.json({ success: true, message: 'Holat yangilandi' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Process payment
const processPayment = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { amount, paymentMethod = 'qr', transactionId } = req.body;

        await client.query('BEGIN');

        // Get booking
        const bookingResult = await client.query(
            'SELECT * FROM bookings WHERE id = $1 OR order_id = $1',
            [id]
        );

        if (bookingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Bron topilmadi' });
        }

        const booking = bookingResult.rows[0];

        // Create payment record
        await client.query(`
      INSERT INTO payments (booking_id, amount, payment_type, payment_method, status, transaction_id)
      VALUES ($1, $2, $3, $4, 'completed', $5)
    `, [booking.id, amount, booking.paid_amount === 0 ? 'advance' : 'final', paymentMethod, transactionId]);

        // Update booking
        const newPaidAmount = booking.paid_amount + amount;
        const newRemainingAmount = booking.total_amount - newPaidAmount;
        const newStatus = newPaidAmount > 0 ? 'confirmed' : booking.status;

        await client.query(`
      UPDATE bookings 
      SET paid_amount = $1, remaining_amount = $2, status = $3, updated_at = NOW()
      WHERE id = $4
    `, [newPaidAmount, newRemainingAmount, newStatus, booking.id]);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: "To'lov muvaffaqiyatli",
            payment: {
                amount,
                totalPaid: newPaidAmount,
                remaining: newRemainingAmount,
                status: newStatus
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Process payment error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    } finally {
        client.release();
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // Update booking status
        await client.query(
            "UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
            [id]
        );

        // Remove from booked dates
        await client.query(
            'DELETE FROM booked_dates WHERE booking_id = $1',
            [id]
        );

        await client.query('COMMIT');

        res.json({ success: true, message: 'Bron bekor qilindi' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    } finally {
        client.release();
    }
};

module.exports = {
    createBooking,
    getBookingById,
    getUserBookings,
    updateBookingStatus,
    processPayment,
    cancelBooking
};
