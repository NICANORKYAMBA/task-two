const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    try {
        const user = await registerUser({
            firstName,
            lastName,
            email,
            password,
            phone
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Registration unsuccessful',
            statusCode: 400,
        });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await loginUser({ email, password });

        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({
            status: 'Bad Request',
            message: 'Authentication failed',
            statusCode: 401,
        });
    }
}

module.exports = {
    register,
    login
};