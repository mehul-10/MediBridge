# MediBridge 🏥
### Healthcare Management & Clinical Coordination Platform

MediBridge is a web-based healthcare management platform designed to simplify patient information management, clinical documentation, and communication between healthcare stakeholders. It provides a centralized interface for managing clinical records and supporting healthcare workflows with AI-assisted features.

🌐 **Live Demo:** [https://medibridge-two.vercel.app/](https://medibridge-two.vercel.app/)

---

## 📌 Project Overview

Healthcare information is often distributed across different systems, making it difficult to manage patient records, access clinical documents, and coordinate care efficiently.

MediBridge aims to address these challenges through a centralized platform that combines healthcare record management, document handling, secure authentication, and AI-assisted clinical handovers.

The project is developed using the MERN stack, with a React-based frontend and a Node.js/Express backend connected to MongoDB.

## ✨ Key Features

- **User Authentication:** Secure registration and login using JWT-based authentication.
- **Healthcare Management:** Centralized management of patient information and clinical records.
- **Clinical Documents:** Upload, view, download, edit, and manage clinical documents.
- **Camera Capture:** Capture clinical photos directly through the device camera, with front and back camera switching where supported.
- **AI Handover Assistant:** Generate AI-assisted clinical handover summaries from clinical notes.
- **Record Sharing:** Manage access and sharing permissions for clinical information.
- **Audit Logging:** Maintain activity records for important operations.
- **Responsive Interface:** User-friendly interface designed for different screen sizes.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT) |
| API Communication | Axios, REST API |
| AI Integration | OpenAI API |
| Icons | Lucide React |
| Deployment | Vercel, Render |
| Development Tools | VS Code, Git, GitHub |

## 🏗️ System Architecture

MediBridge follows a client-server architecture.

```text
              ┌──────────────────────┐
              │       User           │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   React Frontend     │
              │   (Vercel)           │
              └──────────┬───────────┘
                         │
                    REST API
                         │
                         ▼
              ┌──────────────────────┐
              │  Node.js + Express   │
              │  Backend (Render)    │
              └──────────┬───────────┘
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
       ┌──────────────┐    ┌────────────────┐
       │   MongoDB    │    │   AI Service   │
       │   Database   │    │   Integration  │
       └──────────────┘    └────────────────┘
```

## 📂 Project Structure

```text
MediBridge/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   ├── package.json
│   └── index.html
│
└── README.md
```

*Note: This is a high-level representation of the project structure.*

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mehul-10/MediBridge.git
cd MediBridge
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure the backend environment variables in a `.env` file according to the application's configuration.

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend API URL in its environment configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The application will be available at the local Vite development URL shown in the terminal.

## 🌐 Live Deployment

| Component | Platform | URL |
|---|---|---|
| Frontend | Vercel | [MediBridge Live](https://medibridge-two.vercel.app/) |
| Backend | Render | [Backend Service](https://medibridge-backend-173e.onrender.com) |

**API Base URL:**

```text
https://medibridge-backend-173e.onrender.com/api
```

## 🔐 Security Considerations

- JWT-based authentication for protected operations.
- Environment variables for sensitive configuration.
- Backend-side validation and authorization.
- Audit logging for important user activities.
- Access permissions for shared clinical information.

**Disclaimer:** MediBridge is an academic project and prototype. It should not be treated as a certified medical device or a substitute for professional medical judgment. Use appropriate test data rather than real patient information.

## 🚀 Future Enhancements

- Integration with additional healthcare systems.
- Improved AI-assisted clinical documentation.
- Advanced analytics and reporting dashboards.
- Enhanced patient-provider communication.
- Additional document processing and management capabilities.
- More comprehensive role-based access controls.

## 👨‍💻 Developer

**Mehul Gupta**

B.Tech Computer Science and Engineering

- GitHub: [@mehul-10](https://github.com/mehul-10)
- LinkedIn: [Mehul Gupta](https://linkedin.com/in/mehulgupta-developer/)

## 📄 License

This project is developed for academic and educational purposes.

---

⭐ If you find this project interesting, consider giving the repository a star!
