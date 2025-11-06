require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/blood_donation';

mongoose.connect(MONGO, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(()=> console.log('MongoDB connected'))
  .catch(err=> console.error('MongoDB connection error:', err.message));

app.use('/api/auth', authRoutes);

app.get('/', (req,res)=> res.json({ok:true, msg:'Blood Donation Auth API'}));

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
