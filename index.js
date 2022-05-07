import express from "express";
import cors from 'cors'
import 'dotenv/config'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@marvelous-toy-store.iio7h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    await client.connect()
    const productsCollection = client.db('toyStore').collection('products')

    try{
        app.get('/products', async(req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        app.post('/products', async(req, res) => {
            const newProduct = req.body
            const result = productsCollection.insertOne(newProduct)
            res.send(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        app.put('/products/:id', async(req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body.stock;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedProduct = {
                $set: {
                    stock: updatedQuantity
                }
            }
            const result = await productsCollection.updateOne(filter, updatedProduct, options)
            res.send(result)
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const productById = await productsCollection.findOne(query)
            res.send(productById)
        })
    }
    finally{}
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello form Marvelous toy store server')
})

app.listen(port, () => {
    console.log(port);
})