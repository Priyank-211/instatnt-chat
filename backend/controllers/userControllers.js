const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const { compareSync } = require('bcryptjs');
const registerUser = asyncHandler(async (req, res) => {
    console.log("Request received");
    const { name, email, password, pic } = req.body
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Enter all the fields");
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }
    const userPayload = { name, email, password };
    if (pic) {
        userPayload.pic = pic;
    }
    const user = await User.create(userPayload);
    if (user) {
        res.status(201).json({
            _id: user._id, name: user.name, email: user.email, pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Failed to create User');
    }
});
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.status(201).json({
            _id: user._id, name: user.name, email: user.email, pic: user.pic,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
})
const allUsers = asyncHandler(async (req, res) => {
    // console.log(req.user);
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error("User not authenticated");
    }
    else {
        const keyword = req.query.search ? {
            $or:
                [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } },
                ]
        } : {};
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        console.log(users)
        res.send(users);
    }
});
const updateProfilePic = asyncHandler(async (req, res) => {
    const { pic } = req.body;
    if (!pic) {
        res.status(400);
        throw new Error("Please provide a picture");
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { pic },
        { new: true }
    );
    if (!updatedUser) {
        res.status(404);
        throw new Error("User Not Found");
    }
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        pic: updatedUser.pic,
        token: generateToken(updatedUser._id),
    });
});

module.exports = { registerUser, authUser, allUsers, updateProfilePic };

