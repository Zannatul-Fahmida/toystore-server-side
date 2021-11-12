const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
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
    const ordersCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');
    const usersCollection = database.collection('users');

    // GET API
    app.get('/toys', async (req, res) => {
      const cursor = toysCollection.find({});
      const toys = await cursor.toArray();
      res.send(toys);
    });

    // GET Single Toy
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const toy = await toysCollection.findOne(query);
      console.log(toy);
      res.json(toy);
    })

    // POST API
    app.post('/addToys', async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy);
      res.json(result)
    });

    // GET Orders API
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //add orders in database
    app.post("/addOrders", (req, res) => {
      ordersCollection.insertOne(req.body).then((result) => {
        res.json(result);
      });
    });

    // get all order by email query
    app.get("/myOrders/:email", async (req, res) => {
      const cursor = ordersCollection.find({ email: req.params.email });
      const result = await cursor.toArray();
      res.json(result);
    });

    // GET Single orders
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const ordered = await ordersCollection.findOne(query);
      res.json(ordered);
    })

    //Update Status
    app.put('/order/:id', async (req, res) => {
      const id = req.params.id;
      const updatedOrders = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrders.status
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    // GET Reviews API
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });
    
    //add reviews in database
    app.post("/addReviews", (req, res) => {
      reviewsCollection.insertOne(req.body).then((result) => {
        res.json(result);
      });
    });

    //get users by email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    //add users in database
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    })

    //update users
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    //update users to admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const requester = req.decodedEmail;
      if(requester){
        const requesterAccount = await usersCollection.findOne({email: requester});
        if(requesterAccount.role === 'admin'){
          const filter = { email: user.email };
          const updateDoc = { $set: { role: 'admin' } };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        }
      }
      else{
        res.status(403).json({message: 'You do not have access to make admin'});
      }
    })

    // DELETE orders
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
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