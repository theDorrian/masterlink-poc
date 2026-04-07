const router = require('express').Router();
const ctrl = require('../controllers/jobsController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', ctrl.create);
router.get('/mine', ctrl.mine);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
