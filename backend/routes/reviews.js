const router = require('express').Router();
const ctrl = require('../controllers/reviewsController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/mine', ctrl.mine);
router.post('/', ctrl.create);

module.exports = router;
