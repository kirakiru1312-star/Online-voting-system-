# 🗳️ Online Voting System — Distributed Edition

A secure web-based Online Voting System built with React, Node.js, and MongoDB.
Upgraded to a **Distributed System** with multiple independent backend services and multiple databases.

---

## 🧠 What is a Distributed System? (Simple Explanation)

Imagine a **hospital** with different departments:

- The **Reception** handles patient registration
- The **Pharmacy** handles medicines
- The **Lab** handles test results

Each department works **independently** but they all serve the same hospital.

This project works the same way. Instead of one big backend doing everything, we split it into **3 separate services**, each with its **own database**.

---

## 🏗️ How the System is Divided

### Before (Monolithic — one big backend)
```
Frontend → backend/server.js (port 5000) → voting_system (one database)
```
Everything was in one place. If the vote system crashed, everything crashed.

### After (Distributed — 3 independent services)
```
Frontend → API Gateway (port 5000)
                ├── Auth Service    (port 5001) → db_auth
                ├── Election Service(port 5002) → db_election
                └── Voting Service  (port 5003) → db_voting
```
Each service runs independently. If one has a problem, the others keep working.

---

## 🔧 The 4 Components

### 1. 🔐 Auth Service — Port 5001 — Database: `db_auth`
**What it does:** Handles everything about users.

**Examples:**
- A voter registers → saved in `db_auth`
- A voter logs in → Auth Service checks the password
- Admin views voter list → Auth Service returns it

**Collections in `db_auth`:**
| Collection | What it stores |
|---|---|
| `users` | All registered voters and admins |
| `auditlogs` | Every action (login, vote, etc.) with timestamp |

---

### 2. 🗳️ Election Service — Port 5002 — Database: `db_election`
**What it does:** Handles elections, parties, candidates, and contact messages.

**Examples:**
- Admin creates a new election → saved in `db_election`
- Admin adds a political party with a logo → saved in `db_election`
- Voter views the list of parties → Election Service returns them
- Voter sends a contact message → saved in `db_election`

**Collections in `db_election`:**
| Collection | What it stores |
|---|---|
| `elections` | All elections (title, dates, status) |
| `parties` | Political parties with logos |
| `candidates` | Independent candidates |
| `contactmessages` | Messages sent by voters |

---

### 3. 📊 Voting Service — Port 5003 — Database: `db_voting`
**What it does:** Handles vote casting and results.

**Examples:**
- Voter clicks "Vote for Party X" → saved in `db_voting`
- System checks if voter already voted → checks `db_voting`
- Admin views vote tally → Voting Service counts from `db_voting`

**Collections in `db_voting`:**
| Collection | What it stores |
|---|---|
| `finalvotes` | Every vote cast (one per voter) |
| `votelogs` | Vote attempt history (success/rejected) |
| `partyvotes` | Party vote records |

---

### 4. 🌐 API Gateway — Port 5000
**What it does:** Acts as the **front door** for the entire system.

The frontend always talks to port 5000. The Gateway decides which service to forward the request to.

**Example:**
```
Voter logs in  → Gateway → Auth Service (5001)
Voter views parties → Gateway → Election Service (5002)
Voter casts vote → Gateway → Voting Service (5003)
```

The frontend never needs to know about the 3 services. It only talks to the Gateway.

---

## 🗄️ The 4 Databases

| Database | Used By | Purpose |
|---|---|---|
| `voting_system` | Original backend | Original data (untouched) |
| `db_auth` | Auth Service | Users and audit logs |
| `db_election` | Election Service | Elections, parties, candidates |
| `db_voting` | Voting Service | Votes and results |

---

## 🔗 How Services Talk to Each Other

Services communicate using HTTP API calls. Example:

1. Voter casts a vote → **Voting Service** receives the request
2. Voting Service calls **Auth Service** → "Is this user real? Have they voted before?"
3. Auth Service replies → "Yes, real user. Not voted yet."
4. Voting Service saves the vote → marks user as voted in **Auth Service**
5. Done ✅

---

## 📁 Project Structure

```
Online Voting System/
├── frontend/               ← React app (unchanged)
├── backend/                ← Original monolithic backend (still works)
├── auth-service/           ← Distributed: Auth Service (port 5001)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── .env
├── election-service/       ← Distributed: Election Service (port 5002)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── .env
├── voting-service/         ← Distributed: Voting Service (port 5003)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
├── gateway/                ← API Gateway (port 5000)
│   ├── server.js
│   └── .env
├── migrate.js              ← One-time data migration script
└── start-all.bat           ← Starts all 4 services at once
```

---

## 🚀 How to Run the Distributed System

### Step 1 — Start all 4 backend services
Double-click `start-all.bat` OR run each manually:

```bash
# Terminal 1
cd auth-service
npm start

# Terminal 2
cd election-service
npm start

# Terminal 3
cd voting-service
npm start

# Terminal 4
cd gateway
npm start
```

### Step 2 — Start the frontend
```bash
cd frontend
npm start
```

### Step 3 — Open the app
```
http://localhost:3000
```

---

## 🔄 Data Migration (Run Once)

If you need to copy existing data from `voting_system` into the distributed databases:

```bash
node migrate.js
```

This safely copies all data without deleting or modifying the original database.

---

## ⚙️ Environment Variables

Each service has its own `.env` file:

| Service | Port | Database |
|---|---|---|
| `auth-service/.env` | 5001 | `db_auth` |
| `election-service/.env` | 5002 | `db_election` |
| `voting-service/.env` | 5003 | `db_voting` |
| `gateway/.env` | 5000 | — |
| `frontend/.env` | 3000 | — |

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Axios, React Router
- **Backend:** Node.js, Express.js (4 separate services)
- **Database:** MongoDB (4 separate databases)
- **Auth:** JWT, bcrypt
- **Gateway:** http-proxy-middleware
- **Service Communication:** HTTP (Axios)
