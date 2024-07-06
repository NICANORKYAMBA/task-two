const { body, validationResult } = require('express-validator');

const userRegistrationValidationRules = () => [
    body('firstName')
        .isString()
        .withMessage('First name must be a string')
        .notEmpty()
        .withMessage('First name is required'),
    body('lastName')
        .isString()
        .withMessage('Last name must be a string')
        .notEmpty()
        .withMessage('Last name is required'),
    body('email')
        .isEmail()
        .withMessage('Invalid email')
        .notEmpty()
        .withMessage('Email is required'),
    body('password')
        .isLength({ min: 12 })
        .withMessage('Password must be at least 12 characters long')
        .notEmpty()
        .withMessage('Password is required'),
    body('phone')
        .optional()
        .isString()
        .withMessage('Phone number must be a string'),
];

const userLoginValidationRules = () => [
    body('email')
        .isEmail()
        .withMessage('Invalid email')
        .notEmpty()
        .withMessage('Email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const orgValidationRules = () => [
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    body('description')
        .isString()
        .withMessage('Description must be a string')
        .notEmpty()
        .withMessage('Description is required'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg
            }))
        });
    }
    next();
};

module.exports = {
    userRegistrationValidationRules,
    userLoginValidationRules,
    orgValidationRules,
    validate
};