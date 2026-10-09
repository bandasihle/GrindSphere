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

```
GrindSphere/
├── backend/
│   ├── server.js          Express server: auth, services, uploads
│   ├── db.js              MySQL connection
│   ├── admin/             admin routes and controller
│   ├── views/             EJS templates
│   └── uploads/           service images uploaded by hustlers
├── frontend/
│   ├── index.html, about.html, contact.html, team.html
│   ├── authentication/    login and sign-up pages
│   ├── dashboards/        customer and hustler dashboards
│   ├── admin/             admin dashboard
│   ├── services/          service listing pages
│   └── css/, images/, script.js
├── package.json
└── README.md
```

---

## 🧪 How to Run Locally

### Prerequisites
- Node.js
- XAMPP with MySQL running

### 1. Clone and install

```bash
git clone https://github.com/bandasihle/GrindSphere
cd GrindSphere
npm install
```

### 2. Set up the database

1. Open XAMPP and start **Apache** and **MySQL**.
2. Create a database named `grind_sphere`.
3. Create the tables the server uses. The SQL file is not in this repo yet, so create them in phpMyAdmin:
   - `users`: `id`, `name`, `email`, `password`, `role` (`hustler` or `customer`), `skill`, `is_admin`
   - `services`: `id`, `hustler_id`, `title`, `description`, `price`, `category`, `location`, `image_url`
   - `bookings`: `id`, `service_id`, `customer_id`, `status`

The connection settings (user `root`, no password, port 3306) are in `backend/db.js`.

### 3. Start the server

```bash
node backend/server.js
```

The server runs at http://localhost:3000.

### 4. Open the frontend

Open `frontend/index.html` with VS Code Live Server (or straight from the folder).

---

## 🛡️ Security & Validation
- Database queries use placeholders (`?`), which protects against SQL injection.
- Passwords are hashed with bcrypt.
- `/admin/create-admin` is a setup-only route with a default password. Remove it, or change the password, before putting the site online.

---

## 🚀 Future Improvements
- Ratings and reviews for hustlers
- Profile pages for each hustler
- Filter by category (e.g. tutoring, beauty, printing)
- Booking system or messaging
- Admin panel for moderation
- Deployment to a live server

---

## 📜 License
This project is for educational purposes under the University of Mpumalanga Web Development module.
