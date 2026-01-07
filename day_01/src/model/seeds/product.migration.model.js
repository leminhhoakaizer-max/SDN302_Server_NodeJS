import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productId: String,
    productName: String,
    productImage: String,
    brief: String,
    postedDate: Date,
    typeId: Number,
    account: String,
    unit: String,
    price: Number,
    discount: Number
});

export default mongoose.model("products", productSchema);