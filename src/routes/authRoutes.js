const express = require('express');
const { register, login } = require('../controllers/authController');
const {
    userRegistrationValidationRules,
    userLoginValidationRules,
    validate
} = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/register', userRegistrationValidationRules(), validate, register);
router.post('/login', userLoginValidationRules(), validate, login);

module.exports = router;