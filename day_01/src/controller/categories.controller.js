import express from "express";
import enhancedCategory from "../model/category.model.js";
import slugify from "slugify";

// GET [api/enhancedcategories]
// Require: - Lấy các "category" có "isActive: true"
//          - Return: List categories
export const getAllCategories = async (req, res) => {
    try {
        // find({isActive:true}): Lấy tất cả các "category" có [isActive: true]
        const categories = await enhancedCategory.find({ isActive: true });
        return res.status(200).json({ Categories: categories });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// POST [api/enhancedcategories/createCategory]
// Require: - User đã login
//          - Xác thực accessToken
//          - Role: admin(khuyên dùng)
//          - Logic:    - slug sinh từ name ko được trùng
//                      - Gán createdBy = userId
export const createCategory = async (req, res) => {
    try {
        const { name, memo, isActive } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Generate slug from name
        // Strict: true => Loại bỏ các ký tự đặc biệt
        const slug = slugify(name, { lower: true, strict: true });

        // Check if category name or slug already exists
        const categoryExistAndSlug = await enhancedCategory.findOne({ $or: [{ name }, { slug }] });
        if (categoryExistAndSlug) {
            return res.status(400).json({ message: 'Category name or slug already exists' });
        }

        // Create new category
        const newCategory = new enhancedCategory({
            name,
            slug,
            memo,
            isActive,
            createdBy: req.user.userId
        })

        await newCategory.save();
        return res.status(201).json({ message: 'Category created successfully', data: newCategory });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// PUT [api/enhancedcategories/id/:id]
// Require: - User đã login
//          - Xác thực accessToken
//          - Role: admin(khuyên dùng)
//          - Params: [_id] hợp lệ
//          - Category: phải exist(tồn tại)
//          - Logic:    - Nếu Update name -> Update lại slug
//                      - Gán updatedBy = userId       
export const updateCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, memo, isActive } = req.body;

        const category = await enhancedCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (name) {
            const slug = slugify(name, { lower: true, strict: true });

            // check duplicate name / slug
            const existed = await enhancedCategory.findOne({
                // "$ne":  not equal(ko bằng), lấy all Object có "_id" KHÁC với "_id" đang xét
                _id: { $ne: id },
                $or: [{ name }, { slug }]
            });

            if (existed) {
                return res.status(400).json({message: 'Category name or slug already exists'});
            }

            category.name = name;
            category.slug = slug;
        }

        if (memo !== undefined) category.memo = memo;
        if (isActive !== undefined) category.isActive = isActive;

        category.updatedBy = req.user.userId;
        await category.save();

        return res.status(200).json({message: 'Category updated successfully', data: category });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// PUT [api/enhancedcategories/slug/:slug]
// Require: - User đã login
//          - Xác thực accessToken
//          - Role: admin(khuyên dùng)
//          - Params: [slug] hợp lệ
//          - Category: phải exist(tồn tại)
//          - Logic: tượng tự updateCategoryById
export const updateCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { name, memo, isActive } = req.body;

        const category = await enhancedCategory.findOne({ slug });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (name) {
            category.name = name;
            category.slug = slugify(name, { lower: true, strict: true });
        }

        if (memo != undefined) {
            category.memo = memo;
        }

        if (isActive != undefined) {
            category.isActive = isActive;
        }

        category.updatedBy = req.user.userId;

        await category.save();
        return res.status(200).json({ message: 'Category updated successfully', data: category });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// GET [api/enhancedcategories/id/:id]
// Require: - Params: [_id] MongoDB ObjectId
//          - Category: phải exist(tồn tại)
//          - isActive: true 
export const getDetailInforById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await enhancedCategory.findOne({
            _id: id,
            isActive: true
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ success: true, data: category });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// GET [api/enhancedcategories/slug/:slug]
// Require: - Params: [slug]
//          - Category: phải exist(tồn tại)
//          - isActive: true 
export const getDetailInforBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await enhancedCategory.findOne({
            slug,
            isActive: true
        })

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ success: true, data: category });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// DELETE [api/enhancedcategories/:id]
// Require: - User đã login
//          - Xác thực accessToken
//          - Role: admin(khuyên dùng)
//          - Params: [_id] hợp lệ
//          - Logic:    - ko xóa cứng
//                      - isActive: true
//                      - updatedBy: userId
export const deleteCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await enhancedCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.isActive = false;
        category.updatedBy = req.user.userId;

        await category.save();

        return res.status(200).json({
            message: 'Category deactivated successfully',
            data: category
        });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// GET [api/enhancedcategories/search]
// Require: - QueryParams:  - title: search theo name/slug
//                          - isActive: true/false
//                          - page: default = 1
//                          - limit: default = 5
//                          - sortField: createdBy | name | slug
//                          - sortOrder: ASC/DESC
//          - Logic:    - Searh ko phân biệt hoa thường
//                      - Có phân trang
//                      - Có sắp xếp
//          - Return:   - List Categories
//                      - Pagination:(currentPage, totalPages, totalItems, itemsPerPage) 
//                      - Filter info
export const searchCategory = async (req, res) => {
    try {
        const { title, page = 1, limit = 5, isActive,
            sortField = "createdAt", sortOrder = "DESC"
        } = req.query;

        // Valid sortField
        const allowedSortFields = ['createdAt', 'name', 'slug'];
        if (!allowedSortFields.includes(sortField)) {
            sortField = 'createdAt';
        }

        const query = {};

        // Lọc theo status: isActive
        if (isActive !== undefined) {
            // Chuyển chuỗi 'true' hoặc 'false' thành boolean
            query.isActive = isActive === 'true';
        }

        // Tìm kiếm theo "name" hoặc "slug"
        if (title) {
            query.$or = [
                { name: { $regex: title, $options: 'i' } },
                { slug: { $regex: title, $options: 'i' } }
            ];
        }

        // Xử lí sắp xếp
        const sortOptions = {
            // Trong MongoDB: 1 -> ascending, -1 -> descending
            [sortField]: sortOrder.toUpperCase() === 'ASC' ? 1 : -1
        };

        const skip = (page - 1) * limit;

        const [category, total] = await Promise.all([
            enhancedCategory.find(query).sort(sortOptions).skip(skip).limit(Number(limit)),
            enhancedCategory.countDocuments(query)
        ])

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            pagination: {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: Number(limit),
            },

            filters: {
                isActive: isActive,
                title: title || '',
                sortField,
                sortOrder
            },

            data: category
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};