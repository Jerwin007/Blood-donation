# Blood Donation & Management Portal - Auth Template

This package contains a full-stack project (React frontend + Node/Express backend) implementing user registration and login with MongoDB (use MongoDB Compass or local MongoDB).

## Features
- Register & Login with username or email
- Password hashing with bcrypt
- JWT authentication
- Client-side form validation, password strength meter, show/hide password
- Responsive React UI with simple animations
- Protected dashboard route
- MongoDB (use Compass) — collections and indexes created automatically by Mongoose


## How to run (step-by-step)
1. Make sure you have **Node.js (v16+)** and **npm** installed.
2. Make sure MongoDB is running or you have a connection string (e.g., `mongodb://localhost:27017/blood_donation`). You can use MongoDB Compass to create a database named `blood_donation` or simply let Mongoose create it.


### Backend
```bash
cd backend
cp .env.example .env
# edit .env to set MONGO_URI (e.g. mongodb://localhost:27017/blood_donation) and JWT_SECRET
npm install
npm run dev   # starts server on PORT (defaults to 5000)
```


### Frontend
```bash
cd frontend
npm install
npm start
```


Frontend runs on http://localhost:3000 and backend on http://localhost:5000 by default.

## Notes
- The `.env.example` file contains variables you must set.
- If you want email verification or forgot-password flow, see the TODOs in backend/auth routes.

Enjoy!

