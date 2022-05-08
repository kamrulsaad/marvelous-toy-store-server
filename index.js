import express from "express";
import cors from 'cors'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).send({ message: "UnAuthorized Access" })
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, decoded) => {
        if (err) return res.status(403).send("Forbidded Access")
        req.decoded = decoded.email
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@marvelous-toy-store.iio7h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    await client.connect()
    const productsCollection = client.db('toyStore').collection('products')
    const userAddedItemsCollection = client.db('toyStore').collection('userAddedProducts')

    try {
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        app.post('/products', async (req, res) => {
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

        app.put('/products/:id', async (req, res) => {
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

        app.post('/myItems', async (req, res) => {
            const item = req.body
            const result = await userAddedItemsCollection.insertOne(item)
            res.send(result)
        })

        app.get('/myItems', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded
            const email = req.query.email
            if (decodedEmail === email) {
                const query = { email }
                const result = productsCollection.find(query)
                const myItems = await result.toArray()
                res.send(myItems)
            }
            else res.status(403).send({message: "Forbidden Access"})
        })


        app.post('/getToken', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
                expiresIn: '3d'
            })
            res.send({ accessToken })
        })

    }
    finally { }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello form Marvelous toy store server')
})

app.listen(port, () => {
    console.log(port);
})