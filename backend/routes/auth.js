const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register',        ctrl.register);
router.post('/login',           ctrl.login);
router.get('/me',               verifyToken, ctrl.me);
router.put('/profile',          verifyToken, ctrl.updateProfile);
router.put('/password',         verifyToken, ctrl.changePassword);
router.post('/topup',           verifyToken, ctrl.topUp);
router.put('/payment-method',   verifyToken, ctrl.setPaymentMethod);

module.exports = router;
