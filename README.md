# Coupon Management System

A full-stack web application for fair and controlled coupon distribution with an admin panel for coupon management.

## 🔑 Admin Login Credentials
```
Username: admin
Password: admin123
```

## 📋 Project Overview

This system ensures fair and controlled coupon distribution by assigning coupons sequentially to users while implementing security measures to prevent abuse. Users can claim a coupon without logging in, while admins can manage coupons through a secure dashboard.

![Application Screenshot](Demo/image1.png)


![Application Screenshot](Demo/image2.png)

![Application Screenshot](Demo/image.png)


### Demo Video
[Watch Demo Video](https://drive.google.com/file/d/1L90nPGG6Gevr4GYy8ut-4io0YRv0QCBj/view?usp=sharing)

## ✅ Tech Stack Used

- **Frontend**: React.js (Vite) + Tailwind CSS
- **Backend**: Flask (Python)
- **Database**: MongoDB
- **Authentication**: JWT (for Admin Panel)
- **Security Measures**: IP tracking, cookie-based tracking

## 🔹 Key Features

- Coupons are assigned in order (round-robin style)
- Users can claim a coupon without logging in
- Security mechanisms prevent multiple claims from the same user
- Admin panel allows coupon management, history tracking, and security control
- The app is live-deployed and accessible publicly

## 🔹 System Workflow & Functionality

### 1️⃣ User Side (Coupon Claiming System)

#### ✅ How Users Claim Coupons
1. User visits the home page (/)
2. Clicks the "Claim Coupon" button
3. The system checks:
   - Has this IP address claimed a coupon within 24 hours?
   - Has this browser session already claimed a coupon?
4. If eligible:
   - The next available coupon is assigned to the user (round-robin)
   - The claim is stored in the database with the user's IP address & session ID
   - The user sees a success message with their coupon code
5. If not eligible:
   - A warning message is displayed: "You can only claim one coupon every 24 hours"

#### 🛡️ Abuse Prevention (Security)
- **IP Tracking**: Ensures a single claim per IP per 24 hours
- **Session Tracking**: Uses browser cookies to prevent multiple claims from the same device

#### 📌 User History Page (/history)
- Displays previously claimed coupons with timestamps

### 2️⃣ Admin Side (Coupon Management)

#### ✅ How Admins Manage Coupons
1. **Admin logs in (/admin)**
   - Uses username & password (securely hashed)
   - Gets a JWT token for session authentication

2. **Admin Dashboard (/dashboard)**
   - View all coupons (available & claimed)
   - View who claimed which coupon (IP/session info)

3. **Manage Coupons**
   - Add a new coupon (ensuring unique codes)
   - Update an existing coupon (modify code)
   - Delete coupons (removes from database)
   - Toggle coupon availability (mark as available/claimed)

4. **View User Claims (/admin/claims)**
   - See who claimed coupons, including IP & session tracking
   - Detects suspicious activity (e.g., multiple claims from the same IP)

#### 🔒 Security for Admin Panel
- JWT Authentication for secure login
- Protected Routes (Admin pages cannot be accessed without login)
- Encrypted Passwords (hashed using bcrypt)

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB

### Frontend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/HarshadSanjayKarale/RoundRobinCoupon.git
   cd RoundRobinCoupon
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start development server
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory
   ```
   MONGO_URI=mongodb+srv://harshad:harshad@salesstudio.qj2ig.mongodb.net/
   DB_NAME=coupon_system
   SECRET_KEY=lkjdhfgdfgkmzdfk
   CLAIM_COOLDOWN=24
   ADMIN_DEFAULT_PASSWORD=admin123
   ```

5. Start the Flask server
   ```bash
   python app.py
   ```

## 🔹 Tech Breakdown & Implementation

### Frontend (React.js + Vite + Tailwind CSS)
- **Reusable Components**:
  - `Home.jsx` → Users claim coupons
  - `ClaimHistory.jsx` → Displays previous claims
  - `AdminLogin.jsx` → Admin login form
  - `AdminDashboard.jsx` → Manage coupons
  - `Navbar.jsx` → Navigation across the app
- **State Management**: React Hooks (useState, useEffect)
- **API Calls**: Axios (GET, POST, PATCH, DELETE)

### Backend (Flask + MongoDB)
- **Flask App** (app.py)
- **API Routes**:
  - `/claim-coupon` → Assigns a coupon
  - `/user-history` → Fetch claim history
  - `/admin/login` → Authenticates admin
  - `/admin/coupons` → Fetches all coupons
  - `/admin/add-coupon` → Adds new coupons
  - `/admin/update-coupon` → Updates coupon details
  - `/admin/toggle-coupon` → Changes coupon availability
  - `/admin/delete-coupon` → Deletes a coupon
  - `/admin/claims` → Fetches user claim history
- **Database** (MongoDB)
  - `coupons` → Stores coupon codes & status
  - `claims` → Stores user claims (IP, session, timestamps)
  - `admin` → Stores admin credentials (hashed)

### Deployment
- **Backend**: Deployed on Render/Heroku
- **Frontend**: Hosted on Vercel/Netlify
- **Database**: MongoDB Atlas (Cloud-based)

## 🔹 Key Testing Scenarios

### ✅ User Side
- First-time claim → Should receive a coupon
- Multiple claims (same IP, within 24 hours) → Should be blocked
- New device (different IP) → Should allow claim
- Check claim history → Displays previous claims

### ✅ Admin Side
- Login with correct credentials → Access granted
- Login with incorrect credentials → Error message displayed
- View all coupons → List loads correctly
- Add, Update, Delete a coupon → Changes reflect immediately
- Check claim logs → Shows claim history with IP/session tracking

### ✅ Security Tests
- Try claiming without a session ID → Should be blocked
- Try accessing admin panel without login → Should redirect to login page
- Send multiple rapid requests (DDoS test) → API should limit requests

## 🎯 Why This Project is Powerful
- ✅ **Automated & Fair** → Round-robin ensures even distribution
- ✅ **User-Friendly** → No login required for claiming coupons
- ✅ **Secure** → Multiple security layers prevent abuse
- ✅ **Scalable** → Can support thousands of users
- ✅ **Real-World Use Case** → Can be applied for promotional campaigns, giveaways, and loyalty programs


## 👨‍💻 Author
Harshad Sanjay Karale