import enhancedCategory from "../model/category.model.js";
import enhancedProduct from "../model/product.model.js";

// GET [api/enhancedproducts]
// Require:	- System:	- Get all list of product
// 						- Ko filter: isActive, ko phân trang
//			- Return: All list of product
export const getAllProducts = async (req, res) => {
	try {
		const products = await enhancedProduct.find()
		console.log('Product: ', products);
		return res.status(200).json({ Products: products });
	} catch (error) {
		return res.status(500).json({ message: 'Internal seror error:', error: error.message });
	}
}

// POST [api/enhancedproducts/createProduct]
// Require:	- User đã Login
//			- Xác thực accessToken
//			- Role: Admin(khuyên dùng)
//			- category: [ArrayString + tên category]
//			- Logic:	- Check category tồn tại && isActive = true
//						- Convert category(name[]) -> categoryIds(_id[])
//						- createdBy: từ userId
export const createProduct = async (req, res) => {

	const {
		productName, productImage, description, brand, category,
		price, discount, stock, hashTag, ratings, postedDate, unit
	} = req.body;

	// Lấy account ID từ token
	const account = req.user.userId; // [req.user = user] in authen.middleware.js

	try {
		if (!productName || !productImage || !description || !brand || !category ||
			!price || !discount || !stock || !hashTag || !ratings || !postedDate || !unit
		) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		// Check category tồn tại trong DB, "$in" dùng để tìm nhiều giá trị trong mảng
		const findCategory = await enhancedCategory.find({ name: { $in: category }, isActive: true });
		if (findCategory.length === 0) {
			return res.status(400).json({ message: 'Invalid category' });
		}

		// Lấy ra mảng các categoryIds từ findCategory
		const categoryIds = findCategory.map(cat => cat._id);

		// Add "products" vào Database
		const newProduct = new enhancedProduct({
			productName, productImage, description, brand,
			category: categoryIds,
			price, discount, stock, hashTag, ratings, postedDate, unit, account,

			createdBy: req.user.userId
		})

		await newProduct.save();
		return res.status(201).json({
			message: 'Product create successfully!', product: newProduct
		});

	} catch (error) {
		return res.status(500).json({ message: 'Interal server error', error: error.message });
	}
}

// GET [api/enhancedproducts/:id], [/:id] là id "động"(dynamic)
// Require:	- Validate: MongoDB ObjectId
//			- System: Tìm Product từ productId -> return tương ứng
export const getProductById = async (req, res) => {
	const { id } = req.params;
	try {
		const product = await enhancedProduct.findById(id)

		if (!product) {
			return res.status(404).json({ message: 'Product not found!' });
		}
		return res.status(200).json({ Product: product });

	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
}

// DELETE [api/enhancedproducts/:id]
// Require:	- User đã Login
//			- Xác thực accessToken
//			- Role: Admin(khuyên dùng)
// 			- Validate: [_id] hợp lệ
//			- System: delete/remove product by _id => hard delete
export const deleteProductById = async (req, res) => {
	const { id } = req.params;
	try {
		const product = await enhancedProduct.findByIdAndDelete(id)
		console.log('Delete products: ', product);
		if (!product) {
			return res.status(404).json({ message: 'Product not found!' });
		}
		return res.status(200).json({ message: 'Product deleted successfully!' });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
}

// PUT [api/enhancedproducts/:id]
// Require:	- User đã Login
//			- Xác thực accessToken
//			- Role: Admin(khuyên dùng)
// 			- Validate: [_id] hợp lệ
//			- Logic:	- updateCategory:	- category phải tồn tại
//											- Convert category(name[]) -> categoryIds(_id[])
//						- updatedBy: từ userId
export const updateProductById = async (req, res) => {
	const { id } = req.params;

	try {
		const { productName, productImage, description, brand, category,
			price, discount, stock, hashTag, ratings, postedDate, unit } = req.body;

		const updateFields = {
			updatedBy: req.user.userId
		};

		if (productName !== undefined) updateFields.productName = productName;
		if (productImage !== undefined) updateFields.productImage = productImage;
		if (description !== undefined) updateFields.description = description;
		if (brand !== undefined) updateFields.brand = brand;
		if (price !== undefined) updateFields.price = price;
		if (discount !== undefined) updateFields.discount = discount;
		if (stock !== undefined) updateFields.stock = stock;
		if (hashTag !== undefined) updateFields.hashTag = hashTag;
		if (ratings !== undefined) updateFields.ratings = ratings;
		if (postedDate !== undefined) updateFields.postedDate = postedDate;
		if (unit !== undefined) updateFields.unit = unit;

		// Xử lí category
		if (category && Array.isArray(category)) {
			// Tìm category trong DB
			const findCategory = await enhancedCategory.find({ name: { $in: category } });
			if (findCategory.length === 0) {
				return res.status(400).json({ message: 'Category not found' });
			}

			const categoryIds = findCategory.map(cat => cat._id);

			// Thay thế hoàn toàn "category" list
			updateFields.category = categoryIds;
		}

		const updatedProduct = await enhancedProduct.findByIdAndUpdate(
			id,
			{ $set: updateFields },
			{ new: true }
		).populate('category', '_id name');

		if (!updatedProduct) {
			return res.status(404).json({ message: 'Product not found' });
		}

		return res.status(200).json({
			message: 'Product updated successfully',
			data: updatedProduct
		});

	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
}

// GET [api/enhancedproducts/search?name=abc]
// Require:	- Query Params:	- title: theo productName ko phân biệt hoa thường
//							- page: default = 1
//							- limit: default = 5
//			- System:	- Search product theo name
//						- Có phân trang
//						- Đếm tổng số Product
//			- Return: [products, currentPage, totalItems, totalPages, itemsPerPage]
export const searchProducts = async (req, res) => {
	try {
		const { title, page = 1, limit = 5 } = req.query;
		// Tìm theo tên, i không phân biệt hoa thường
		const query = title ? { productName: { $regex: title, $options: 'i' } } : {};
		// Số sản phẩm bỏ qua để đến trang hiện tại
		// Giả sử có 20 products và chỉ muốn hiên thị 5 products/trang (limit = 5)
		// Trang 1: skip = (1-1)*5 = 0 -> Hiển thị products từ 0-4
		// Trang 2: skip = (2-1)*5 = 5 -> Hiển thị products từ 5-9
		const skip = (page - 1) * limit;

		const [products, total] = await Promise.all([
			// Lấy danh sách products theo điều kiện tìm kiếm, phân trang
			enhancedProduct.find(query).skip(skip).limit(Number(limit)),
			// Đếm tổng số products
			enhancedProduct.countDocuments(query)
		])

		// Tính tổng số trang, và làm tròn lên
		// Giả sử total = 120, limit = 10 -> totalPages = 12
		const totalPages = Math.ceil(total / limit);
		return res.status(200).json({
			success: true,
			currentPage: Number(page), // Số trang hiện tại
			totalPages: totalPages, // Tổng số trang
			totalItems: total, // Tổng số sản phẩm
			itemsPerpage: Number(limit), // Số sản phẩm/trang
			products: products // Danh sách sản phẩm
		})
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
}