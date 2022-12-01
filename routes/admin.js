const express = require('express');
const { admindashboard,monthlysales,yearlysales, getproducts, getUsers, getLogin, getaddproducts, postLogin, getlogout, postaddproducts, getCategory, postCategory, blockUsers, unblockUsers, deleteProducts, viewCategory, deletecategorys,  getupdateproduct, postupdateproduct,viewOrders,orderCanceladm, orderShipadmin, getChangePage,dailysales,orderDeliveradmin,updatecategorys,getupdatecategorys,adminsalesreport,salesreport,getBanner,getCoupens,getAddCoupen,postAddCoupon,
    addBanner,postaddBanner,deleteBanner,} = require('../controllers/adminContollers');
const router = express.Router();
const multer = require('../helpers/multer')

router.get('/admin-login', getLogin)

router.post('/admin-login', postLogin)

router.get("/logout", getlogout)


router.get('/admindashboard', admindashboard)
router.get('/admin-salesreport', adminsalesreport)

router.get('/admin-users/:id', blockUsers)

router.get('/admin-products', getproducts)

router.get('/admin-users', getUsers)

router.get('/admin-addproducts', getaddproducts)

router.post('/admin-addproducts', multer.array('image', 4), postaddproducts)

router.get('/admin-deleteProduct/:id', deleteProducts)

router.get('/admin-updateproducts/:id', getupdateproduct)

router.post('/admin-updateproducts/:id', multer.array('image', 4), postupdateproduct)

router.get('/admin-category', getCategory)

router.post('/admin-category', postCategory)

router.get('/admin-viewcategory', viewCategory)
router.get('/admin-updatecategory/:id', getupdatecategorys)

router.post('/admin-updatecategorys/:id', updatecategorys)

router.get('/admin-deletecategory/:id', deletecategorys)
router.get('/admin-orders',viewOrders)

router.get('/order-canceladmin/:id',orderCanceladm)

router.get('/order-shipped/:id',orderShipadmin)

router.get('/order-deliver/:id',orderDeliveradmin)

router.get('/changePage',getChangePage)


router.post('/admin-dailysales',dailysales)

router.post('/admin-monthlysales',monthlysales)

router.post('/admin-yearlysales',yearlysales)


router.get('/admin-viewcoupen',getCoupens)

router.get('/admin-addcoupen',getAddCoupen)

router.post('/admin-addcoupen',postAddCoupon)
router.get('/admin-banner', getBanner)

router.get('/admin-addbanner', addBanner)

router.get('/admin-deletebanner/:id', deleteBanner)


router.post('/admin-addbanner', multer.array('image'), postaddBanner)


module.exports = router;




