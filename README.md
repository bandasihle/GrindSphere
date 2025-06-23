# HustleSphere

**HustleSphere** is a full-stack web platform designed to connect students at the University of Mpumalanga by allowing them to advertise and find side hustles (services) on campus. The platform is tailored for university environments, addressing the need for a centralized, efficient, and professional space to promote student-run services — replacing cluttered academic WhatsApp groups.

---

## 🧠 Project Motivation

Students on campus offer valuable services like:
- Hair braiding
- Tutoring
- Photography
- Graphic design
- Printing
- And more…

However, most of them promote their services in **academic WhatsApp groups**, where messages get lost under unrelated conversations. There was **no organized way to connect hustlers with interested customers**.  
**HustleSphere** solves this by providing a searchable, organized platform — *built by students, for students*.

---

## 🌐 Website Overview

### 👥 User Roles
- **Hustlers:** Students offering a service
- **Customers:** Students looking to find and hire services

### 🧩 Key Features

#### ✅ Authentication
- Separate sign-up and login for Hustlers and Customers
- Secure password storage with hashing

#### 🛠️ Hustler Dashboard
- Create, update, and delete services
- Each service includes: name, description, category, contact info, and price

#### 🔍 Customer Service Search
- Search bar for finding services by keyword
- View all active hustler services in a clean, card-based layout

#### 🖥️ Responsive Design
- Works on both desktop and mobile devices
- Clean UI for ease of use

---

## ⚙️ Tech Stack

| Layer      | Technology               |
|------------|---------------------------|
| Frontend   | HTML, CSS, JavaScript     |
| Backend    | Node.js, Express.js       |
| Database   | MySQL (via XAMPP)         |
| Hosting/Testing | Localhost             |

---

## 📁 Project Structure

Side-Hustle-Web-Dev-1/
├── backend/
│ └── nodejs/
│ ├── server.js
│ ├── package.json
│ └── routes/ (e.g., auth.js, hustlers.js)
├── frontend/
│ ├── index.html
│ ├── login.html
│ ├── signup.html
│ ├── dashboard.html
│ └── styles/
└── README.md



---

## 🧪 How to Run Locally

### Prerequisites
- Node.js installed
- XAMPP with MySQL running
- Git (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Side-Hustle-Web-Dev-1.git
cd Side-Hustle-Web-Dev-1/backend/nodejs
2. Install Dependencies
bash
Copy
Edit
npm install
3. Set Up the Database
Open XAMPP and start Apache and MySQL

Create a database named: grind_sphere

Import the SQL file with tables like users and services
(Make sure users table has a hustler_id and proper login fields)

4. Start the Server
bash
Copy
Edit
node server.js
Server will run at: http://localhost:3000

5. Open the Frontend
Open the HTML files (e.g., index.html) in your browser using Live Server or file path.

🛡️ Security & Validation
User inputs are validated to prevent SQL injection.

Passwords are stored using hashing (e.g., bcrypt).

Authentication uses session/cookie logic or token-based approach (depending on implementation).

🚀 Future Improvements
Ratings & reviews for hustlers

Profile pages for each hustler

Filter by category (e.g., tutoring, beauty, printing)

Booking system or messaging feature

Admin panel for moderation

Deployment to live servet



📜 License
This project is for educational purposes under the University of Mpumalanga Web Development module.
