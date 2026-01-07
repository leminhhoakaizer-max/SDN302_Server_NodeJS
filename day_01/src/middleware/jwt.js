import jwt from "jsonwebtoken";

export const generateAccessToken = (user, role) => 
    jwt.sign({ userId: user._id, role: role }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });

export const generateRefreshToken = (user) =>
    jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY_REFRESH, { expiresIn: '7d' });

// Thời gian sống của token có thể tùy chỉnh theo yêu cầu của ứng dụng
// Thường thì "Access Token" sẽ có thời hạn sống lâu hơn "Refresh Token"
// Access Token: dùng để xác thực người khi họ gửi yêu cầu đến "server"
// Refresh Token: dùng để lấy access token mới khi nó hết hạn mà ko cần phải đăng nhập lại 