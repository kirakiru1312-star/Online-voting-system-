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

## 📋 Complete System Functions by Backend Service

This section documents every system function, classified by the backend service that handles it, including the user role involved.

---

### 🔐 Auth Service — Port 5001 — Database: `db_auth`

The Auth Service is the security and identity node of the system. It is responsible for all user-related operations including authentication, authorization, profile management, and system audit logging.

#### Voter Functions

| # | Function | Description |
|---|---|---|
| 1 | **Voter Registration** | A new voter submits their personal information (name, email, password, age, phone, national ID, profession, region, sub-city, kebele). The system validates uniqueness of email, phone, and national ID, hashes the password using bcrypt, and creates a new user account in `db_auth`. |
| 2 | **Voter Login** | A voter submits their email and password. The Auth Service verifies the credentials against `db_auth`, and if valid, generates and returns a JWT token used for all subsequent authenticated requests. |
| 3 | **View Own Profile** | An authenticated voter requests their full profile data. The Auth Service retrieves all stored personal information from `db_auth` and returns it to the frontend for display in the Update Profile page. |
| 4 | **Update Profile** | A voter who has not yet voted can update their registered personal information. The Auth Service validates the new data (same rules as registration), checks uniqueness of changed fields, and saves the updated record in `db_auth`. This function is automatically disabled after the voter casts a vote. |
| 5 | **Forgot Password — Request OTP** | A voter who forgot their password submits their registered email. The Auth Service generates a 6-digit one-time password (OTP), stores it with a 10-minute expiry in `db_auth`, and sends it to the voter's email via the email service. |
| 6 | **Forgot Password — Verify OTP** | The voter submits the 6-digit OTP received by email. The Auth Service checks the code against the stored value and expiry time in `db_auth`. If valid, the OTP is cleared and the voter is permitted to proceed to password reset. |
| 7 | **Forgot Password — Reset Password** | After OTP verification, the voter submits a new password. The Auth Service validates the password strength (minimum 8 characters, must contain at least one letter, one number, and one symbol), hashes it using bcrypt, and updates the record in `db_auth`. |
| 8 | **Vote Confirmation OTP** | Before casting a vote, the voter must verify their identity via OTP. The Auth Service generates and sends a 6-digit OTP to the voter's registered email, which must be entered to confirm the vote action. |
| 9 | **Get Current User (JWT Verification)** | On every page load, the frontend sends the stored JWT token to the Auth Service. The service verifies the token, retrieves the user record from `db_auth`, and returns the user's role, name, email, and voting status to maintain the authenticated session. |

#### Admin Functions

| # | Function | Description |
|---|---|---|
| 1 | **Admin Login** | The admin submits their credentials. The Auth Service verifies them against `db_auth` and returns a JWT token with the `admin` role, granting access to all administrative features. |
| 2 | **View Registered Voters** | The admin requests the full list of registered voters. The Auth Service queries `db_auth` for all users with the `voter` role and returns their profiles (excluding passwords) for display in the Voter Registry page. |
| 3 | **View Total Registered / Votes Cast** | The admin dashboard requests voter statistics. The Auth Service counts total registered voters and total voters who have cast a vote (`hasVoted: true`) from `db_auth` and returns the numbers for display. |
| 4 | **View Audit Logs** | The admin requests the system activity log. The Auth Service retrieves all audit log entries from `db_auth`, including action type, user, IP address, timestamp, and severity level, for display in the Security Audit page. |
| 5 | **Internal: Mark User as Voted** | After a vote is successfully cast, the Voting Service calls the Auth Service internally to set `hasVoted: true` and record `votedAt` timestamp for the voter in `db_auth`. This prevents the voter from voting again or updating their profile. |
| 6 | **Internal: Get User by ID** | The Election Service and Voting Service call this internal endpoint to retrieve a user's full profile by their ID when processing requests that require user data from `db_auth`. |
| 7 | **Internal: Receive Audit Log Entry** | The Election Service and Voting Service send audit log entries to the Auth Service via this internal endpoint. The Auth Service stores them in `db_auth`, centralizing all system activity records in one place. |

---

### 🗳️ Election Service — Port 5002 — Database: `db_election`

The Election Service is the administrative control node of the system. It manages all election-related data including elections, political parties, independent candidates, and contact messages.

#### Voter Functions

| # | Function | Description |
|---|---|---|
| 1 | **View Elections List** | A voter opens the Elections Portal page. The Election Service retrieves all elections from `db_election` and returns them, separated into active/upcoming and completed categories for display. |
| 2 | **View Political Parties** | A voter opens the Political Parties page. The Election Service retrieves all active political parties from `db_election`, including their names, abbreviations, logos, and descriptions, for display and voting. |
| 3 | **View Independent Candidates** | A voter opens the Independent Candidates page. The Election Service retrieves all active candidates from `db_election`, including their photos, biographies, and associated election details. |
| 4 | **View Single Election Details** | A voter clicks on a specific election. The Election Service retrieves the full details of that election and its associated candidates from `db_election` for display on the Election Detail page. |
| 5 | **Submit Contact Message** | A voter or guest submits a message through the Contact Us page. The Election Service saves the message (including sender name, email, phone, subject, and message body) in `db_election` for admin review. If the voter is logged in, their registered information is automatically attached. |

#### Admin Functions

| # | Function | Description |
|---|---|---|
| 1 | **Create Election** | The admin creates a new election by providing a title, description, start date, end date, status, and type (party, candidate, or both). The Election Service validates the input and saves the new election record in `db_election`. |
| 2 | **Update Election** | The admin modifies an existing election's details such as title, dates, status, or type. The Election Service updates the record in `db_election` and returns the updated election. |
| 3 | **Delete Election** | The admin removes an election from the system. The Election Service deletes the election record from `db_election`. |
| 4 | **Add Political Party** | The admin adds a new political party by providing its name, abbreviation, description, logo image, and reference URL. The Election Service saves the party record in `db_election` and stores the uploaded logo image in the shared uploads folder. |
| 5 | **Update Political Party** | The admin modifies an existing party's information or logo. The Election Service updates the party record in `db_election`. |
| 6 | **Delete Political Party** | The admin removes a political party. The Election Service first checks that no candidates are associated with the party, then deletes the record from `db_election`. |
| 7 | **Add Independent Candidate** | The admin registers a new independent candidate by providing their name, biography, photo, reference URL, and associated election. The Election Service saves the candidate record in `db_election`. |
| 8 | **Update Independent Candidate** | The admin modifies a candidate's information or photo. The Election Service updates the candidate record in `db_election`. |
| 9 | **Delete Independent Candidate** | The admin removes a candidate from the system. The Election Service deletes the candidate record from `db_election`. |
| 10 | **View Contact Messages** | The admin views all messages submitted through the Contact Us page. The Election Service retrieves all contact message records from `db_election`, sorted by date. |
| 11 | **View Contact Message Statistics** | The admin views a summary of contact messages (total, read, unread). The Election Service counts the records in `db_election` and returns the statistics. |
| 12 | **Mark Message as Read/Unread** | The admin toggles the read status of a contact message. The Election Service updates the `isRead` field of the message record in `db_election`. |
| 13 | **Reply to Contact Message** | The admin sends a reply to a voter's contact message. The Election Service saves the reply note and timestamp in `db_election` and sends the reply text to the voter's email via the email service. |
| 14 | **Delete Contact Message** | The admin removes a contact message from the system. The Election Service deletes the message record from `db_election`. |

---

### 📊 Voting Service — Port 5003 — Database: `db_voting`

The Voting Service is the high-concurrency write node of the system. It handles all vote-related operations including vote casting, duplicate prevention, result calculation, and vote log management.

#### Voter Functions

| # | Function | Description |
|---|---|---|
| 1 | **Check Voting Status** | When a voter opens the Parties or Candidates page, the system checks whether the voter has already cast a vote. The Voting Service queries `db_voting` for an existing vote record linked to the voter's ID and returns the result. |
| 2 | **Cast Vote for Political Party** | After OTP verification, a voter casts their vote for a selected political party. The Voting Service checks that no vote already exists for this voter in `db_voting`, saves the vote record with full voter demographic data, records a vote log entry, and notifies the Auth Service to mark the voter as voted. |
| 3 | **Cast Vote for Independent Candidate** | After OTP verification, a voter casts their vote for a selected independent candidate. The Voting Service verifies the candidate's election is active, checks for duplicate votes in `db_voting`, saves the vote record, records a vote log entry, and notifies the Auth Service to mark the voter as voted. |
| 4 | **View Election Results** | A voter views the final results of a completed election. The Voting Service retrieves vote counts from `db_voting`, fetches candidate and election details from the Election Service, calculates vote percentages, and returns the ranked results for display. |

#### Admin Functions

| # | Function | Description |
|---|---|---|
| 1 | **View Live Vote Tally** | The admin opens the Tally page to see real-time vote counts. The Voting Service aggregates all votes in `db_voting` grouped by party and candidate, fetches party and candidate names from the Election Service, and returns the complete tally with vote counts. |
| 2 | **View Vote Logs** | The admin views the history of all vote attempts. The Voting Service retrieves all vote log entries from `db_voting`, including voter ID, IP address, action type (success or rejected), vote type, and timestamp. |

---

### 🌐 API Gateway — Port 5000

The API Gateway is the single entry point for all frontend requests. It does not connect to any database. Its sole responsibility is to receive requests from the frontend and route them to the correct backend service based on the request path.

| Request Path | Routed To | Service |
|---|---|---|
| `/api/auth/*` | Port 5001 | Auth Service |
| `/api/admin/stats` | Port 5001 | Auth Service |
| `/api/admin/voters` | Port 5001 | Auth Service |
| `/api/admin/audit-logs` | Port 5001 | Auth Service |
| `/api/parties/vote` | Port 5003 | Voting Service |
| `/api/candidates/vote` | Port 5003 | Voting Service |
| `/api/votes/*` | Port 5003 | Voting Service |
| `/api/results/*` | Port 5003 | Voting Service |
| `/api/admin/tally` | Port 5003 | Voting Service |
| `/api/admin/logs` | Port 5003 | Voting Service |
| `/api/elections/*` | Port 5002 | Election Service |
| `/api/parties/*` | Port 5002 | Election Service |
| `/api/candidates/*` | Port 5002 | Election Service |
| `/api/contact/*` | Port 5002 | Election Service |
| `/uploads/*` | Port 5002 | Election Service |

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

## ❓ Instructor Q&A — Distributed System Explanation

---

### 1️⃣ How Many Backends and Databases Are Used?

This system uses **4 backend services** and **4 databases** in total.

#### Backend Services:

| # | Service | Port | Responsibility |
|---|---|---|---|
| 1 | `backend/` (original) | 5000 | Original monolithic backend (kept for safety) |
| 2 | `auth-service/` | 5001 | User registration, login, JWT, audit logs |
| 3 | `election-service/` | 5002 | Elections, parties, candidates, contact |
| 4 | `voting-service/` | 5003 | Vote casting, results, vote logs |
| — | `gateway/` | 5000 | Routes requests to the correct service |

> **Simple example:** Think of 3 separate restaurants in one food court. Each restaurant (service) cooks its own food (handles its own data). The food court entrance (gateway) directs customers to the right restaurant.

#### Each backend runs on a different port:
- Port `5001` → only Auth Service runs here
- Port `5002` → only Election Service runs here
- Port `5003` → only Voting Service runs here

This means they are **completely independent** — stopping one does not stop the others.

---

#### ▶️ How to Start Each Backend Individually:

```bash
# Start only Auth Service
cd auth-service
npm start

# Start only Election Service
cd election-service
npm start

# Start only Voting Service
cd voting-service
npm start

# Start only API Gateway
cd gateway
npm start

# Start Frontend
cd frontend
npm start
```

#### ▶️ How to Start All Together (using batch file):

Simply **double-click** `start-all.bat` in the project root folder.
It opens 5 separate terminal windows automatically — one for each service plus the frontend.

Or from PowerShell:
```powershell
.\start-all.bat
```

---

#### 👁️ How to View Each Database:

**Using MongoDB Compass (visual tool):**
1. Open MongoDB Compass
2. Connect to: `mongodb://127.0.0.1:27017`
3. In the left sidebar you will see all databases:
```
db_auth        ← click to see: users, auditlogs
db_election    ← click to see: elections, parties, candidates, contactmessages
db_voting      ← click to see: finalvotes, votelogs, partyvotes
voting_system  ← original database (untouched)
```
4. Click any collection name to browse all documents inside it.

**Using MongoDB Shell (command line):**
```bash
mongosh
show dbs
use db_auth
show collections
db.users.find()
```

---

### 2️⃣ Which Backend Connects to Which Database?

Each backend service connects **only to its own database** using a MongoDB connection string defined in its `.env` file.

#### Connection Map:

| Backend Service | Connects To | Connection String (in .env) |
|---|---|---|
| `auth-service` | `db_auth` | `MONGO_URI=mongodb://127.0.0.1:27017/db_auth` |
| `election-service` | `db_election` | `MONGO_URI=mongodb://127.0.0.1:27017/db_election` |
| `voting-service` | `db_voting` | `MONGO_URI=mongodb://127.0.0.1:27017/db_voting` |
| `backend` (original) | `voting_system` | `MONGO_URI=mongodb://127.0.0.1:27017/voting_system` |

#### Technology Used to Connect:
- **Mongoose** (MongoDB driver for Node.js) is used in every service
- Each service calls `mongoose.connect(process.env.MONGO_URI)` at startup
- The `MONGO_URI` value in each `.env` file points to a different database name

#### Simple Example (not full code):
```
auth-service/.env       →  MONGO_URI = .../db_auth
election-service/.env   →  MONGO_URI = .../db_election
voting-service/.env     →  MONGO_URI = .../db_voting
```

When `auth-service` starts, it connects **only** to `db_auth`.
It cannot read or write to `db_election` or `db_voting`.
This is called **data isolation**.

#### Why is this separation important?

| Reason | Explanation |
|---|---|
| **Security** | User passwords are only in `db_auth`. The voting service cannot access them. |
| **Performance** | High-traffic vote writes go to `db_voting` without slowing down user login in `db_auth`. |
| **Independence** | Each service can be updated, restarted, or scaled without affecting others. |
| **Fault isolation** | If `db_election` has a problem, voting and login still work normally. |

> **Simple example:** Your bank keeps your account balance in one system and your transaction history in another. If the transaction system is slow, you can still check your balance. Same idea here.

---

### 3️⃣ Why is the Old Backend (`backend/`) and Old Database (`voting_system`) Still There?

#### Short Answer:
The old backend and database were **kept intentionally** and were **never deleted or modified**. This is the correct and safe approach when upgrading a real system.

#### Detailed Explanation:

**Why they were NOT removed:**

| Reason | Explanation |
|---|---|
| **Data safety** | `voting_system` contains all real existing data — voters, parties, elections, votes. Deleting it would permanently lose this data. |
| **Feature safety** | The original `backend/` contains working logic for all features. Removing it before the new services are fully tested would break the system. |
| **Project constraints** | The project requirement strictly states: "Do NOT remove or change any existing functionality." |
| **Fallback option** | If any new service has a problem, the original backend can still be used as a backup. |

**Does keeping the old backend violate distributed system principles?**

**No.** In real-world distributed systems, the old system is always kept running during the transition period. This is called the **Strangler Fig Pattern** — a well-known industry approach where:

1. You build new services around the old system
2. You gradually move traffic to the new services
3. The old system stays running until the new one is fully stable
4. Only then (optionally) is the old system retired

**Real-world example:**
> Netflix did not shut down their old monolithic system overnight. They slowly moved features to microservices over several years while keeping the old system running. This is exactly what this project demonstrates.

#### Summary:

```
voting_system database   →  still exists, contains original data ✅
backend/ folder          →  still exists, still works ✅
New distributed services →  added on top, use separate databases ✅
No data was lost         →  migration script copied everything ✅
No features were broken  →  all original features still work ✅
```

Keeping the old system running alongside the new distributed services is **not a mistake** — it is the **correct, professional, and safe** way to upgrade a real system.

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
├── start-all.bat           ← Starts all 5 services + frontend at once
├── start-auth.bat          ← Starts Auth Service only
├── start-election.bat      ← Starts Election Service only
├── start-voting.bat        ← Starts Voting Service only
├── start-gateway.bat       ← Starts API Gateway only
└── start-frontend.bat      ← Starts Frontend only
```

---

## 🚀 How to Run the System

### Option A — Start Everything at Once
Double-click `start-all.bat` — opens 5 windows automatically.

### Option B — Start One Service at a Time

| Double-click this file | Starts |
|---|---|
| `start-auth.bat` | Auth Service (port 5001) |
| `start-election.bat` | Election Service (port 5002) |
| `start-voting.bat` | Voting Service (port 5003) |
| `start-gateway.bat` | API Gateway (port 5000) |
| `start-frontend.bat` | Frontend (port 3000) |

### Option C — Manual Commands (PowerShell)

```powershell
# Terminal 1
cd "C:\xampp\htdocs\Online Voting System\auth-service"
npm start

# Terminal 2
cd "C:\xampp\htdocs\Online Voting System\election-service"
npm start

# Terminal 3
cd "C:\xampp\htdocs\Online Voting System\voting-service"
npm start

# Terminal 4
cd "C:\xampp\htdocs\Online Voting System\gateway"
npm start

# Terminal 5
cd "C:\xampp\htdocs\Online Voting System\frontend"
npm start
```

Then open: **http://localhost:3000**

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
