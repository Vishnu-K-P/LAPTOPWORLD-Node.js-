const db = require('../config/connection')
const collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId
const otp = require('../config/otp')
const { ObjectId } = require('mongodb')
const client = require('twilio')(otp.accountSID, otp.authToken)
const Razorpay = require('razorpay')
const paypal = require('paypal-rest-sdk')
const moment = require("moment")

const CC = require("currency-converter-lt");



var instance = new Razorpay({
    key_id: 'rzp_test_YCQI11i8t8Mxdo',
    key_secret: 'u461lMkrPyYwhfhuGMuAif3r',
  });
  
paypal.configure({
    'mode': 'sandbox', 
    'client_id': 'AVjj7k4h-vjJytZFYWUE3ObpwGow2LvizZhc1hcnKUpxSG94pTOj_JGoAvnNGVvc768IjdOJh84bc4hN',
    'client_secret':'ECTFcQdE_uXctlZQ2z8LSp6hOY9EtQ8JnHVI6JcWop-y11fInM2gqxiuxuFADtIilbfCrQKbLSxRyKFs',
});


module.exports = {

  

    doSignup: (userData) => {

        let response = {}
        return new Promise(async (resolve, reject) => {
            let email = await db.get().collection(collection.USERCOLLECTION).findOne({ email: userData.email })


            if (email) {
                response.status = true;
                resolve(response)

            }

            else {

               
                if(userData.referral === ""){

                    userData.wallet = 0;
                    userData.state = true
                    userData.password = await bcrypt.hash(userData.password, 10)
                    userData.walletHistory = []

                    userData.referral = '' + (Math.floor(Math.random() * 90000) + 10000)

                    db.get().collection(collection.USERCOLLECTION).insertOne(userData).then(async (data) => {

                        resolve(data.insertedId)

                    })
                    
                }
                else {

                


                let referralCheck = await db.get().collection(collection.USERCOLLECTION).findOne({ referral: userData.referral })

                if (referralCheck) {


               

                    let refer = await db.get().collection(collection.USERCOLLECTION).updateOne({ referral: userData.referral },
                        {
                            $set: {
                                wallet: referralCheck.wallet + 100
                            }
                        }
                    )
                    userData.wallet = 100;
                    userData.state = true
                    userData.password = await bcrypt.hash(userData.password, 10)
                    userData.walletHistory = []
                    userData.referral = '' + (Math.floor(Math.random() * 90000) + 10000)

                    db.get().collection(collection.USERCOLLECTION).insertOne(userData).then(async (data) => {

                     

                        resolve(data.insertedId)

                    })
                    resolve({ status: false })
                }
                else {
                    resolve({ status: true })

                }
            }


        }
        })
    


    },

  

    doLogin: (userData) => {
        let response = {}
        userData.state = true
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USERCOLLECTION).findOne({ $and: [{ email: userData.email }, { state: userData.state }] })


            if (user) {
                bcrypt.compare(userData.Password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.user.status = true
                        response.status = true;
                        resolve(response)
                    }
                    else {

                        resolve({ status: false })
                    }
                })

            }
            else {
                response.status = false
                resolve(response)
            }

        })


    },



    viewProducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCTCOLLECTION).find().toArray()
            resolve(product)
        })
    },


    

    Viewproductdetail: (proId, error) => {
        return new Promise(async (resolve, reject) => {

            try {

                let data = await db.get().collection(collection.PRODUCTCOLLECTION).findOne({ _id: objectId(proId) })
                resolve(data)
            } catch (error) {
                resolve(error)
            }



        })

    },







    doOTP: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USERCOLLECTION).findOne({ phone: userData.phone })

            if (user) {
                response.status = true
                response.user = user
                client.verify.services(otp.serviceID)
                    .verifications
                    .create({ to: `+91${userData.phone}`, channel: 'sms' })
                    .then((verification) => {

                    });
                resolve(response)

            }
            else {
                response.status = false;
                resolve(response)



            }
        })
    },



    doOTPconfirm: (confirmOtp, userData) => {

        return new Promise((resolve, reject) => {

            client.verify.services(otp.serviceID)
                .verificationChecks
                .create({
                    to: `+91${userData.phone}`,
                    code: confirmOtp.phone
                })
                .then((data) => {
                    if (data.status == 'approved') {
                      
                        resolve({ status: true })
                    }
                    else {
                        resolve({ status: false })
                    }

                })

        })

    },

   

    addtoCarts: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let usercart = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(userId) })
            if (usercart) {
                let proExist = usercart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CARTCOLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })

                }
                else {
                    db.get().collection(collection.CARTCOLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }

                            }

                        ).then((response) => {
                            resolve()

                        })


                }



            } else {
                let Cartobj = {
                    user: objectId(userId),
                    products: [proObj]
                }

                db.get().collection(collection.CARTCOLLECTION)

                    .insertOne(Cartobj).then((response) => {
                        resolve()
                    })
            }




        })
    },

    

    viewCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CARTCOLLECTION).aggregate([

                {
                    $match: { user: objectId(userId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }

                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },

            ]).toArray()


            resolve(cartItems)
        })
    },

  

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(userId) })

            if (cart) {

                count = cart.products.length;

            }
            resolve(count)
        })


    },

   

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {

            if (details.count == -1 && details.quantity == 1) {

                db.get().collection(collection.CARTCOLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }

                        }

                    ).then((response) => {

                        resolve({ removeProduct: true })

                    })



            }
            else {



                db.get().collection(collection.CARTCOLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })

            }
        })

    },

  

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CARTCOLLECTION).aggregate([

                {
                    $match: { user: objectId(userId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }

                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: [
                                    {

                                        $toInt: '$quantity'
                                    },
                                    {
                                        $toInt: '$product.price'
                                    }]
                            }

                        }
                    }
                }

            ]).toArray()

            resolve(total[0].total)
        })

    },



    placeOrder: (order, products, total, subtotal,user) => {
        return new Promise(async(resolve, reject) => {
            let status = order['payment-method'] === 'COD' || order['payment-method'] === 'walletPay' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: objectId(order['payment-address']),

                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                date: new Date(),
                SubTotalAmount: subtotal,
                status: status
            }

            if (order.couponcode) {

                await db.get().collection(collection.COUPENCOLLECTION).updateOne({ code: order.couponcode },
                    {
                        $push: {
                            Users: objectId(order.userId)


                        }
                    }

                )
            }
            let balance 
            if(order.useWallet == '1'){
            if(user.wallet <= total){
                balance = 0
                orderObj.walletDiscount = order.walletDiscount
            }else{
                balance = user.wallet - total
                orderObj.walletDiscount = order.walletDiscount
            }
            let wallet = await db.get().collection(collection.USERCOLLECTION).updateOne({_id:objectId(order.userId)},
                {
                    $set:{wallet:balance}
                })
            }

            db.get().collection(collection.ORDERCOLLECTION).insertOne(orderObj).then((response) => {
                resolve(response.insertedId)
            })
        })

    },

  

    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CARTCOLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                    }
                },

            ]).toArray()
            resolve(cartItems)

        })
    },


    getSubTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let subtotal = await db.get().collection(collection.CARTCOLLECTION).aggregate([

                {
                    $match: { user: objectId(userId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }

                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        _id: 0,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },

                {
                    $project: {
                        suBtotal: {
                            $multiply: [
                                {

                                    $toInt: '$quantity'
                                },
                                {
                                    $toInt: '$product.price'
                                }]

                        }
                    }
                }



            ]).toArray()

            resolve(subtotal)
        })






    },




    getSubTotal: (detail) => {

        return new Promise(async (resolve, reject) => {
            let subtotal = await db.get().collection(collection.CARTCOLLECTION).aggregate([
                {
                    $match: { user: ObjectId(detail.user) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }
                , {

                    $match: { item: ObjectId(detail.product) }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        _id: 0, quantity: 1, product: { $arrayElemAt: ["$product", 0] }

                    }
                },
                {
                    $project: {

                        total: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] }

                    }
                }

            ]).toArray()
            if (subtotal.length != 0) {
                resolve(subtotal[0].total)
            } else {
                resolve()
            }

        })
    },




  

    deleteCartItems: (details) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CARTCOLLECTION).updateOne({ _id: objectId(details.cart) },

                {
                    $pull: { products: { item: objectId(details.product) } }



                }).then((response) => {
                    resolve(response)
                })

        })



    },

   

    cartClear: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderDelete = await db.get().collection(collection.CARTCOLLECTION).deleteOne({ user: objectId(userId) })
            resolve(orderDelete)
        })



    },



    getOrderSummary: (orderId) => {


        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },




            ]).toArray()

            resolve(orderItems)
        })

    },



    getOrderProduct: (orderId) => {


        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        totalAmount: 1
                    }

                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        totalAmount: 1
                    }
                },

            ]).toArray()

            resolve(orderItems)
        })

    },

   

    viewOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDERCOLLECTION).find({ userId: objectId(userId) }).toArray()
            resolve(order)
        })
    },



    cancelOrder: (orderId,user) => {

        let response ={}
        return new Promise(async (resolve, reject) => {


      let order = await db.get().collection(collection.ORDERCOLLECTION).findOne({_id:objectId(orderId)})



      if(order.paymentMethod != "COD"){
        user.wallet = user.wallet +parseInt(order.totalAmount)
      let wallet =  await db.get().collection(collection.USERCOLLECTION).updateOne({_id:objectId(order.userId)},
        {
            $set:{wallet:user.wallet}
        })
    }

            db.get().collection(collection.ORDERCOLLECTION).updateOne({
                _id: objectId(orderId)


            },
                {
                    $set: {
                        status: "Cancelled"

                    }
                }).then((data) => {
                    response.order = order
                    resolve(response)
                })


        })
    },

 

    getUserOrders: (userId) => {

        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
                {
                    $match: { userId: objectId(userId) }
                },
                {
                    $lookup: {
                        from: collection.ADDRESSCOLLECTION,
                        localField: 'deliveryDetails',
                        foreignField: '_id',
                        as: 'address'
                    }
                },
                {
                    $unwind: '$address'
                },
                {
                    $sort: {
                        date: -1

                    }
                },
                {
                    $project: {
                        date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } }, totalAmount: 1, products: 1, paymentMethod: 1, address: 1, status: 1
                    }
                },

            ]).toArray()



            resolve(orders)
        })
    },
 

    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {

            var options = {
                amount: total * 100, 
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                }
                else {

                    resolve(order)
                }

            });

        })
    },




    generatePayPal: (orderId, totalPrice) => {
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    return_url: "http://localhost:3000/ordersuccess",
                    cancel_url: "http://localhost:3000/checkout/cancel"
                },
                "transactions": [
                    {
                        "item_list": {
                            "items": [
                                {
                                    "name": "Red Sox Hat",
                                    "sku": "001",
                                    "price": totalPrice,
                                    "currency": "USD",
                                    "quantity": 1
                                }
                            ]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": totalPrice
                        },
                        "description": "Hat for the best team ever"
                    }
                ]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;

                } else {
                    resolve(payment);
                }
            });
        });
    },




    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', "u461lMkrPyYwhfhuGMuAif3r")

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            }
            else {
                reject()
            }

        })

    },

   

    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERCOLLECTION)

                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }
                ).then(() => {
                    resolve()
                })

        }




        )
    },



    addAddress: (userId, details) => {
        return new Promise((resolve, reject) => {
            let tempId = moment().format().toString()

            tempId.replace(/\s+/g, ' ').trim()

            let date = new Date()


            let address = db.get().collection(collection.ADDRESSCOLLECTION).insertOne({

                user: objectId(userId),
                name: details.name,

                address: details.address,

                pincode: details.pincode,

                number: details.number,

                state: details.state,

                city: details.city,

                country: details.country,

                landMark: details.landMark,

                id: tempId
            })

            resolve(address)

        })
    },




    viewAddress: (userId) => {
        return new Promise(async (resolve, reject) => {

            let address = await db.get().collection(collection.ADDRESSCOLLECTION).find({ user: objectId(userId) }).toArray()

            resolve(address)
        })
    },


    getAddressEdit: (Id, userId) => {

        return new Promise(async (resolve, reject) => {

            let data = await db.get().collection(collection.ADDRESSCOLLECTION).findOne({ $and: [{ user: objectId(userId) }, { id: Id }] })

            resolve(data)
        })
    },



    postAddressEdit: (details, userId, id) => {

        return new Promise(async (resolve, reject) => {

            try {

                let data = await db.get().collection(collection.ADDRESSCOLLECTION).updateOne({ user: objectId(userId), id: id },

                    {
                        $set:
                        {

                            name: details.name,

                            address: details.address,

                            pincode: details.pincode,

                            number: details.number,

                            country: details.country,

                            state: details.state,

                            city: details.city,

                            landMark: details.landMark,
                        }


                    })


                resolve(data)

            } catch (error) {
            }
        })
    },



    deleteAddress: (userId, Id) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.ADDRESSCOLLECTION).deleteOne({ user: objectId(userId), id: Id })

                .then((data) => {

                    resolve(data)
                })
        })
    },



   


    productCount: async (catId) => {

        return new Promise(async (resolve, reject) => {

            let products = await db.get().collection(collection.PRODUCTCOLLECTION).aggregate([
             

                {
                    $lookup: {

                        from: collection.CATEGORYCOLLECTION,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }

                },
                {
                    $project: { category: { $arrayElemAt: ['$category', 0] }, name: 1 }
                },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }
                }
            ]).toArray()



            resolve(products)


        })


    },


   


      addMessage :(msg,userId)=>{

        return new Promise(async(resolve,reject)=>{

          let user = await db.get().collection(collection.MESSAGECOLLECTION).find({user_data:objectId(userId)})

          if(user.length>0){

            await db.get().collection(collection.MESSAGECOLLECTION).updateOne({user_data:objectId(userId)},
            {
                $set:{
                    adminMessage:[],
                    adminView:false
                },

                $push:{
                    userMessage: message.message
                }
            }).then((data)=>{

                resolve(data)
            })
            
          }
          else{
            await db.get().collection(collection.MESSAGECOLLECTION).insertOne({user_data:objectId(userId),
            userMessage:[message.message],
            adminMessage:[],
            adminView:false
            }).then((data)=>{
                resolve()
            })
        }
        })
      },



  

    converter: (price) => {
        return new Promise((resolve, reject) => {
          let currencyConverter = new CC({
            from: "INR",
            to: "USD",
            amount: price,
            isDecimalComma: false,
          });
          currencyConverter.convert().then((response) => {
            resolve(response);
          });
        });
      },

      searchInProducts:(key)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCTCOLLECTION).find(
                {
                    "$or":[
                        {name:{$regex: key, $options: 'i'}},
                      
                    ]
                }
            ).toArray().then((products)=>{
                resolve(products)
            })
        })
    },



    useWallet: (total, user) => {


        let response = {}

        return new Promise(async (resolve, reject) => {

            if (total.amount < user.wallet) {

                response.amount = 0
                response.wallet = user.wallet - total.amount

                response.status = true
                resolve(response)
            }
            else {
                response.amount = total.amount - user.wallet
                response.wallet = 0
                response.status = true
                resolve(response)
            }
        })
    },


   

    removeWallet: (user, currentWallet) => {

        return new Promise((resolve, reject) => {

            let response = {}

            if (currentWallet.wallet == 0) {
                response.total = user.wallet + parseInt(currentWallet.amount)
                response.wallet = user.wallet
            }
            else {
                response.total = user.wallet - parseInt(currentWallet.wallet)
                response.wallet = user.wallet
            }

            resolve(response)
        })
    },



    getUserWallet: (id) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.USERCOLLECTION).findOne({ _id: objectId(id) },{wallet:1}).then((data) => {
                resolve(data)
            })
        })
    },





setWalletHistory:(user,order,description,debit)=>{



   
    return new Promise(async(resolve,reject)=>{
         let walletDetails;

        if(debit){
        
         walletDetails = {
                date: new Date().toDateString(),
                orderId: order.orderId,
                amount: order.amount,
                description:description,
                debit: true
              };
        }
    

          else {

             walletDetails = {
                date: new Date().toDateString(),
                orderId: order.orderId,
                amount: order.amount,
                description:description,
                credit:true
              };


          }


      let userData = await db.get().collection(collection.USERCOLLECTION).findOne({_id: objectId(user._id)})



 
        db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(user._id )},
        {
            $push: { walletHistory: walletDetails }
        }).then((response) => {
            resolve(response)
        })      

            

        })
    },



  


    disWalletHistory:(user)=>{

        return new Promise (async(resolve,reject)=>{

            let his = await db.get().collection(collection.USERCOLLECTION).aggregate([

 
                {
                    $match : {_id:objectId(user)}
                },
                {
                    $unwind: "$walletHistory"
                },{
                    $project : { _id:0,walletHistory:1}
                }

            ]).toArray()

            resolve(his)
        })
    },


addToWishlist: (productId, userId) => {
    let productObject = {
        item: objectId(productId),
        quantity: 1
    }
    return new Promise(async (resolve, reject) => {
        let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
        if (userWishlist) {
            let productExists = userWishlist.products.findIndex(products => products.item == productId)
            if (productExists != -1) {
                db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
            } else {
                db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({ user: objectId(userId) }, {

                        $push: { products: productObject }

                    }).then((response) => {
                        resolve(response)
                    })
            }

        }
        else {
            let wishlistObject = {
                user: objectId(userId),
                products: [productObject]
            }
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObject).then((response) => {
                resolve(response)
            })
        }
    })
},

getWishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
        let wishListItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCTCOLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }


        ]).toArray()
        resolve(wishListItems)
    })
},
deleteFromWishlist: (details) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ _id: objectId(details.wishlist) }, {
            $pull: { products: { item: objectId(details.product) } }
        }).then(() => {
            resolve() 
        })
    })
},

ViewcatOffProduct: (catId) => {

    return new Promise(async (resolve, reject) => {

      let products = await db.get().collection(collection.PRODUCTCOLLECTION).find({ category: objectId(catId) }).toArray()



      resolve(products)

   
   })



    },



    returnOrder: (order, user) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.ORDERCOLLECTION).updateOne({ _id: objectId(order.orderId) },
                {
                    $set: { status: 'Returned' }
                }).then(async (response) => {
                    let amount = parseInt(order.amount) + user.wallet
                    let data = await db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(user._id) },
                        {
                            $set: { wallet: amount }
                        })
                })
            resolve({ status: true })
        })
    },

  


    getOrderProduct: (orderId) => {


        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        totalAmount: 1
                    }

                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        totalAmount: 1
                    }
                },

            ]).toArray()

            resolve(orderItems)
        })

    },



    getOrderProduct: (orderId) => {


        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        totalAmount: 1
                    }

                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        totalAmount: 1
                    }
                },

            ]).toArray()

            resolve(orderItems)
        })

    }
}