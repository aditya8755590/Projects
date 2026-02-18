import userModel from "../models/userModel.js";

export const getUserProfile = async (req, res) => {
    try {
        // middleware sets req.body.userId; some code paths might set req.user.id — support both
        const userId = req.body?.userId || req.user?.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: "user id missing" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
