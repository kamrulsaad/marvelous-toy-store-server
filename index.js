import express from "express";
import cors from 'cors'
import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb'
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