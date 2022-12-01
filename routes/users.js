var express = require('express');
const { getLogin, getLoginRegister, postSignup, postLogin, getproductsDetails, homepage, nodata, getcart, getcheckout, getOtp, confirmOtp, postOtp, getSignUp, postconfirmOtp, addtocart, logout, getProfile, changeproductquantity,  postcheckout, deleteCart, orderplaced, verifyPayment, orderProducts, addressPage, postAddressAdd, getEditAddress, postEditAddress, addressdelete, PostCheckoutAddress, getCheckoutAddress, orderCancel, getallProducts, postCartclear, getEmptyCart, searchhome,postresendOtp, getChangePageuser,PostapplyCoupon,PostremoveCoupon,useWallet,removeWalletUser,getWishList,getAddtoWishList,postRemoveWishProducts,cathome,ReturnOrder,getInvoice,allhome} = require('../controllers/userContollers');
const { verifyLogin } = require('../middlewares/verify');
const { verifynotLogin } = require('../middlewares/verify');
var router = express.Router();




router.get('/login', getLogin)

router.post('/login', postLogin)

router.get('/login-register',verifynotLogin, getLoginRegister)

router.get('/signup', getSignUp)

router.post('/signup', postSignup)

router.get('/user-logout', logout)

router.get('/',homepage)

router.get('/allproducts',allhome)

router.get('/productdetails/:id', getproductsDetails)

router.get('/error', nodata)

router.get('/cart', verifyLogin, getcart)

router.get('/addtocart/:id',addtocart)

router.post('/delete-cart-items',deleteCart)


router.get('/checkout',verifyLogin, getcheckout)

router.post('/checkout',postcheckout)

router.post('/checkout/usewallet',useWallet)

router.post('/checkout/removewallet',removeWalletUser)



router.get('/otp', getOtp)

router.post('/otp', postOtp)

router.get('/confirmotp', confirmOtp)

router.post('/confirmotp', postconfirmOtp)

router.get('/profile',verifyLogin, getProfile)

router.post('/change-product-quantity',changeproductquantity)

router.post('/apply-coupon',PostapplyCoupon)

router.post('/remove-coupon',PostremoveCoupon)

router.get('/ordersuccess',orderplaced)


router.get('/viewOrderProducts/:id',orderProducts)

router.post('/verify-payment',verifyPayment)


router.get('/add-address',addressPage)

router.post('/add-address',postAddressAdd)

router.get('/edit-address/:id',getEditAddress)

router.post('/edit-address',postEditAddress)

router.get('/delete-address/:id',addressdelete)

router.get('/addcheck-address',getCheckoutAddress)


router.post('/addcheck-address',PostCheckoutAddress)





router.get('/allproducts',getallProducts)

router.post('/clearcarts',postCartclear)

router.get('/emptycart',getEmptyCart)

router.get('/search',searchhome)


router.get('/wishlist',verifyLogin,getWishList)

router.get('/wishlist/add-to-wishlist/:id',getAddtoWishList)

router.post('/wishlist/remove-product',postRemoveWishProducts)



router.get('/categoryhome/:id',cathome)
router.post('/returnproduct',ReturnOrder)
router.get('/order-cancel/:id',orderCancel)
router.get('/invoice/:id',getInvoice)

module.exports = router;
