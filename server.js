// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vypar', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Create a User model
const User = mongoose.model('User', {
    email: String,
    password: String,
    username: String,
    mobile: Number,

}, 'user'); // 'user' is the collection name

app.use(bodyParser.json());

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, email, mobile, password } = req.body;
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    // Create a new user
    const newUser = new User({
        username,
        password,
        email,
        mobile
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Find the user by username
    const user = await User.findOne({ username });
    const email = await User.findOne({ email });
    if (!user || !email) {
        return res.status(401).json({ message: 'Invalid username or email' });
    }
    // Check if the password matches
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful' });
});



// Product Model
const Product = mongoose.model('Product', {
    name: String,
    price: Number,
    salePrice: Number
}, 'products');


// Route to fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products from the database
        res.status(200).send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


// Routes
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, salePrice } = req.body;
        const product = new Product({ name, price, salePrice });
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
app.put('api/products/${id}', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, salePrice } = req.body;
        const product = await Product.findByIdAndUpdate(id, { name, price, salePrice }, { new: true });
        res.send(product);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


// add invoice data to database 

// Route to save invoice data
app.post('/api/saveInvoice', (req, res) => {
    const invoiceData = req.body;

    // Access the vypar database and the invoicedata collection
    const db = client.db('vypar');
    const collection = db.collection('invoicedata');

    // Insert the invoice data into the collection
    collection.insertOne(invoiceData, (err, result) => {
        if (err) {
            console.error('Error saving invoice data:', err);
            res.status(500).send('Error saving invoice data');
            return;
        }
        console.log('Invoice data saved successfully');
        res.status(200).send('Invoice data saved successfully');
    });
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
