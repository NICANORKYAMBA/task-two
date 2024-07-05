const { body, validationResult } = require('express-validator');

const validationMiddleware = () => [
    body('firstName').isString().withMessage('First name must be a string'),
    body('lastName').isString().withMessage('Last name must be a string'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters long'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = {
    validationMiddleware,
    validate
};