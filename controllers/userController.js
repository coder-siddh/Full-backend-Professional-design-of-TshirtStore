const User = require("../models/user")
const BigPromise = require("../middlewares/bigPromise")
const cookieToken = require("../utils/cookieToken")
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const mailHelper = require("../utils/mailHelper")
const crypto = require("crypto")


exports.signup = BigPromise(async (req,res,next) =>{

    // let result;

    if(!req.files)
    {
       return next(new Error("photo is required for signup"));
    }

    const {name , email , password} = req.body;

    if(!email || !password || !name)
    {
        return next(new Error("Name , email and password are required"));
    }

    let file = req.files.photo;

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath , {
        folder : "users",
        width : "150",
        crop : "scale",
    });

    const user = await User.create({
        name,
        email,
        password,
        photo : {
            id : result.public_id,
            secure_url : result.secure_url,
        },
    });

    cookieToken(user,res);
});

exports.login = BigPromise(async (req , res ,next) => {
    const {email , password} = req.body;
    if(!email || !password)
    {
        return next(new Error('please provide email and password'));
    }

    const user = await User.findOne({email}).select("+password")

    if(!user)
    {
        return next(new Error('Email or Password does ot match or exist'));
    }

    const isPasswordCorrect = await user.isValidatedPassword(password);

    if(!isPasswordCorrect){
        return next(new Error('You are not registered in our database'))
    }

    cookieToken(user,res);
})

exports.logout = BigPromise(async (req , res ,next) => {
    res.cookie("token" , null , {
        expires : new Date(Date.now()),
        httpOnly : true,
    });
    res.status(200).json({
        success : true,
        message : "Logout Success",
    });
})

exports.forgotPassword = BigPromise(async (req , res ,next) => {

    const {email} = req.body

    const user = await User.findOne({email})

    if(!user)
    {
        return next(new Error('Email not found as registered'))
    }

    const forgotToken = user.getForgotPasswordToken()

    await user.save({validateBeforeSave : false})

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    const message = `Copy paste this link in your url and hit enter \n\n ${myUrl}`
    
    try {
        await mailHelper({
            email : user.email,
            subject : "LCO Store - Password reset email",
            message, 
        })

        res.status(200).json({
            success : true,
            message : "Email sent Successffully",
        })
        
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({validateBeforeSave : false})

        return next(new Error(error.message));
    }
})

exports.passwordToken = BigPromise(async (req , res ,next) => {
    const token = req.params.token

    const encryToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry : {$gt : Date.now()}
    })

    if(!user)
    {
        return next(new Error('Token is invalid or Expired'))
    }

    if(req.body.password !== req.body.confirmPassword)
    {
        return next(new Error('password and confirm password are not required'))
    }

    user.password = req.body.password;

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    cookieToken(user,res);
})

exports.getLoggedInUserDetails = BigPromise(async (req , res ,next) => {
   
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success : true,
        user,
    });

});

exports.changePassword = BigPromise(async (req , res , next) => {
    
    const userId = req.user.id;

    const user = await User.findById(userId).select("+password");

    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword)

    if(!isCorrectOldPassword)
    {
        return next(new Error("old password is incorresct"));
    }

    user.password = req.body.password;

    await user.save();

    cookieToken(user , res);
})

exports.updateUserDetails = BigPromise(async (req , res , next) => {

    const newData = {
        name : req.body.name,
        email : req.body.email
    };

    if(req.files)
    {
        const user = await User.findById(req.user.id)

        const imageId = user.photo.id

        const resp = await cloudinary.v2.uploader.destroy(imageId)

        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath , {
            folder : "users",
            width : "150",
            crop : "scale",
        });

        newData.photo = {
            id : result.public_id,
            secure_url : result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id , newData , {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });

    res.status(200).json({
        success : true,
    });   
});

exports.adminAllUser = BigPromise(async (req , res , next) => {
    
    const users = await User.find();

    res.status(200).json({
        success : true,
        users,
    });
});

exports.admingetoneuser = BigPromise(async (req , res , next) => {
    
    const user = await User.findById(req.params.id);

    if(!user)
    {
        next(new Error("no user found"));
    }

    res.status(200).json({
        success : true,
        user,
    });
});

exports.adminupdateOneUserDetails = BigPromise(async (req , res , next) => {

    const newData = {
        name : req.body.name,
        email : req.body.email,
        role : req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id , newData , {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });

    res.status(200).json({
        success : true,
    });   
});

exports.adminDeleteOneUser = BigPromise(async (req , res , next) => {

    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new Error("No Such user found"));
    }
   
    const imageId = user.photo.id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success : true,
    });
});

exports.managerAllUser = BigPromise(async (req , res , next) => {
    
    const users = await User.find({role : 'user'});

    res.status(200).json({
        success : true,
        users,
    });
});