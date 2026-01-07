import Profile from "../model/profile.model.js";
import moment from "moment";

// GET [/api/getAllProfiles]
export const getAllProfiles = async (req, res) => {
    try {
        const profile = await Profile.find().populate("user", "name email role");

        return res.status(200).json({ message: 'Get all profile successfully', 
        total: profile.length, data: profile });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// POST [api/profile/createProfile]
export const createProfileControlller = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { birthday, gender, phone, address, avatar } = req.body;

        // Check "profile" có tồn tại chưa
        const existedProfile = await Profile.findOne({ user: userId });
        if (existedProfile) {
            return res.status(400).json({ message: 'Profile already exist' });
        }

        // Validate birthday
        const birthdayDate = moment(birthday, "DD/MM/YYYY", true);
        if (!birthdayDate.isValid()) {
            return res.status(400).json({ message: 'Birthday must be format: DD/MM/YYYY' });
        }

        // Validate phone Vietnamese
        const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Invaid Vietnamese phone number' });
        }

        const profile = await Profile.create({
            user: userId,
            birthday: birthdayDate.toDate(),
            gender, phone, address, avatar,
        });

        return res.status(201).json({ message: 'Proifle created successfully', data: profile });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// GET [api/profile/me]
export const getInforMyProfle = async (req, res) => {
    try {
        const userId = req.user.userId;
        const profile = await Profile.findOne({ user: userId })
            .populate("user", "name email role");

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        return res.status(200).json({ message: 'Get profile successfully', data: profile });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// GET [api/profile/:id]
export const getInforDetailById = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await Profile.findById(id).populate("user", "name email role");
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        return res.status(200).json({ message: 'Get profile successfully', data: profile });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// PUT [api/profile/updateProfile]
export const updateProfileControlller = async (req, res) => {
    try {
        const { id } = req.params;
        const { birthday, gender, phone, address, avatar } = req.body;

        // Check "profile" có tồn tại
        const profile = await Profile.findById(id);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Validate birthday
        if (birthday) {
            const birthdayDate = moment(birthday, "DD/MM/YYYY", true);
            if (!birthdayDate.isValid()) {
                return res.status(400).json({ message: 'Birthday must be format: DD/MM/YYYY' });
            }
            profile.birthday = birthdayDate.toDate();
        }

        // Validate phone Vietnamese
        if (phone) {
            const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({ message: 'Invaid Vietnamese phone number' });
            }
            profile.phone = phone;
        }

        // Update các fields còn lại
        if (gender != undefined) profile.gender = gender;
        if (address) profile.address = address;
        if (avatar) profile.avatar = avatar;

        await profile.save();

        return res.status(200).json({ message: 'Profile update successfully', data: profile });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
} 