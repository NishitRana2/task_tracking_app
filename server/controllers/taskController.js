const db = require('../config/db');

// Create Task
exports.createTask = async (req, res) => {
    const { title, description, deadline } = req.body;
    const userId = req.user.userId;

    try {
        const [result] = await db.query(
            'INSERT INTO tasks (user_id, title, description, deadline) VALUES (?, ?, ?, ?)',
            [userId, title, description, deadline]
        );
        res.status(201).json({ message: 'Task created successfully!', taskId: result.insertId });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Fetch User Tasks
exports.getTasks = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [tasks] = await db.query('SELECT * FROM tasks WHERE user_id = ?', [userId]);
        res.json({ tasks });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Task
exports.updateTask = async (req, res) => {
    const { taskId, title, description, deadline } = req.body;

    try {
        await db.query(
            'UPDATE tasks SET title = ?, description = ?, deadline = ? WHERE id = ?',
            [title, description, deadline, taskId]
        );
        res.json({ message: 'Task updated successfully!' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Toggle Task Completion
exports.toggleTaskStatus = (req, res) => {
    const { taskId } = req.body; // Extract task ID from the request body
    const userId = req.user.userId; // Extract user ID from the token middleware

    if (!taskId) {
        return res.status(400).json({ message: 'Task ID is required.' });
    }

    const getTaskQuery = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
    db.query(getTaskQuery, [taskId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ message: 'Server error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Task not found or not owned by the user.' });
        }

        const currentStatus = results[0].is_completed;
        const toggleQuery = 'UPDATE tasks SET is_completed = ? WHERE id = ? AND user_id = ?';

        db.query(toggleQuery, [!currentStatus, taskId, userId], (err) => {
            if (err) {
                console.error('Error toggling task status:', err);
                return res.status(500).json({ message: 'Server error.' });
            }

            return res.status(200).json({
                message: 'Task status toggled successfully!',
                is_completed: !currentStatus,
            });
        });
    });
};

// Delete Task
exports.deleteTask = async (req, res) => {
    const { taskId } = req.body;

    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
        res.json({ message: 'Task deleted successfully!' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
