var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcrypt')
const { response } = require('express')
var objectId = require('mongodb').ObjectId


module.exports = {

  viewUsers: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.USERCOLLECTION).find().toArray()
      resolve(data)
    })
  },



  blockUser: (Id) => {
    return new Promise(async (resolve, reject) => {
      let details = await db.get().collection(collection.USERCOLLECTION).findOne({ $and: [{ _id: objectId(Id) }, { state: true }] })

      if (details) {
        await db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(Id) }, { $set: { state: false } }).then((data) => {
          data.status = true;
          resolve(data)
        })
      } else {
        await db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(Id) }, { $set: { state: true } }).then((data) => {
          resolve(data)
        })
      }

    })
  },





  viewProducts: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCTCOLLECTION).find().toArray()
      resolve(product)
    })
  },

 



  ViewProduct: () => {

    return new Promise(async (resolve, reject) => {

      let categoryName = await db.get().collection(collection.PRODUCTCOLLECTION).aggregate([

        {
          $lookup: {

            from: collection.CATEGORYCOLLECTION,
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $project: {
            category: { $arrayElemAt: ['$category', 0] },
            name: 1,
            image: 1,
            price: 1,
            description: 1,
            originalPrice: 1,
            offerPercentage:1


          }
        },
        {
          $sort:{_id:-1}
        },
        
        {
          $limit: 20
        }
      ]).toArray()

      resolve(categoryName)

    })

  },

  ViewallProduct: () => {

    return new Promise(async (resolve, reject) => {
     

      let categoryName = await db.get().collection(collection.PRODUCTCOLLECTION).aggregate([

        {
          $lookup: {

            from: collection.CATEGORYCOLLECTION,
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $project: {
            category: { $arrayElemAt: ['$category', 0] },
            name: 1,
            image: 1,
            price: 1,
            description: 1,
            originalPrice: 1,
            offerPercentage:1


          }
        }
      ]).toArray()
    
     
      resolve(categoryName)

    })

  },


  ViewProducts: () => {

    return new Promise(async (resolve, reject) => {

      let categoryName = await db.get().collection(collection.PRODUCTCOLLECTION).aggregate([

        {
          $lookup: {

            from: collection.CATEGORYCOLLECTION,
            localField: 'category',
            foreignField: '_id',
            as: 'category'  
          }
        },
        {
          $project: {
            category: { $arrayElemAt: ['$category', 0] },
            name: 1,
            image: 1, 
            price: 1,
            description: 1,
            originalPrice: 1,
            offerPercentage:1,
            stock:1


          }
        },{
          $limit: 4
        }
      ]).toArray()

      resolve(categoryName)

    })

  },


  addproduct: (productData) => {
    return new Promise(async (resolve, reject) => {

      if(productData.offerPercentage){

        newprice = Math.round((productData.price)*((100-productData.offerPercentage)/100))
        


        productData.originalPrice = productData.price
        productData.price = newprice

        productData.category = objectId(productData.category)

        await db.get().collection(collection.PRODUCTCOLLECTION).insertOne(productData).then((data) => {
          resolve(data)


      }) 
    }  else {

        productData.category = objectId(productData.category)
        await db.get().collection(collection.PRODUCTCOLLECTION).insertOne(productData).then((data) => {
          resolve(data)


      })
    }


      })

    },
  



  deleteproduct: (delId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.PRODUCTCOLLECTION).deleteOne({ _id: objectId(delId) }).then((data) => {

        resolve(data)

      })

    })
  },

 
  updateProduct: (id, productDetails) => {

  return new Promise(async(resolve,reject)=>{
    let img = await db.get().collection(collection.PRODUCTCOLLECTION).findOne({_id:objectId(id)})
   
    if(productDetails.image.length == 0){
      productDetails.image = img.image
    }

    let newprice;

    if(productDetails.offerPercentage){
      if(productDetails.originalPrice){
       newprice=Math.round((productDetails.originalPrice)*((100-productDetails.offerPercentage)/100))

       productDetails.price = newprice
        productDetails.category = objectId(productDetails.category)
        db.get().collection(collection.PRODUCTCOLLECTION).updateOne({_id:objectId(id)},
        {
         $set:productDetails
        })
        resolve(response)

      }
      else {

       newprice=Math.round((productDetails.price)*((100-productDetails.offerPercentage)/100))
       productDetails.originalPrice = productDetails.price
       productDetails.price = newprice
        productDetails.category = objectId(productDetails.category)
        db.get().collection(collection.PRODUCTCOLLECTION).updateOne({_id:objectId(id)},
        {
         $set:productDetails
        })
        resolve(response)

      }
     


     }

   else{
    if(productDetails.orginalPrice > productDetails.price){
      productDetails.price = productDetails.orginalPrice
      productDetails.orginalPrice=''
    }
    productDetails.category = objectId(productDetails.category)
     db.get().collection(collection.PRODUCTCOLLECTION).updateOne({_id:objectId(id)},
     {
      $set:productDetails
     })
     .then((data)=>{
       response.data = data
       response.status= true
       resolve(response)
     })
   }
  })
},


  






  ViewUpdateproduct: (Id) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.PRODUCTCOLLECTION).findOne({ _id: objectId(Id) })
      resolve(data)
    })
  },

  
  deletecategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CATEGORYCOLLECTION).deleteOne({ _id: objectId(catId) }).then((data) => {

        resolve(data)

      })

    })
  },
  
  addcategory: (categoryData) => {
    return new Promise(async (resolve, reject) => {

      let cat = await db.get().collection(collection.CATEGORYCOLLECTION).findOne({ category: categoryData.category })
      if (cat) {
        response.status = false
        resolve(response)
      } else {


        await db.get().collection(collection.CATEGORYCOLLECTION).insertOne(categoryData).then((response) => {
          response.status = true
          resolve(response)
        })
      }

    })
  },


  viewCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATEGORYCOLLECTION).find().toArray()
      resolve(category)
    })
  },

  ViewUpdatecategorys: (Id) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.CATEGORYCOLLECTION).findOne({ _id: objectId(Id) })
      
      resolve(data)
    })
  },

  updateCategory: (id, productDetails) => {

    return new Promise(async(resolve,reject)=>{
    db.get().collection(collection.CATEGORYCOLLECTION).updateOne({_id:objectId(id)},
          {
           $set:productDetails
          })
  
  resolve(response)
  })
},







  viewOrders: (order) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
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
        }, {
          $project: {
            date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } }, totalAmount: 1, products: 1, paymentMethod: 1, address: 1, status: 1
          }
        }
      ]).toArray()
      resolve(orders)

    })
  },





  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {


      let order = await db.get().collection(collection.ORDERCOLLECTION).findOne({_id:objectId(orderId)})


      if(order.paymentMethod != 'COD'){
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
          resolve(data)
        })


    })
  },



  shippedOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {

      db.get().collection(collection.ORDERCOLLECTION).updateOne({
        _id: objectId(orderId)


      },
        {
          $set: {
            status: "Shipped"

          }
        }).then((data) => {
          resolve(data)
        })


    })
  },


  deliveredOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {

      db.get().collection(collection.ORDERCOLLECTION).updateOne({
        _id: objectId(orderId)


      },
        {
          $set: {
            status: "Delivered"

          }
        }).then((data) => {
          resolve(data)
        })


    })
  },






  doNutchartData: () => {

    return new Promise(async (resolve, reject) => {

      let order = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

        {
          $group: {
            _id: "$paymentMethod",
            count: {
              $sum: 1
            }
          }
        },

      ]).toArray()
      resolve(order)
    })

  },


  


    getprodlist:(startIndex,limit)=>{

      return new Promise(async(resolve,reject)=>{


        let index = ((startIndex-1)*limit)

      

        let categoryName = await db.get().collection(collection.PRODUCTCOLLECTION).aggregate([

          {
            $lookup: {
  
              from: collection.CATEGORYCOLLECTION,
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $project: {
              category: { $arrayElemAt: ['$category', 0] },
              name: 1,
              image: 1,
              price: 1,
              description: 1,
              originalPrice: 1,
              offerPercentage:1,
              stock:1
  
  
            }
          },
          {
            $skip: index

            
          },{
            $limit: limit

            
          }
        ]).toArray()
  
        resolve(categoryName)
  
      })


      },
  


  


  Procount:()=>{

    return new Promise (async(resolve,reject)=>{

      await db.get().collection(collection.PRODUCTCOLLECTION).count().then((response)=>{


        resolve(response)
      })
    })
  },




recentProducts:()=>{

  return new Promise(async(resolve,reject)=>{

   let rec = await db.get().collection(collection.PRODUCTCOLLECTION).aggregate([

      {
        $sort:{_id:-1}
      },{
        $limit: 8
      }
    ]).toArray()      

    resolve(rec)
  })
},


  getDailySalespro: (day) => {
    return new Promise(async (resolve, reject) => {

      let dailysales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            totalAmount: 1,
            date: 1,
            status: 1,
            _id: 1,
            item: '$products.item',
            quantity: '$products.quantity'

          }
        }, {
          $lookup: {
            from: collection.PRODUCTCOLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: '$date' } }, totalAmount: 1, paymentMethod: 1, item: 1, product: { $arrayElemAt: ['$product', 0] }, quantity: 1
          }
        },
        {
          $match: { date: day }
        },
        {
          $group: {
            _id: '$item',
            quantity: { $sum: '$quantity' },
            totalAmount: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] } },
            name: { $first: '$product.name' },
            date: { $first: '$date' },
            price: { $first: '$product.price' },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(dailysales)
    })
  },






  getMonthlySalesPro: (day) => {
    return new Promise(async (resolve, reject) => {

      let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: { dates: { $dateToString: { format: "%Y-%m", date: "$date" } }, totalAmount: 1, date: { $dateToString: { format: "%d-%m-%Y", date: '$date' } } }
        },
        {
          $match: {
            dates: day
          }
        },
        {
          $group: {
            _id: '$date',
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }

      ]).toArray()
      resolve(sales)
    })

  },


  salesGraph: () => {
    return new Promise(async (resolve, reject) => {
        let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
            {
                $project: { date: 1, totalAmount: 1 }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalAmount: { $sum: '$totalAmount' },

                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            {
              $limit: 7
            }

        ]).toArray()
        resolve(sales)
    })
},

salesMonthlyGraph: () => {
    return new Promise(async (resolve, reject) => {
        let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
            {
                $project: { date: 1, totalAmount: 1 }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    totalAmount: { $sum: '$totalAmount' },

                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }

        ]).toArray()
        resolve(sales)
    })
},



 


  getMonthlySales: () => {

    return new Promise(async (resolve, reject) => {

      let monthlysale = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m", date: "$date" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(monthlysale)
    })





  },




  getYearlySalesPro: (day) => {
    return new Promise(async (resolve, reject) => {

      let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: { dates: { $dateToString: { format: "%Y", date: "$date" } }, totalAmount: 1, date: { $dateToString: { format: "%m-%Y", date: '$date' } } }
        },
        {
          $match: {
            dates: day
          }
        },
        {
          $group: {
            _id: '$date',
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }

      ]).toArray()
      resolve(sales)
    })

  },



 



  getyearlySales: () => {

    return new Promise(async (resolve, reject) => {

      let sale = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$date" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(sale)
    })
  },





  shippedOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {

      db.get().collection(collection.ORDERCOLLECTION).updateOne({
        _id: objectId(orderId)


      },
        {
          $set: {
            status: "Shipped"

          }
        }).then((data) => {
          resolve(data)
        })


    })
  },

  

  deliveredOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {

      db.get().collection(collection.ORDERCOLLECTION).updateOne({
        _id: objectId(orderId)


      },
        {
          $set: {
            status: "Delivered"

          }
        }).then((data) => {
          resolve(data)
        })


    })
  },





  doNutchartData: () => {

    return new Promise(async (resolve, reject) => {

      let order = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

        {
          $group: {
            _id: "$paymentMethod",
            count: {
              $sum: 1
            }
          }
        },
      ]).toArray()
      resolve(order)
    })

  },




  piechartData: () => {

    return new Promise(async (resolve, reject) => {

      let order = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1
            }
          }
        },

      ]).toArray()
      resolve(order)
    })

  },




  barchartData: () => {

    return new Promise(async (resolve, reject) => {

      let order = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

        {
          $match: {
            "status": { $nin: ['Cancelled', 'pending'] }

          }
        }, {
          $group: {
            _id: '$paymentMethod',
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }

      ]).toArray()
      resolve(order)
    })

  },



  yearlyChart: () => {
    return new Promise(async (resolve, reject) => {

      let yearChart = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {

          $project: {

            year: {
              $year: '$date'
            },
            totalAmount: 1
          }
        }, {
          $group: {
            _id: "$year",
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }, {

          $sort: {
            _id: 1
          }

        },
        {

          $limit: 10
        }



      ]).toArray()
      resolve(yearChart)
    })



  },


 



  getDailySales: () => {
    return new Promise(async (resolve, reject) => {

      let dailysales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: '$date' } }, _id: 1, totalAmount: 1
          }
        },

        {
          $group: {
            _id: "$date",
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        },
        {
          $sort: { _id: 1 }
        }

   

      ]).toArray()
      resolve(dailysales)
    })
  },




  getDailyOrders: () => {
    return new Promise(async (resolve, reject) => {

      let dailyorders = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: {
            torders: { $dateToString: { format: "%Y-%m-%d", date: '$date' } }, _id: 1
          }
        },



        {
          $count: 'torders'
        }

      ]).toArray()
      resolve(dailyorders)
      
    })
  },



  getTotalUsers: () => {
    return new Promise(async (resolve, reject) => {

      let TotalUsers = await db.get().collection(collection.USERCOLLECTION).aggregate([
        {
          $match: {
            "state": { $nin: [false] }
          }
        },
        {
          $project: {
            user: { _id: 1 }
          }
        },



        {
          $count: 'user'
        }

      ]).toArray()
      resolve(TotalUsers)
    })
  },

 

  getTotalInactiveUsers: () => {
    return new Promise(async (resolve, reject) => {

      let TotalInactiveUsers = await db.get().collection(collection.USERCOLLECTION).aggregate([
        {
          $match: {
            "state": { $nin: [true] }
          }
        },
        {
          $project: {
            user: { _id: 1 }
          }
        },



        {
          $count: 'user'
        }

      ]).toArray()
      resolve(TotalInactiveUsers)
    })
  },




  viewCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATEGORYCOLLECTION).find().toArray()
      resolve(category)
    })
  },



  viewBanner: (banner) => {
    return new Promise(async (resolve, reject) => {
      let banner = await db.get().collection(collection.BANNERCOLLECTION).find().toArray()
      resolve(banner)
    })
  },



  addBanner: (banner) => {

    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.BANNERCOLLECTION).insertOne(banner)
      resolve(data)
    })
  },



  ViewUpdateBanner: (Id) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.BANNERCOLLECTION).findOne({ _id: objectId(Id) })
      resolve(data)
    })
  },


  updateBanner: (Id, banner) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.BANNERCOLLECTION).updateOne({ _id: objectId(Id) }, {
        $set: {
          name: banner.name,
          index: banner.index,
          description: banner.description
        }
      }).then((data) => {
        resolve(data)
      })
    })
  },



  deleteBanner: (delId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.BANNERCOLLECTION).deleteOne({ _id: objectId(delId) }).then((data) => {

        resolve(data)

      })

    })
  },
  



  doNutchartData: () => {

    return new Promise(async (resolve, reject) => {

      let order = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

        {
          $group: {
            _id: "$paymentMethod",
            count: {
              $sum: 1
            }
          }
        },
  

      ]).toArray()
      resolve(order)
    })

  },




  piechartData: () => {

    return new Promise(async (resolve, reject) => {

      let order = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1
            }
          }
        },

      ]).toArray()
      resolve(order)
    })

  },


 

  barchartData: () => {

    return new Promise(async (resolve, reject) => {

      let order = await db.get().collection(collection.ORDERCOLLECTION).aggregate([

        {
          $match: {
            "status": { $nin: ['Cancelled', 'pending'] }

          }
        }, {
          $group: {
            _id: '$paymentMethod',
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }

      ]).toArray()
      resolve(order)
    })

  },



  yearlyChart: () => {
    return new Promise(async (resolve, reject) => {

      let yearChart = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {

          $project: {

            year: {
              $year: '$date'
            },
            totalAmount: 1
          }
        }, {
          $group: {
            _id: "$year",
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }, {

          $sort: {
            _id: 1
          }

        },
        {

          $limit: 10
        }



      ]).toArray()
      resolve(yearChart)
    })



  },






  getDailySales: () => {
    return new Promise(async (resolve, reject) => {

      let dailysales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: '$date' } }, _id: 1, totalAmount: 1
          }
        },

        {
          $group: {
            _id: "$date",
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        },
        {
          $sort: { _id: 1 }
        }

      

      ]).toArray()
      resolve(dailysales)
    })
  },



  getDailyOrders: () => {
    return new Promise(async (resolve, reject) => {

      let dailyorders = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: {
            torders: { $dateToString: { format: "%Y-%m-%d", date: '$date' } }, _id: 1
          }
        },



        {
          $count: 'torders'
        }

      ]).toArray()
      resolve(dailyorders)
    })
  },



  getTotalUsers: () => {
    return new Promise(async (resolve, reject) => {

      let TotalUsers = await db.get().collection(collection.USERCOLLECTION).aggregate([
        {
          $match: {
            "state": { $nin: [false] }
          }
        },
        {
          $project: {
            user: { _id: 1 }
          }
        },



        {
          $count: 'user'
        }

      ]).toArray()
      resolve(TotalUsers)
    })
  },

  

  getTotalInactiveUsers: () => {
    return new Promise(async (resolve, reject) => {

      let TotalInactiveUsers = await db.get().collection(collection.USERCOLLECTION).aggregate([
        {
          $match: {
            "state": { $nin: [true] }
          }
        },
        {
          $project: {
            user: { _id: 1 }
          }
        },



        {
          $count: 'user'
        }

      ]).toArray()
      resolve(TotalInactiveUsers)
      console.log(",**************");
      console.log(TotalInactiveUsers);
    })
  },






  getDailySalespro: (day,dayend) => {
    return new Promise(async (resolve, reject) => {

      let dailysales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            totalAmount: 1,
            date: 1,
            status: 1,
            _id: 1,
            item: '$products.item',
            quantity: '$products.quantity'

          }
        }, {
          $lookup: {
            from: collection.PRODUCTCOLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: '$date' } }, totalAmount: 1, paymentMethod: 1, item: 1, product: { $arrayElemAt: ['$product', 0] }, quantity: 1
          }
        },
        {
          $match: { date:   {
            $gte: new Date(day).toISOString(),
            $lte: new Date(dayend).toISOString()
        } }
        },
        {
          $group: {
            _id: '$item',
            quantity: { $sum: '$quantity' },
            totalAmount: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] } },
            name: { $first: '$product.name' },
            date: { $first: '$date' },
            price: { $first: '$product.price' },
          }
        },
        {
          $sort: { date: 1 },
        }
      ]).toArray()
      resolve(dailysales)
      console.log(",akjs***********");
      console.log(dailysales);
    })
  },


  



  getMonthlySalesPro: (day) => {
    return new Promise(async (resolve, reject) => {

      let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: { dates: { $dateToString: { format: "%Y-%m", date: "$date" } }, totalAmount: 1, date: { $dateToString: { format: "%d-%m-%Y", date: '$date' } } }
        },
        {
          $match: {
            dates: day
          }
        },
        {
          $group: {
            _id: '$date',
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }

      ]).toArray()
      console.log(sales);
      resolve(sales)
    })

  },


  salesGraph: () => {
    return new Promise(async (resolve, reject) => {
        let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
          
            {
                $project: { date: 1, totalAmount: 1 }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalAmount: { $sum: '$totalAmount' },

                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            {
              $limit: 7
            }

        ]).toArray()
        
        resolve(sales)
    })
},

salesMonthlyGraph: () => {
    return new Promise(async (resolve, reject) => {
        let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
           
            {
                $project: { date: 1, totalAmount: 1 }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    totalAmount: { $sum: '$totalAmount' },

                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }

        ]).toArray()
        resolve(sales)
    })
},





  getMonthlySales: () => {

    return new Promise(async (resolve, reject) => {

      let monthlysale = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m", date: "$date" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(monthlysale)
    })





  },



  getYearlySalesPro: (day) => {
    return new Promise(async (resolve, reject) => {

      let sales = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $project: { dates: { $dateToString: { format: "%Y", date: "$date" } }, totalAmount: 1, date: { $dateToString: { format: "%m-%Y", date: '$date' } } }
        },
        {
          $match: {
            dates: day
          }
        },
        {
          $group: {
            _id: '$date',
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }

      ]).toArray()
      resolve(sales)
    })

  },





  getyearlySales: () => {

    return new Promise(async (resolve, reject) => {

      let sale = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$date" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(sale)
    })





  },


  checkProductCategory:(Category)=>{
    return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.PRODUCTCOLLECTION).find({ category: objectId(Category) }).toArray().then((checkProduct)=>{
            if(checkProduct.length!=0){
                resolve({delete:false})
             }else{
                 resolve({delete:true})
             }
        }) 
      
    })
},


  addCoupon: (couponDetails) => {
    return new Promise(async (resolve, reject) => {
      let response = {}
      let couponExist = await db.get().collection(collection.COUPENCOLLECTION).findOne({ code: couponDetails.code })

      if (couponExist) {
        response.status = true
        response.message = "Coupon With this Code Already Exist"
        resolve(response)
      } else {
        await db.get().collection(collection.COUPENCOLLECTION).insertOne({ name: couponDetails.name, code: couponDetails.code, endingdate: couponDetails.endingdate, value: couponDetails.value, minAmount: couponDetails.minAmount, maxAmount: couponDetails.maxAmount, status: true }).then((response) => {
          response.message = 'Coupon Added successfully'
          response.status = false
          resolve(response)
        })
      }

    })
  },






  viewCoupens: (coupen) => {
    return new Promise(async (resolve, reject) => {
      let coupen = await db.get().collection(collection.COUPENCOLLECTION).find().toArray()
      resolve(coupen)
      console.log(coupen)
    })
  },




  




  applyCoupon: (details, userId, date,totalAmount) => {
    return new Promise(async (resolve, reject) => {
      let response = {}
      let coupon = await db.get().collection(collection.COUPENCOLLECTION).findOne({ code: details.coupon, status: true })
      console.log(coupon, 'couponpre');

      if (coupon) {
        const expDate = new Date(coupon.endingdate)
        response.couponData = coupon
        let user = await db.get().collection(collection.COUPENCOLLECTION).findOne({ code: details.coupon, Users: objectId(userId) })
        if (user) {
          response.used = "Coupon Already Used"
          resolve(response)
        } else {

          if (date <= expDate) {

            response.dateValid = true

            resolve(response)
            let total = totalAmount
            console.log(total, 'total');
            console.log(coupon.minAmount, 'kkkkmin');
            console.log(coupon.maxAmount, 'kkkkkmax');

            if (total >= coupon.minAmount) {
              console.log('amount heloooo');
              response.verifyminAmount = true

              resolve(response)

              if (total <= coupon.maxAmount) {
                console.log('amountmax heloooo');
                response.verifymaxAmount = true

                resolve(response)
              } else {
                response.verifyminAmount = true
                response.verifymaxAmount = true
                resolve(response)
              }

            } else {
              response.minAmountMsg = 'Your minimum purchase should be' + coupon.minAmount
              response.minAmount = true
              resolve(response)
            }




          } else {
            response.invalidDateMsg = 'Coupon Expired'
            response.invalidDate = true
            response.Coupenused = false

            resolve(response)
            console.log('invalid date');
          }


        }
      } else {
        response.invalidCoupon = true
        response.invalidCouponMsg = ' Invalid Coupon '
        resolve(response)
      }

      if (response.dateValid && response.verifymaxAmount && response.verifyminAmount) {
        response.verify = true

        db.get().collection(collection.CARTCOLLECTION).updateOne({ user: objectId(userId) }, {

          $set: {
            coupon: objectId(coupon._id)
          }
        })

        resolve(response)
      }
    })
  },



 

  couponVerify: (user) => {

    console.log(user);

    return new Promise(async (resolve, reject) => {

      let userCart = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(user) })


      if (userCart.coupon) {

        let coupenData = await db.get().collection(collection.COUPENCOLLECTION).findOne({ _id: objectId(userCart.coupon) })

        resolve(coupenData)
        console.log(coupenData);


      }


      resolve(userCart)
      console.log(userCart);
    })
  },

 

  removeCoupon: (user) => {

    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CARTCOLLECTION).updateOne({ user: objectId(user) }, {

        $unset: {

          coupon: ""
        }

      }).then((response) => {
        resolve(response)

      })

    })
  },









}

  