const express = require('express');
const router = express.Router();

const { signup , login , logout , forgotPassword , passwordToken ,getLoggedInUserDetails , changePassword , updateUserDetails , adminAllUser , managerAllUser, admingetoneuser, adminupdateOneUserDetails, adminDeleteOneUser } = require('../controllers/userController');
const { isLoggedIn ,  customRole } = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordToken);
router.route('/userdashboard').get( isLoggedIn , getLoggedInUserDetails);
router.route('/password/update').post( isLoggedIn ,changePassword);
router.route('/password/update').post( isLoggedIn ,changePassword);
router.route('/userdashboard/update').post( isLoggedIn ,updateUserDetails);

router.route('/admin/users').get( isLoggedIn , customRole('admin') , adminAllUser);
router.route('/admin/user/:id')
.get( isLoggedIn , customRole('admin') , admingetoneuser)
.put( isLoggedIn , customRole('admin') , adminupdateOneUserDetails)
.delete( isLoggedIn , customRole('admin') , adminDeleteOneUser )

router.route('/manager/users').get( isLoggedIn , customRole('manager') , managerAllUser);

module.exports = router;
