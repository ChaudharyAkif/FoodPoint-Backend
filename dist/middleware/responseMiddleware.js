export const sendResponse = (req, res, next) => {
    res.sendMessage = (statusCode, message, data = {}) => {
        return res.status(statusCode).json({
            success: statusCode < 400,
            message,
            ...data,
        });
    };
    next();
};
