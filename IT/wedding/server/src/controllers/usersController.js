// Users controller
const pool = require('../config/database');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT u.id, u.full_name, u.phone, u.role, u.created_at,
             (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) as booking_count
      FROM users u
      ORDER BY u.created_at DESC
    `);

        const users = result.rows.map(u => ({
            id: u.id,
            fullName: u.full_name,
            phone: u.phone,
            role: u.role,
            bookingCount: parseInt(u.booking_count),
            createdAt: u.created_at
        }));

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT u.id, u.full_name, u.phone, u.role, u.created_at
      FROM users u
      WHERE u.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        const u = result.rows[0];

        // Get user's bookings
        const bookingsResult = await pool.query(`
      SELECT b.id, b.order_id, b.event_date, b.status, v.name as venue_name
      FROM bookings b
      JOIN venues v ON v.id = b.venue_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [id]);

        res.json({
            user: {
                id: u.id,
                fullName: u.full_name,
                phone: u.phone,
                role: u.role,
                createdAt: u.created_at
            },
            bookings: bookingsResult.rows.map(b => ({
                id: b.id,
                orderId: b.order_id,
                eventDate: b.event_date,
                status: b.status,
                venueName: b.venue_name
            }))
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, role } = req.body;

        // Only admin can change role
        if (role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Rolni faqat admin o\'zgartira oladi' });
        }

        // Users can only update themselves (unless admin)
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ error: 'Ruxsat yo\'q' });
        }

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (fullName) {
            updates.push(`full_name = $${paramIndex++}`);
            values.push(fullName);
        }

        if (role && req.user.role === 'admin') {
            updates.push(`role = $${paramIndex++}`);
            values.push(role);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Hech narsa yangilanmadi' });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        res.json({ success: true, message: 'Foydalanuvchi yangilandi' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Cannot delete yourself
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ error: "O'zingizni o'chira olmaysiz" });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({ success: true, message: "Foydalanuvchi o'chirildi" });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Xatolik yuz berdi' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
