# ARGUS Portal Development Rules

## Project Overview

ARGUS Portal is a Lost and Found web application developed using the MERN stack.

The project is a university-level software engineering project. 
The code must be simple, readable, maintainable, and easy to explain during a technical viva.

The priority is:
1. Functionality
2. Clean architecture
3. Readable code
4. Easy debugging
5. Good development practices

Avoid unnecessary complexity and enterprise-level patterns.

---

# Technology Stack

## Frontend

- React.js with Vite
- JavaScript
- React Router DOM
- Axios
- Tailwind CSS


## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose


## Authentication

- JWT authentication
- bcrypt password hashing


---

# Development Principles

## Code Quality

Always:

- Write clean and readable code.
- Use meaningful variable and function names.
- Keep files small and organized.
- Add comments for important logic.
- Use async/await instead of complex promise chains.
- Handle errors properly.
- Avoid duplicate code.

The code should be understandable by a second-year undergraduate student.

---

# Backend Architecture

Use a simple MVC architecture.

Structure:

backend/

├── server.js

├── config/
│   └── db.js

├── models/

├── controllers/

├── routes/

├── middleware/

└── utils/


Responsibilities:

## Models

Only contain MongoDB schemas.

## Controllers

Contain application logic.

## Routes

Only define API endpoints and connect controllers.

## Middleware

Used for authentication and error handling.


---

# Database Rules

Use MongoDB Atlas with Mongoose.

Main collections:


## User

Fields:

- name
- email
- password
- profileImage (optional)
- createdAt


## Item

Fields:

- title
- description
- category
- type (LOST or FOUND)
- location
- date
- imageUrl
- contact
- owner
- status
- createdAt


Item status:

- ACTIVE
- CLAIMED
- CLOSED


---

# Authentication Rules

Authentication must follow:

Register:

User enters details
↓
Password encrypted using bcrypt
↓
Saved in MongoDB


Login:

User credentials verified
↓
JWT generated
↓
Authentication maintained securely


Rules:

- Never store plain passwords.
- Never return passwords in API responses.
- Protect private routes using authentication middleware.
- Keep authentication logic simple and explainable.


---

# API Development Rules

Use REST API principles.

Routes format:


Authentication:

/api/auth


Users:

/api/users


Items:

/api/items


Use proper HTTP methods:

GET:
Retrieve data

POST:
Create data

PUT:
Update data

DELETE:
Remove data


Always return meaningful status codes:

200:
Success

201:
Created

400:
Bad request

401:
Unauthorized

404:
Not found

500:
Server error


---

# Frontend Rules

Use React components.

Structure:

frontend/src/

├── components/

├── pages/

├── services/

├── context/

└── App.jsx


Rules:

- Create reusable components.
- Keep pages simple.
- Use Axios for API communication.
- Use React Router for navigation.
- Show loading states.
- Show error messages.
- Keep UI clean and responsive.


---

# Security Rules

Mandatory:

- Use bcrypt for password hashing.
- Store sensitive information in .env.
- Never hardcode database credentials.
- Never expose passwords.
- Validate important user inputs.
- Use CORS configuration properly.


---

# GitHub Development Rules

The project must show continuous development.

Create meaningful commits.

Examples:

Initial project structure

Setup backend server

Connect MongoDB database

Create user authentication

Create item model

Implement lost item API

Create React pages

Connect frontend with backend

Improve UI


Never create one huge final commit.

---

# AI Agent Rules

Before creating major features:

1. Explain the implementation plan.
2. Wait for approval.
3. Create files.
4. Explain what was changed.

Do not:
- Delete existing working features.
- Rewrite the entire project unnecessarily.
- Add technologies not requested.
- Create overly complex solutions.

---

# Testing Rules

Before completing a feature:

Check:

- Server starts correctly.
- API endpoints work.
- Database connection works.
- Frontend builds successfully.
- No missing imports.
- No syntax errors.


---

# Documentation Rules

Maintain:

README.md

Include:

- Project description
- Features
- Installation steps
- Environment setup
- Running instructions


Create:

PROJECT_EXPLANATION.md

Explain:

- System architecture
- Database design
- API flow
- Frontend-backend communication


Create:

VIVA_GUIDE.md

Include:

- Important concepts
- Possible viva questions
- Simple explanations


---

# Final Goal

Create a fully functional Lost and Found MERN application that:

- Works correctly.
- Is easy to maintain.
- Can be explained confidently in a university viva.
- Shows professional GitHub development progress.
