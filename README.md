# 👁️ ARGUS — Smart Lost & Found Portal

**ARGUS** is an all-seeing, modern Lost and Found portal designed to effortlessly reconnect people with their lost belongings. Built on the **MERN Stack** (MongoDB, Express.js, React, Node.js), ARGUS provides an intuitive, secure, and automated platform for posting lost items, listing found objects, matching reports, and managing claim verifications.

---

## ✨ Features

- **🔍 Intelligent Search & Filtering**: Search lost and found items by category, location, date range, status, or keywords.
- **📢 Item Reporting**: Quick and easy form submission to report lost or found items with photo uploads, detailed descriptions, and location tagging.
- **🤖 Automated Matching Assistance**: System algorithms help suggest potential matches between lost report details and newly found item submissions.
- **🛡️ Secure Claim & Verification**: Claim verification workflow allowing item finders/admins to verify ownership before facilitating item handover.
- **🔔 Notifications & Alerts**: Real-time updates and email alerts when a potential match for a lost item is posted.
- **👤 User Profiles & Dashboard**: Manage your active reports, track item claim statuses, and view complete activity history.
- **⚙️ Admin & Moderation Panel**: Powerful dashboard for admins to manage flagged listings, approve claims, manage user roles, and view portal analytics.

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js** (Single Page Application architecture)
- **React Router DOM** (Client-side routing)
- **Axios** (HTTP Client for REST API communication)
- **Modern CSS / UI Components** (Responsive layout & smooth transitions)

### **Backend**
- **Node.js** (JavaScript runtime environment)
- **Express.js** (Web framework for building RESTful APIs)
- **JSON Web Tokens (JWT)** & **bcryptjs** (Authentication & password hashing)
- **Multer / Cloudinary** (Image handling and cloud storage integration)

### **Database**
- **MongoDB** (NoSQL Document Database)
- **Mongoose** (ODM for schema modeling and validation)

---

## 📁 Project Structure

```text
ARGUS-Portal/
├── Backend/                 # Express.js Server & REST API
│   ├── config/              # Database connection & environment setups
│   ├── controllers/         # Request handling & business logic
│   ├── middleware/          # Authentication & file upload middleware
│   ├── models/              # Mongoose schemas (User, Item, Claim, etc.)
│   ├── routes/              # Express API route endpoints
│   ├── utils/               # Helper utilities & notification services
│   ├── .env.example         # Sample environment variables for backend
│   ├── package.json
│   └── server.js            # Server entry point
│
├── Frontend/                # React.js Client Application
│   ├── public/              # Static assets & index.html
│   ├── src/
│   │   ├── assets/          # Images, icons, and static files
│   │   ├── components/      # Reusable UI components (Navbar, Cards, Modals)
│   │   ├── context/         # React Context (Auth, Notification state)
│   │   ├── pages/           # Application views (Home, Lost, Found, Dashboard, Admin)
│   │   ├── services/        # API service modules
│   │   ├── styles/          # Custom CSS & layout styling
│   │   ├── App.jsx          # Main component & router configuration
│   │   └── main.jsx         # Application entry point
│   ├── .env.example         # Sample environment variables for frontend
│   └── package.json
│
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### **Prerequisites**
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB Local Server](https://www.mongodb.com/try/download/community) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI

---

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/ARGUS-Portal.git
cd ARGUS-Portal
```

---

### **2. Backend Setup**
Navigate to the `Backend` folder, install dependencies, and setup environment variables:

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory using `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/argus_db
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend development server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

---

### **3. Frontend Setup**
Open a new terminal window, navigate to the `Frontend` folder, install dependencies, and launch the React app:

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
# App will run on http://localhost:5173 (or http://localhost:3000)
```

---

## 🌐 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login user & return JWT token | ❌ |
| `GET` | `/api/items` | Get list of lost and found items (with filters) | ❌ |
| `GET` | `/api/items/:id` | Get detailed information for a specific item | ❌ |
| `POST` | `/api/items` | Create a new lost or found item report | ✅ |
| `PUT` | `/api/items/:id` | Update an item report (owner/admin) | ✅ |
| `DELETE` | `/api/items/:id` | Delete an item report | ✅ |
| `POST` | `/api/claims` | Submit a claim request for a found item | ✅ |
| `PUT` | `/api/claims/:id/status` | Update claim status (Approved / Rejected) | ✅ |
| `GET` | `/api/users/profile` | Get current user profile and activity | ✅ |

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **AI-Powered Image Recognition**: Automatically match uploaded item photos using computer vision.
- [ ] **Location Mapping Integration**: Interactive Google Maps / Leaflet integration for pinning exact lost/found locations.
- [ ] **In-App Messaging**: Private chat between item finder and claimant.
- [ ] **QR Code Tagging**: Generate unique printable QR code stickers for personal items.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve ARGUS.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
