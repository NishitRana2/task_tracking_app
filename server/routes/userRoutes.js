const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, updateUser, deactivateUser } = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

// User registration and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Update User Details
router.put('/update', authenticate, [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6, max: 8 }).withMessage('Password must be 6-8 characters')
], updateUser);

// Deactivate User Account
router.put('/deactivate', authenticate, deactivateUser);

module.exports = router;
