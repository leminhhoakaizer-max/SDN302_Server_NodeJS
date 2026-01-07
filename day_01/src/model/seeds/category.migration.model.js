import mongoose from "mongoose";

const catelogySchema = new mongoose.Schema({
    typeId: Number,
    categoryName: String,
    memo: String
});

export default mongoose.model("categories", catelogySchema);