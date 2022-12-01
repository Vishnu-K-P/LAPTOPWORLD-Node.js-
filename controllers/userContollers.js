const adminhelper = require("../helpers/adminhelper")
const userhelper = require("../helpers/userhelper")

let user
const homepage = async (req, res) => {
    user = req.session.user
    var cartcount
    if (req.session.user) {
        cartcount = await userhelper.getCartCount(req.session.user._id)
    }

     

   
   await adminhelper.ViewProduct().then(async(products) => {
        var product =[]
        for(var i=0;i<20;i++){
           product[i]= products[i]

        }


        await adminhelper.viewCategory().then(async(category) => {
            await   adminhelper.viewBanner().then(async(banner) => {


                let rec = await adminhelper.recentProducts()

                       res.render('user/index', { product, category, user,banner, cartcount,rec });
   

      
   

                })

            })
        })
        }
        
        const allhome = async (req, res) => {
            user = req.session.user
            var cartcount
            if (req.session.user) {
                cartcount = await userhelper.getCartCount(req.session.user._id)
            }
        
             
    
           
           await adminhelper.ViewallProduct().then(async(products,count) => {
            var product=products
               
        
        
                await adminhelper.viewCategory().then(async(category) => {
                    await   adminhelper.viewBanner().then(async(banner) => {
        
        
                        let rec = await adminhelper.recentProducts()
        
                               res.render('user/index', { product, category, user,banner, cartcount,rec });
           
        
              
           
        
                        })
        
                    })
                })
                }
        
    

        
        const searchhome = async (req, res) => {
            let key=req.query.search
            user = req.session.user
            var cartcount
            if (req.session.user) {
                cartcount = await userhelper.getCartCount(req.session.user._id)
            }
        
             
        
           
           await userhelper.searchInProducts(key).then(async(products) => {
                var product =[]
                for(var i=0;i<4;i++){
                   product[i]= products[i]
        
                }
        
        
                await adminhelper.viewCategory().then(async(category) => {
                    await   adminhelper.viewBanner().then(async(banner) => {
        
        
                        let rec = await adminhelper.recentProducts()
        
                               res.render('user/searchproduct', { product, category, user,banner, cartcount,rec });
           
        
              
           
        
                        })
        
                    })
                })
                }

                const cathome = async (req, res) => {
                    let Id = req.params.id
                    user = req.session.user
                    var cartcount
                    if (req.session.user) {
                        cartcount = await userhelper.getCartCount(req.session.user._id)
                    }
                
                     
                
                   
                   await userhelper.ViewcatOffProduct(Id).then(async(products) => {
                        var product =[]
                        for(var i=0;i<8;i++){
                           product[i]= products[i]
                
                        }
                
                
                        await adminhelper.viewCategory().then(async(category) => {
                            await   adminhelper.viewBanner().then(async(banner) => {
                
                
                                let rec = await adminhelper.recentProducts()
                
                                       res.render('user/searchproduct', { product, category, user,banner, cartcount,rec });
                   
                
                      
                   
                
                                })
                
                            })
                        })
                        }

                


const getLogin = (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/')
    } else {
        res.render('user/login-register', { "loginErr": req.session.loggedErrs })
        req.session.loggedErrs = false
    }

}



const postLogin = (req, res) => {

    userhelper.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.loggedIn = true;
            req.session.user = response.user
            res.redirect('/')
        } else {
            req.session.loginErrs = true;
            res.redirect('/login')
        }
    })

}



const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/')
}




const getLoginRegister = (req, res) => {
    res.render('user/login-register')
}


const getSignUp = (req, res) => {
    res.render('user/login-register')
}




const postSignup = async(req, res, next) => {

    await userhelper.doSignup(req.body).then(async(response) => {




        
        if (response.status) {


            res.redirect('/signup')
        }
        else {     
            res.redirect('/login')
        }
    })

}


const getproductsDetails = async(req, res, next) => {


   // try{
        
    
    let user = req.session.user
   
        let proId = req.params.id
        var cartcount
        if (req.session.user) {
            cartcount = await userhelper.getCartCount(req.session.user._id)
        }
        await userhelper.Viewproductdetail(proId).then(async(data) => {
       let category = await adminhelper.ViewcatOffProduct(data.category)
       let categorydet= await adminhelper.viewCategory()
   
            res.render('user/productDetails', {data,category,categorydet,user,cartcount})
    
        
        }) 
/*}catch(error){
              res.redirect('/error')

        }*/
    
        
   
   
  
}



const nodata = (req, res) => {
    res.render('404page')
}


const getcart = async (req, res, next) => {
    let subtotal;
    var cartcount
    if (req.session.user) {
        cartcount = await userhelper.getCartCount(req.session.user._id)
    }
    let products = await userhelper.viewCartProducts(req.session.user._id)
    let category = await adminhelper.viewCategory()
    let totalValue = 0;
    if (products.length > 0) {
        totalValue = await userhelper.getTotalAmount(req.session.user._id)

    }
   

    subtotal = await userhelper.getSubTotalAmount(req.session.user._id)
    for (var i = 0; i < products.length; i++) {
        products[i].subTotal = subtotal[i].suBtotal
    }

    

    if(totalValue  == 0){
        res.redirect('/emptycart')
    }
    else {

    res.render('user/cart', { products, user, totalValue,category,cartcount })


}
}



const addtocart = (req, res) => {

    userhelper.addtoCarts(req.params.id, req.session.user._id).then(() => {


        res.json({ status: true })
   
    })

}



const deleteCart = (req, res) => {
    userhelper.deleteCartItems(req.body).then((response) => {
        res.json(response)
    })

}



const getcheckout = async (req, res) => {


   let wallet = await userhelper.getUserWallet(req.session.user._id)
    let products = await userhelper.getCartProductList(req.session.user._id)


    let category = await adminhelper.viewCategory()

    var cartcount
    if (req.session.user) {
        cartcount = await userhelper.getCartCount(req.session.user._id)
    }

    let total = await userhelper.getTotalAmount(req.session.user._id)

    let address = await userhelper.viewAddress(req.session.user._id)

    let subtotal ;

    
    subtotal = await userhelper.getSubTotalAmount(req.session.user._id)
    for (var i = 0; i < products.length; i++) {
        products[i].subTotal = subtotal[i].suBtotal
    }

    user = req.session.user


 
    res.render('user/checkout', { total, user, address,subtotal,products,category,cartcount,wallet })
    }





const postcheckout = async (req, res) => {
    let products = await userhelper.getCartProductList(req.body.userId)
    let totalPrice = await userhelper.getTotalAmount(req.body.userId)
    let subtotal = await userhelper.getSubTotalAmount(req.session.user._id)
    let user =req.session.user

    let couponVerify = await adminhelper.couponVerify(req.session.user._id)


    if (couponVerify.code == req.body.couponcode ){  

      

        let discountAmount = (totalPrice * parseInt(couponVerify.value)) / 100
        let amount = totalPrice - discountAmount 


        await userhelper.placeOrder(req.body, products, amount,subtotal,user).then(async(orderId) => {

            if (req.body['payment-method'] === 'COD') {
                res.json({ codSuccess: true })

            } else if (req.body['payment-method'] === 'RAZORPAY') {
             
                if(req.body.useWallet =='1'){

                    amount = req.body.payable              
                }
              

               await userhelper.generateRazorpay(orderId, amount).then(async(response) => {
                    response.razorPay = true;  
                    res.json(response)
                })
            }

            else if (req.body['payment-method'] === 'PAYPAL') {
                let price = await userhelper.converter(amount)
                let convertPrice = parseInt(price);
                userhelper.generatePayPal(orderId, convertPrice).then((response) => {
                    response.payPal = true;
                    res.json(response)
                })
            }
            else if(req.body['payment-method'] === 'walletPay'){
                res.json({ codSuccess: true })
                
            }


        })
    

    }
    else {
 
        let description = "Paid by WalletPay"
        let debit = true;

        await userhelper.placeOrder(req.body, products, totalPrice,subtotal,user).then(async(orderId) => {

            if (req.body['payment-method'] === 'COD') {
                let resp = userhelper.cartClear(req.session.user._id)
                res.json({ codSuccess: true })

            } else if (req.body['payment-method'] === 'RAZORPAY') {

                   if(req.body.useWallet =='1'){

                    let order = {

                        orderId : orderId,
                        amount : totalPrice
                    }
                    await userhelper.setWalletHistory(user,order,description,debit)


                    totalPrice = req.body.payable              
                }

               await userhelper.generateRazorpay(orderId, totalPrice).then((response) => {
                    response.razorPay = true;
                    res.json(response)
                })
            }

            else if (req.body['payment-method'] === 'PAYPAL') {
                if(req.body.useWallet =='1'){
                    let order = {

                        orderId : orderId,
                        amount : totalPrice
                    }
                    await userhelper.setWalletHistory(user,order,description,debit)

                    totalPrice = req.body.payable              
                }
                let price = await userhelper.converter(totalPrice)
                let convertPrice = parseInt(price);
              await  userhelper.generatePayPal(orderId, convertPrice).then((response) => {
                    response.payPal = true;
                    res.json(response)
                })
            }
              
            else if(req.body['payment-method']=== 'walletPay'){
                let order = {

                    orderId : orderId,
                    amount : totalPrice
                }
                await userhelper.setWalletHistory(user,order,description,debit)      
                res.json({ codSuccess: true })
            }

         
        })

    }

}





const getOtp = (req, res) => {
    res.render('user/otp')
}



const confirmOtp = (req, res) => {
    res.render('user/confirmotp')
}



let signupData
const postOtp = (req, res) => {
    userhelper.doOTP(req.body).then((response) => {
        if (response.status) {
            signupData = response.user
            res.redirect('/confirmotp')
        }
        else {
            res.redirect('/otp')
        }
    })
}




const postresendOtp = (req, res) => {
    userhelper.doOTP(req.body).then((response) => {
        if (response.status) {
            signupData = response.user
            res.redirect('/confirmotp')
        }
        else {
            res.redirect('/otp')
        }
    })
}




const postconfirmOtp = (req, res) => {
    userhelper.doOTPconfirm(req.body, signupData).then((response) => {
        if (response.status) {
            req.session.loggedIn = true;
            req.session.user = signupData

            res.redirect('/')
        }
        else {
            res.redirect('/confirmotp',)
        }
    })
}


const getProfile = async (req, res) => {

    let user = req.session.user 
    let wallet = await userhelper.getUserWallet(req.session.user._id)
   let orders = await userhelper.getUserOrders(req.session.user._id)
    let details = await userhelper.viewAddress(req.session.user._id)
    let history = await userhelper.disWalletHistory(req.session.user._id)

   res.render('user/userProfile', { user,details,orders,wallet,history})
    

    }

   







const orderProducts = async (req, res) => {
    let user = req.session.user
    let products = await userhelper.getOrderProduct(req.params.id)
    let orders = await userhelper.getOrderSummary(req.params.id)


  
    res.render('user/orderProducts', { products, user,orders })
}






const changeproductquantity = (req, res, next) => {


    userhelper.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userhelper.getTotalAmount(req.body.user)
        response.subtotal = await userhelper.getSubTotal(req.body)


        res.json(response)

    })


}







const orderplaced = (req, res) => {

    let resp = userhelper.cartClear(req.session.user._id)
    res.render('user/orderplaced')
}




const verifyPayment = (req, res) => {
    userhelper.verifyPayment(req.body).then(() => {
        userhelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
            let removeCart = userhelper.cartClear(req.session.user._id)
            res.json({ status: true })
        })

    }).catch((err) => {
        res.json({ status: false, errMsg: "Payment Failed" })
    })
}





const addressPage = async(req, res) => {
    let user = req.session.user
   let category = await adminhelper.viewCategory()
   var cartcount
   if (req.session.user) {
       cartcount = await userhelper.getCartCount(req.session.user._id)
   }
    res.render('user/addUserAddress',{category,user,cartcount})
}



const getCheckoutAddress = async(req, res) => {
    let user = req.session.user
   let category = await adminhelper.viewCategory()
   var cartcount
   if (req.session.user) {
       cartcount = await userhelper.getCartCount(req.session.user._id)
   }

    res.render('user/postcheckadd',{user,category,cartcount})
}





const PostCheckoutAddress = (req, res) => {

    userhelper.addAddress(req.session.user._id, req.body).then((data) => {
        res.redirect('/checkout')
    })

}



const postAddressAdd = (req, res) => {

    userhelper.addAddress(req.session.user._id, req.body).then((data) => {
        res.redirect('/profile')
    })
}



const getEditAddress = (req, res) => {

    let id = req.params.id

    userhelper.getAddressEdit(id, req.session.user._id).then((data) => {

        res.render('user/editAddress', { data })
    })
}



const postEditAddress = (req, res) => {

    let userId = req.body.user;

    let Id = req.body.id

    userhelper.postAddressEdit(req.body, userId, Id).then((response) => {

        res.redirect('/profile')
    }).catch((err) => {
    })
}




const addressdelete = (req, res) => {

    let id = req.params.id

    userhelper.deleteAddress(req.session.user._id, id).then((response) => {

        res.redirect('/profile')
    })
}




const orderCancel = async(req, res) => {
    let user = req.session.user


    let description = "Order Cancelled"
  
    await userhelper.cancelOrder(req.params.id,user).then(async(response) => {


        let order = {

            orderId : response.order._id,
            amount : response.order.totalAmount
        }
        await userhelper.setWalletHistory(user,order,description)

        res.json(response)
    })
}



const getallProducts = async(req,res)=>{

    let user = req.session.user
    var cartcount
    if (req.session.user) {
        cartcount = await userhelper.getCartCount(req.session.user._id)
    }
    let count =  await adminhelper.Procount()

    let pageNum = Math.round(count)/5;
 
    let p =[];
    for(i=0;i<pageNum;i++){
 
     p[i]=i+1;              
 
    }
 

    await adminhelper.ViewProduct().then(async(product) => {
        await adminhelper.viewCategory().then((category) => {

                    res.render('user/allproducts', { product, category, user,cartcount,p })

                })

            }) 
        


}


const postCartclear = async(req,res)=>{

    let user = req.session.user._id
    await userhelper.cartClear(user).then((response)=>{

        res.json(response)
    })
}



const getEmptyCart =(req,res)=>{

    res.render('user/emptycart')
}






const getChangePageuser = async(req,res)=>{

    
    let count =  await adminhelper.Procount()
 
    let pageNum = Math.round(count)/4;
 
    let p =[];
    for(i=0;i<pageNum;i++){
 
     p[i]=i+1;
 
    }
 
 
    let startIndex = parseInt(req.query.page)
 
    let limit = parseInt(req.query.lim)

 
 
     await adminhelper.getprodlist(startIndex,limit).then((product) => {
         res.render('user/allproducts', { product,p })
     })
 
 
 }


const PostapplyCoupon = async (req, res) => {
    let user= req.session.user._id


   
    const date = new Date()

    let totalAmount = await userhelper.getTotalAmount(user)






let Total = totalAmount

    

    if (req.body.coupon == '') {
        res.json({ noCoupon: true,Total })
    } else {
        let couponResponse = await adminhelper. applyCoupon(req.body, user, date,totalAmount)
        if (couponResponse.verify) {
            let discountAmount = (totalAmount * parseInt(couponResponse.couponData.value)) / 100
            if(discountAmount>parseInt(couponResponse.couponData.maxAmount))
            discountAmount=parseInt(couponResponse.couponData.maxAmount)
            let amount = totalAmount - discountAmount
            couponResponse.discountAmount = Math.round(discountAmount)
            couponResponse.amount = Math.round(amount)
            res.json(couponResponse)
        } else {
            couponResponse.Total = totalAmount

            
            res.json(couponResponse)
        }
    }
}






const PostremoveCoupon = async (req, res) => {

    let user = req.session.user._id
    await adminhelper.removeCoupon(req.session.user._id).then(async (response) => {

        response.totalAmount = await userhelper.getTotalAmount(user)

        res.json(response)


    })
}
 




const useWallet =async(req,res)=>{
   
    let walletAmt = await userhelper.getUserWallet(user._id)
  
    await userhelper.useWallet(req.body,user,walletAmt.wallet).then((response)=>{

      
        res.json(response)
    })
}


const removeWalletUser =async (req,res)=>{
    let walletAmt = await userhelper.getUserWallet(user._id)
     
    await userhelper.removeWallet(user,req.body,walletAmt.wallet).then((response)=>{

        res.json(response)
    })
}
 





const getWishList = async(req,res)=>{


    let user = req.session.user
    let category = await adminhelper.viewCategory()
    var cartcount
    if (req.session.user) {
        cartcount = await userhelper.getCartCount(req.session.user._id)
    }

    let products = await userhelper.getWishlistProducts(user._id)
    res.render('user/wishList',{products,category,cartcount,user})
}



const getAddtoWishList=(req,res)=>{
    userhelper.addToWishlist(req.params.id,user._id).then((response)=>{
        res.json(response)
    })
}


const postRemoveWishProducts =(req,res)=>{

    userhelper.removeFromWishlist(req.body).then((response)=>{
        res.json(response)
    })
}


const ReturnOrder = async(req,res)=>{

    let user = req.session.user


    let description = "Order Returned"


    await userhelper.setWalletHistory(user,req.body,description)

    await userhelper.returnOrder(req.body,user).then((response)=>{

        res.json(response)


    })
}

 
const getInvoice = async(req,res)=>{



    let user = req.session.user
    let products = await userhelper.getOrderProduct(req.params.id)
    let orders = await userhelper.getOrderSummary(req.params.id)


  
    res.render('user/invoice', { products, user,orders })


}  

module.exports = {
    getLogin, getLoginRegister, postSignup, postLogin, getproductsDetails, homepage, nodata, getcart,
    getcheckout, getOtp, confirmOtp, postOtp, postconfirmOtp, getSignUp, addtocart, logout, getProfile,
    changeproductquantity, postcheckout, deleteCart, orderplaced, verifyPayment, orderProducts,
    addressPage, postAddressAdd, getEditAddress, postEditAddress, addressdelete,
     PostCheckoutAddress, getCheckoutAddress, orderCancel,getallProducts,postCartclear,getEmptyCart,
     postresendOtp,getChangePageuser,searchhome,PostapplyCoupon,PostremoveCoupon,useWallet,removeWalletUser,postRemoveWishProducts,getWishList,getAddtoWishList,cathome,ReturnOrder,getInvoice,allhome
}

