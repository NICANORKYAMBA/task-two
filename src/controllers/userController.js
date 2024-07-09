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
        res.status(404).json({
            status: "error",
            message: err.message,
            statusCode: 404
        });
    }
};

module.exports = {
    getUser
};