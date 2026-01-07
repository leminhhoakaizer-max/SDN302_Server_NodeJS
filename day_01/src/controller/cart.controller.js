import Cart from "../model/cart.model.js";
import enhancedProduct from "../model/product.model.js";

// GET [api/cart]
// Require: - User đã login
//          - Xác thực accessToken
//          - Return:   - List of product in Cart
//                      - Number of each(từng/mỗi) product
//                      - Price tại thời điểm add to Cart
//                      - totalItems
//                      - totalPrice
export const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            model: 'enhancedProduct', // trùng khớp "enhancedProduct", enhancedProductSchema
            select: `   productId
                        productName
                        description
                        productImage
                        category
                        price
                        discount
                        brand
                        stock
                        hashTag
                        ratings
                        isActive
                    `
        });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        return res.status(200).json({ data: cart });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// POST [api/cart/addCart]
// Require: - User đã login
//          - Product: phải tồn tại
//          - Add/Insert:   - cart chưa tồn tại -> Create new Cart
//                          - product đã tồn tại -> tăng quantiy
//                          - product chưa tồn tại -> thêm Item mới
//          - Logic:    - Giá (price, discount) lấy tại thời điểm thêm
//                      - Sau mỗi lần thêm: - Update totalItems
//                                          - Update totalPrice
export const addItemCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity = 1 } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        const product = await enhancedProduct.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Tính "final value" tại thời điểm thêm vào Cart
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);

        // Tìm cart của User
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Tạo mới giỏ hàng nếu chưa có
            cart = new Cart({
                user: userId,
                items: [
                    {
                        product: productId,
                        quantity: quantity,
                        price: product.price,
                        discount: product.discount || 0,
                        finalPrice: finalPrice,
                    }
                ],
                totalItems: 1,
                totalPrice: finalPrice * quantity,
            })
        } else {
            // Nếu chưa có cart, check product đã exist trong giỏ hàng chưa
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId);
            if (itemIndex > -1) {
                // Nếu product đã tồn tại, cập nhật số lượng
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].price = product.price;
                cart.items[itemIndex].discount = product.discount || 0;
                cart.items[itemIndex].finalPrice = finalPrice;
            } else {
                cart.items.push({
                    product: productId,
                    quantity: quantity,
                    price: product.price,
                    discount: product.discount || 0,
                    finalPrice: finalPrice,
                })
            }

            // Update lại [sum of value] giỏ hàng
            cart.totalItems = cart.items.length; 
            cart.totalPrice = cart.items.reduce((total, item) =>
                total + (item.finalPrice * item.quantity), 0);

        }

        await cart.save();
        res.status(200).json({ message: 'Item added to Cart successfully', data: cart });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// GET [api/cart/countCart]
// Require: - User đã login
//          - System:   - Lấy cart theo user
//                      - Đếm số product khác nhau trong Cart
export const countItemCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Set(): loại bỏ value trùng lặp => Đếm [number of uniqueProduct] trong Cart
        const uniqueProductIds = new Set(cart.items.map(item => item.product.toString()));
        const itemCount = uniqueProductIds.size();
        return res.status(200).json({ itemCount });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// DELETE [api/cart/removeCart/:productId]
// Require: - User đã login
//          - Xóa 1 product cụ thể
//          - Update:   - items
//                      - totalItems
//                      - totalPrice
export const removeItemCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove/delete item to Cart
        cart.items.splice(itemIndex, 1);

        // Update lại total
        cart.totalItems = cart.items.length;
        cart.totalPrice = cart.items.reduce((total, item) =>
            total + item.finalPrice * item.quantity, 0);

        await cart.save();
        return res.status(200).json({ message: 'Item removed to cart successfully', data: cart });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// DELETE [api/cart/clearCart]
// Require: - User login
//          - Clear all items có trong Cart
//          - Reset số lượng(number) + price
export const clearItemCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;

        await cart.save();
        return res.status(200).json({ message: 'Cart cleared successfully', data: cart });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
