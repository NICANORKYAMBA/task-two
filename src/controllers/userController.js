const { getUserById } = require('../services/userService');

const getUser = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const user = await getUserById({ id, userId });
        res.status(200).json({
            status: "success",
            message: "User retrieved successfully",
            data: user
        });
    } catch (err) {
        res.status(400).json({
            status: "Bad Request",
            message: 'User not found',
            statusCode: 400
        });
    }
};

module.exports = {
    getUser
};