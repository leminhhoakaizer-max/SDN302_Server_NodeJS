import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

    const authenHeader = req.headers.authorization;// Get token từ "Header"
    console.log("AuthenHeader: ", authenHeader);
    const token = authenHeader && authenHeader.split(' ')[1];// "split" 2 phần, đầu Bearer, sau Token 

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    // Compare "Token": send(gửi lên) <=> sign(đăng kí)
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
        if (error) {
            console.error("JWT VERIFY ERROR:", error.name, error.message);
            return res.status(401).json({ message: error.message });
        }
        req.user = user;
        next();
    })

}