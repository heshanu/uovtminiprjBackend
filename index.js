const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;


// Middleware
app.use(bodyParser.json());
app.use(cors());


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

const customerSchema=new mongoose.Schema({
  name:{type:String,required:true,unique:true},
  age:{type:Number,required:true},
  address:{type:String,required:true},
  travelMode:{type:String},
  accomadation:{type:String,required:true},
  foodList:{type:String},
  foodListOption:{type:String},
  beverageList:{type:String},
  startDate:{type:String},
  endDate:{type:String}
})

const User = mongoose.model('User', userSchema);
const Customer=mongoose.model('Customer',customerSchema);

// Registration Route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
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
    res.status(500).send('Error logging in');
  }
});

app.get('/all', async (req, res) => {
    try {
      const users = await User.find(); // Fetch all users from the database
      res.status(200).json(users); // Send the users as a JSON response
    } catch (error) {
      res.status(500).send('Error retrieving users');
    }
  });


  app.post('/createCustomer', async (req, res) => {
    try {
      const { name,age,address,travelMode,accomadation,foodList,foodListOption,beverageList,beverageListOption,startDate,endDate } = req.body;
     // const hashedPassword = await bcrypt.hash(password, 10);
      const newCustomer = new Customer({ name,age,address,travelMode,accomadation,foodList,foodListOption,beverageList,beverageListOption,startDate,endDate});
      await newCustomer.save();
      res.status(201).send('Customer registered successfully');
    } catch (error) {
      res.status(500).send('Error registering user');
    }
  });

  app.get('/allCustomers', async (req, res) => {
    try {
      const users = await Customer.find(); // Fetch all users from the database
      res.status(200).json(users); // Send the users as a JSON response
    } catch (error) {
      res.status(500).send('Error retrieving customers');
    }
  });

  app.get('/getCustomerById/:id', async (req, res) => {
    try {
      const customerId = req.params.id; // Get the ID from the URL parameter
  
      const customer = await Customer.findById(customerId); // Fetch the customer by ID
  
      if (!customer) {
        return res.status(404).send('Customer not found');
      }
  
      res.status(200).json(customer); // Send the customer data as a JSON response
    } catch (error) {
      console.error('Error retrieving customer:', error);
      res.status(500).send('Error retrieving customer');
    }
  });

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
