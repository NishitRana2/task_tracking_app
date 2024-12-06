const express = require('express');
const { body } = require('express-validator');
const {
    createTask,
    getTasks,
    updateTask,
    toggleTaskStatus,
    deleteTask,
} = require('../controllers/taskController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authenticate);

// task creation route
router.post(
    '/create',
    [
        body('title').notEmpty().withMessage('Task title is required'),
        body('description').isString().withMessage('Description must be a string'),
    ],
    createTask
);

// Get all tasks route
router.get('/', getTasks);

// Task update route
router.put(
    '/update',
    [
        body('taskId').notEmpty().withMessage('Task ID is required'),
        body('title').optional().isString().withMessage('Title must be a string'),
        body('description').optional().isString().withMessage('Description must be a string'),
        body('deadline')
            .optional()
            .isISO8601()
            .withMessage('Deadline must be in ISO 8601 format'),
    ],
    updateTask
);

// Toggle task status route
router.put(
    '/toggle',
    [
        body('taskId').notEmpty().withMessage('Task ID is required'),
    ],
    toggleTaskStatus
);

// Delete task route
router.delete(
    '/delete',
    [
        body('taskId').notEmpty().withMessage('Task ID is required'),
    ],
    deleteTask
);

module.exports = router;
