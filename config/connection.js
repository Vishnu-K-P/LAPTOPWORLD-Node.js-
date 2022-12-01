const mongoClient=require('mongodb').MongoClient
const state={
    db:null

}

module.exports.connect=function(done){
    const url='mongodb+srv://vishnu:Vytila%40321@cluster0.rpvdtrx.mongodb.net/?retryWrites=true&w=majority'
    const dbname='myshoppingdb'



    mongoClient.connect(url,(err,data)=>{
        if(err) done(err)
        state.db=data.db(dbname)
        done()
    })


}
module.exports.get=function(){
    return state.db
}