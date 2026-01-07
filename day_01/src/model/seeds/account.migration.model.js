import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    account: String,
    pass: String,
    lastName: String,
    firstName: String,
    birthday: Date,
    gender: Boolean,
    phone: String,
    isUse: Boolean,
    roleInSystem: Number,
    permanentAddress: String,
    email: String
});

// Export 1 "model" duy nhất
export default mongoose.model("accounts", accountSchema);