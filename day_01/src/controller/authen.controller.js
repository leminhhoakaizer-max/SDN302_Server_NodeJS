import User from "../model/user.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../middleware/jwt.js";
import mssql from "mssql";
const { getTypeByValue } = mssql;

// [POST] api/authen/signup
export const signupController = async (req, res) => {
    try {
        // Destructing
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required!' });
        }

        // Check "email" exist in database? + findOne(): tìm "document" trong collection User
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exist!' });
        }

        // Phải mã hóa password trước khi "Database storage"
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User(
            {
                name: name,
                email: email,
                password: hashedPassword

            }
        );

        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        return res.status(500).json({ message: 'Iternal server error' });
    }
}

// [POST] api/authen/login
// Mục tiêu:    - Xác thực danh tính User && khởi tạo security login session
//              - Login ko tạo session server-slide -> create token-based session
//              - Check [email, password] cấp   - accessToken: ngắn hạn, dùng cho API
//                                              - refreshToken: dài hạn, làm mới accessToken
//              - Storage "login status"    - refreshToken trong Database
//                                          - refreshToken trong HTTP-only Cookie
//              - Return "user Infor" cần thiết cho Frontend
// Require: - Resquest: body bắt buộc {"email":..., "password":...}
//          - Security: - Password  - Không storage plain text
//                                  - So sánh bằng [bcrypt.compare]
//                      - Token: Sign bằng [JWT_SECRET_KEY]
//                      - Cookie    - httpOnly: true
//                                  - Không cho JS truy cập
//                      - Environment bắt buộc phải có  - JWT_SECRET_KEY
//                                                      - JWT_SECRET_KEY_REFRESH
//                                                      - Cookie parser middware
// Step:    - Nhận && validate input    - tránh request thiếu data
//                                      - tránh tấn công malformed(dị dạng/not valid) request
//          - Tìm user theo email   - Xác thực user exist
//                                  - Email là "unique key"
//          - Validate user exist   - Ko tiết lộ sự tồn tại của email 
//                                  - Tránh user enumeration(liệt kê) attack
//          - Check "JWT" configration: Tránh create token invalidate
//          - Compare password bằng "bcrypt"    - compare hashed password
//                                              - Ko bao giờ decode password
//          - Validate password: Prevent(ngăn) login fail
//          - Create JWT token  - accessToken   - ngắn hạn
//                                              - Contain(chứa): userId, role, permission
//                              - refreshToken  - dài hạn
//                                              - Dùng làm mới accessToken
//          - Storage refreshToken vào Data - Server kiểm soát(controll) session
//                                          - Enable(cho phép) revoke(thu hồi) token
//          - Lưu "refreshToken" vào "cookie"   - Bảo mật token
//                                              - Tránh XSS(Cross Site Scripting)
//                                              => phòng chống lỗ hổng bảo mật
//          - Return request successfully                    
export const loginController = async (req, res) => {
    try {
        console.log("REQUEST BODY:", req.body);

        // Get && validate input
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required!' });
        }

        // Find User from email && Validate user exist
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email OR password!' });
        }

        // Kiểm tra JWT_SECRET_KEY tồn tại
        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({ message: 'JWT_SECRET_KEY is not configured!' });
        }

        // compare: "password" dùng [bcrypt] <=>(match) "password" mà [user/client] gửi ko
        // && Validate password
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: 'Invalid password!' });
        }

        // Create JWT access token
        const accessToken = generateAccessToken(user, user.role);
        const refreshToken = generateRefreshToken(user);

        // Lưu "refreshToken" vào database
        user.refreshToken = refreshToken;
        // [new : true] => trả về document đã được cập nhật
        await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken }, { new: true });

        // Lưu "refreshToken" vào "cookie"
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // chỉ cho phép truy cập "cookie" từ "server"
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // "Signature": dùng để xác thực token, đảm bảo token ko bị thay đổi
        return res.status(200).json(
            {
                message: 'Login successfully!',
                accessToken: accessToken, // gửi về lại cho "Client"
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        );

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] api/authen/logout
// Mục tiêu - Vô hiệu hóa refreshToken đang được sử dụng
//          - Ngăn chặn User - refresh access token
//                           - sử dụng old session  
//          - "Logout"  - chỉ áp dụng cho User đang login
//                      - ko ảnh hưởng đến user khác
// Require: - Bắt buộc user phải login
//          - Token handle  - accessToken: phải valid
//                          - refeshToken: phải exist trong MongoDB && cookie
//          - Security  - refreshToken  - xác thực từ Database
//                                      - chỉ xóa đúng token đang dùng
//                      - Cookie: phải bị xóa khi logout
// Step:    - Lấy refreshToken từ cookie    - dùng cookie => single source
//                                          - Tránh fake cookie từ body
//          - Tìm User theo refreshToken    - Xác định đúng user
//                                          - Đảm bảo token chưa bị revoke(thu hồi)
//          -  Invalid refreshToken trong Database  - Ngắt khả năng refreshToken
//                                                  - Logout chỉ current user
//                                                  - ko ảnh hưởng accessToken khác
//          - clear refreshToken cookie - delete token phía client
//                                      - Ngăn send lại old token
//          - Return response successfully                                  
export const logoutController = async (req, res) => {
    try {
        // Get refreshToken từ cookie, Validate refreshToken
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ message: 'No refresh token provided' });
        }

        // Find User from refreshToken, Validate refreshToken
        const dbUser = await User.findOne({ refreshToken })
        if (!dbUser) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }
        console.log('Logout user: ', dbUser);
        console.log('user id: ', dbUser._id);

        // Invalid refreshToken trong Database
        await User.findByIdAndUpdate(dbUser._id, { refreshToken: null }, { new: true });
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Logout successfully!' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] api/authen/refresh_token
// Mục tiêu:    - Extend(gia hạn) login session && ko request user again(lần nữa)
//              - Check validate refreshToken
//              - Authentication refreshToken: Cookie, Database, JWT signature
//              - Create new accessToken && giữ user login liên tục
// Require: - Resquest  - ko cần body
//                      - bắt buộc có cookie: refreshToken=xxxx
//          - Security  - [httpOnly cookie]: Tránh XSS(Cross Site Scripting)
//                      - Verify JWT signature: Tránh fake token
//                      - Check DB token: cho phep revoke(thu hồi)
//                      - userId match: Tránh token stolen(đánh cắp)
//          - Environment   - JWT_SECRET_KEY
//                          - JWT_SECRET_KEY_REFRESH
//          - Data  - users: Storage refreshToken
//                  - cookies: Client giữ cookies
// Step:    - Lấy refreshToken từ cookie: chỉ accept(chấp nhận) token từ cookies
//          - Check token exist - Xác định user chưa login
//                              - Prevent(ngăn chặn) fake require
//          - Tìm user theo refreshToken trong DB   - Control token server-side
//                                                  - Support logout/revoke token
//          - Verify refreshToken by JWT    - Xác minh sign(chữ kí)
//                                          - Check expired token 
//          - Xử lý token invalidate && expired
//          - Check userId trong token  - Tránh token bị stolen(đánh cắp)
//                                      - Enable token thuộc user đang login
//          - create new accessToken    - Extend(gia hạn) login session
//                                      - ko cần login again 
//          - Return response successfully
export const refreshTokenController = async (req, res) => {
    // Get refreshToken from cookie && Check token exist
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        // Find user from refreshToken in DB && Validate token exist
        const dbUser = await User.findOne({ refreshToken });
        if (!dbUser) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Verify refreshToken by JWT
        jwt.verify(refreshToken, process.env.JWT_SECRET_KEY_REFRESH, (err, decoded) => {

            // Handle token invaid && expired
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Check userId in token
            if (decoded.userId !== dbUser._id.toString()) {
                return res.status(403).json({ message: 'Token user mismatch' });
            }

            // Tái tạo "accessToken" mới
            const newAccessToken = generateAccessToken(dbUser, dbUser.role);
            return res.status(200).json({ success: true, accessToken: newAccessToken });
        })

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [GET] api/authen/current_user
export const getCurrentUser = async (req, res) => {
    console.log('User from token: ', req.user);
    const userId = req.user.userId;
    try {
        // Get user Infor && loại bỏ sensitive field: password, refreshToken
        const user = await User.findById(userId).select('-password -refreshToken -__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user: user });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] api/authen/forgot_password
// Mục tiêu:    - Enable user khôi phục password, theo cơ chế Safe-Temporary(tạm thời)-Single use
//              - Verify email exist
//              - Create random(ngẫu nhiên) resetPassword token
//              - Token có short lifespan(tuổi thọ ngắn)
//              - Storage token vào Database
//              - Send link resetPassword cho user
//              - Không đổi trực tiếp password
// Require: - Request: "email" bắt buộc đã signup(đăng kí)
//          - Security  - random token && limited time(có hạn): khó đoán, tránh reuse(tái dùng)
//                      - Bảo mật ko lộ password
//                      - Storage token in DB: có thể revoke(phục hồi)
//          - Database  - "User Schema" phải có - resetPasswordToken: String
//                                              - resetPasswordExpires: Date
//          - Environment   - Email service: SendGrid, Mailgun
//                          - HTTPS: bắt buộc production(sản xuất)
//                          - Frontend reset pages: [/reset_password/:token]
// Step:    - Nhận email từ request body: Xác đinh account cần restore(khôi phục)
//          - Validate email    - Tránh request rỗng
//                              - Tránh spam attack
//          - Find user theo email  - Verify email exist
//                                  - Tránh leak(hở/rò rỉ) acccount Infor
//          - Create random resetToken: Token khó đoán && Chỉ dùng 1 lần duy nhất
//          - Tạo expiration time(thời gian hết hạn) token  - Token lifespan: 5 minutes
//                                                          - Giảm rick(rủi ro) theft(đánh cắp)
//          - Storage token && expiry(thời hạn) vào DB  - Server control token
//                                                      - Enable validate
//          - Create resetURL   - Frontend nhận token
//                              - User click để đặt lại password
//          - Send email resetPassword  - Demo process send email
//                                      - Thực tế dùng email Serive
//          - Return response successfully
export const forgotPasswordController = async (req, res) => {
    try {
        // Receive email from resquet && Validate email
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user theo email && Handle email not exist
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tạo random resetToken && expiration time for token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 5 * 60 * 1000; // 5 phút

        // Lưu token và thời gian hết hạn vào database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        // Create resetURL
        const resetUrl = `http://localhost:3000/reset_password/${resetToken}`

        // Gửi email chứa link reset password đến user
        console.log(`Reset your password using the following link: ${resetUrl}`);
        return res.status(200).json({
            message: 'Password reset link has been sent to your email: ' 
                + `${resetUrl}` });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] api/authen/reset_password
// Mục tiêu:    - Enable user đặt lại password by valid resetToken được cấp trước đó
//              - Verify valid resetToken
//              - Check token => enable not yet expired(chưa hết hạn)
//              - Hash(mã băm) new password
//              - Update password in DB
//              - Disable(vô hiệu hóa) token after dùng
//              - Complete process restore password
// Require: - Request: URL params [:token -> reset password token]
//          - Password  - Hash password: bcrypt
//                      - Ko storage plain text
//          - Database: User Schema phải có - password
//                                          - resetPasswordToken
//                                          - resetPasswordExpires
// Step:    - Get token && password từ request: Recieve resetPassword từ client
//          - Find user theo token + thời hạn   - Token must exist && not yet expired
//                                              - Prevent token reuse(tái dùng)
//          - Handle token invalid  - ko cho resetToken nếu false token
//                                  - Security account
//          - New hashPassword: Bảo mật tuyệt đối, ko lưu plain text 
//          - Update newPassword    - change old password
//                                  - Disable all old accessToken 
//          - Delete/Remove resetToken  - Token chỉ dùng 1 lần
//                                      - Prevent replay(cấp lại) attack
//          - Storage DB && return response successfully
export const resetPasswordController = async (req, res) => {
    try {
        // Get token && password from resquest
        const { token } = req.params;
        const { password } = req.body;

        // Find user from token, expiration time && Handle token invalid
        const user = await User.findOne({
            resetPasswordToken: token,
            // Check token chưa hết hạn $gt: greater than
            resetPasswordExpires: { $gt: Date.now() }
        })
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // New hashPassword
        const hashedPassword = await bcrypt.hash(password, 10);
        // Update newPassword
        user.password = hashedPassword;

        // Xóa token và thời gian hết hạn sau khi reset password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        return res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}