const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true , 'please provide product name'],
        trim : true,
        maxlength : [120 , 'product name should not be more than 120 character']
    },
    price : {
        type : String,
        required : [true , 'please provide product price'],
        maxlength : [6 , 'product name should not be more than 6 digits']
    },
    description : {
        type : String,
        required : [true , 'please provide product description'],
    },
    photos : [
        {
            id : {
                type : String,
                required : true
            },
            secure_url : {
                type : String,
                required : true
            }
        }
    ],
    description : {
        type : String,
        required : [true , 'please provide product description'],
    },
    category : {
        type : String,
        required : [true , 'please select category from- short-sleeves , long-sleeves , sweat-shirts , hoodies'],
        enum : {
            values : [
                'shortsleeves',
                'longsleeves',
                'sweatshirt',
                'hoodies',
            ],
            message : "please select category ONLY from- short-sleeves , long-sleeves , sweat-shirts and hoodies",
        },
    },
    //this field was updated in order videos later
    stock: {
        type: Number,
        required: [true, "please add a number in stock"],
    },
    brand : {
        type : String,
        required : [true , "please add a brand for clothing"],
    },
    rating : {
        type : Number,
        default : 0
    },
    numberOfReviews : {
        type : Number,
        default : 0
    },
    reviews : [
        {
            user : {
                type : mongoose.Schema.ObjectId,
                ref : 'User',
                required : true,
            },
            name : {
                type : String,
                required : true,
            },
            rating : {
                type : Number,
                required : true,
            },
            comment : {
                type : String,
                required : true,
            },
        }
    ],
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true,
    },
    createdAt : {
        type : Date,
        default : Date.now,     
    }
})

module.exports = mongoose.model('Product' , productSchema)