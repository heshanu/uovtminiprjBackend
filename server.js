const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000; // Define the port number

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // Specify allowed origins in production
  credentials: false
}));

// Connect to MongoDB
const uri = 'mongodb+srv://heshanu97:test@cluster0.f6bnq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  travelMode: { type: String },
  accomadation: { type: String, required: true },
  foodList: { type: String },
  foodListOption: { type: String },
  beverageList: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  totalExpense: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'ongoing'
  }
});

const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);

// Registration Route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Get all users
app.get('/all', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).send('Error retrieving users');
  }
});

// Create a new customer
app.post('/createCustomer', async (req, res) => {
  try {
    const { name, age, address, travelMode, accomadation, foodList, foodListOption, beverageList, startDate, endDate } = req.body;
    const newCustomer = new Customer({ name, age, address, travelMode, accomadation, foodList, foodListOption, beverageList, startDate, endDate });
    await newCustomer.save();
    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).send('Error registering customer');
  }
});

// Get all customers
app.get('/allCustomers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(201).json(customers);
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.status(500).send('Error retrieving customers');
  }
});

// Get customer by ID
app.get('/getCustomerById/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).send('Customer not found');
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).send('Error retrieving customer');
  }
});

// Update totalExpense and/or status for a customer
app.patch('/updateCustomer/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { totalExpense, status } = req.body;

    // Prepare the update object
    const updateData = {};
    if (typeof totalExpense !== 'undefined') {
      updateData.totalExpense = totalExpense;
    }
    if (typeof status !== 'undefined') {
      updateData.status = status;
    }

    // Validate that at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update provided' });
    }

    // Find the customer by ID and update the fields
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Error updating customer' });
  }
});


// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
