import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {

    const token = req.cookies.token;
    if (!token) {
        return res.json({ success: false, message: "unauthorized" })
    }
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.id) {
            // Initialize req.body if it doesn't exist (like on GET requests)
            req.body = req.body || {};
            req.body.userId = decoded.id;
        }
        else {
            return res.json({ success: false, message: "invalid token" })
        }
        return next();
    }
    catch (error) {
        console.log("JWT Error:", error.message);
        return res.json({ success: false, message: "invalid token" })
    }
}

export default userAuth;
