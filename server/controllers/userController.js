const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// User Registration
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if username or email already exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email or username already exists!' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Send back the userId
        res.status(201).json({
            message: 'User registered successfully!',
            userId: result.insertId, // This is the generated ID
        });
    } catch (err) {
        console.error('Error during user registration:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Look for user by email or username
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        // If no user is found
        if (rows.length === 0) {
            return res.status(400).json({ message: 'No user found with the provided email or username' });
        }

        const user = rows[0];

        // Compare entered password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful!',
            token,
        });
    } catch (err) {
        console.error('Error during user login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update User Details
exports.updateUser = async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.userId;  // Assuming userId is attached to the request from the JWT token

    try {
        // Check if the email or username is being used by another user
        const [existingUser] = await db.query('SELECT * FROM users WHERE (email = ? OR username = ?) AND id != ?', [email, username, userId]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email or Username already in use' });
        }

        // If password is being updated, hash it
        let hashedPassword = undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update user details
        const updateQuery = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
        const result = await db.query(updateQuery, [username, email, hashedPassword || bcrypt.hashSync('', 10), userId]);

        return res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update user details' });
    }
};

// Deactivate User
exports.deactivateUser = async (req, res) => {
    const userId = req.userId;

    try {
        // Deactivate the user by setting is_active to false
        const result = await db.query('UPDATE users SET is_active = false WHERE id = ?', [userId]);

        return res.status(200).json({ message: 'User account deactivated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to deactivate user account' });
    }
};

