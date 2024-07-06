const { getUserById } = require('../services/userService');

const getUser = async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req;

    try {
        const user = await getUserById({ id, userId });
        res.status(200).json({
            status: "success",
            message: "User retrieved successfully",
            data: user
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUser
};