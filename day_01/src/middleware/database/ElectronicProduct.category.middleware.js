import enhancedCategory from "../../model/category.model.js";

export const mapCategory = async (req, res, next) => {
  const { category } = req.body;

  if (!category) return next();

  if (!Array.isArray(category)) {
    return res.status(400).json({
      message: "Category must be an array of names"
    });
  }

  const categories = await enhancedCategory.find({
    name: { $in: category },
    isActive: true
  });

  if (categories.length !== category.length) {
    return res.status(404).json({
      message: "One or more categories not found"
    });
  }

  req.body.category = categories.map(cat => cat._id);
  next();
};
