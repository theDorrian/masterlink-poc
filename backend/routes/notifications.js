const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/notificationsController');

router.get('/', verifyToken, ctrl.getAll);
// read-all must come before /:id/read to avoid Express matching "read-all" as an id
router.patch('/read-all', verifyToken, ctrl.markAllRead);
router.patch('/:id/read', verifyToken, ctrl.markRead);

module.exports = router;
