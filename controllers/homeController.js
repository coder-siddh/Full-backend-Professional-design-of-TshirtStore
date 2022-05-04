const BigPromise = require('../middlewares/bigPromise')

// exports.home = (req,res) => {
//     res.status(200).json({
//         success : true,
//         greeting  : "Hello i am rider go wider",
//     });
// };


exports.home = BigPromise(async (req,res) => {
    //const db = await something()
    res.status(200).json({
        success : true,
        greeting  : "Hello i am rider go wider",
    });
})


exports.homeDummy = (req,res) => {
    res.status(200).json({
        success : true,
        greeting  : "Hello i am",
    });
};