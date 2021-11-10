const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9pclo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('toy_store');
    const toysCollection = database.collection('toys');

    // GET API
    app.get('/toys', async (req, res) => {
        const cursor = toysCollection.find({});
        const toys = await cursor.toArray();
        res.send(toys);
    });

    // GET Single Tour
    app.get('/toys/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const toy = await toysCollection.findOne(query);
        res.json(toy);
    })

    // POST API
    app.post('/addToys', async (req, res) => {
        const newToy = req.body;
        const result = await toysCollection.insertOne(newToy);
        res.json(result)
    });

  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Toy store!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})