# Online Voting System

A secure and efficient web-based Online Voting System built with React, Node.js, and MongoDB.

## Features

- Secure admin and voter authentication (JWT + bcrypt)
- Admin: manage parties, elections, and candidates
- Voters: register, view elections, vote once per election
- Automatic vote counting and result display
- Role-based authorization

## Tech Stack

- **Frontend:** React.js, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt

## Project Structure

```
online-voting-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── utils/
```

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/voting_system
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```
## backend 
1, cd "c:\xampp\htdocs\Online Voting System\backend"
2, npm run dev
## frontend
1, cd "c:\xampp\htdocs\Online Voting System\frontend"
2, npm start