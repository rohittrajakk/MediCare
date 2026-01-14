 MediCare - Hospital Management System

A production-ready Hospital Management System built with **Spring Boot 3** and **React**.

## ✨ Features

### Patient Features
- 📝 Registration & Login with BCrypt encryption
- 📅 Book appointments with doctors
- 📋 View appointment history
- 📁 Access medical records
- 💳 Make payments (UPI/Card)
- 📥 Download prescriptions

### Doctor Features
- 👨‍⚕️ Manage appointments
- ✅ Confirm/Complete appointments
- 📝 Add medical records
- 💊 Prescribe medications

### Admin Features
- 📊 Dashboard with statistics
- 💰 Revenue reports with date filtering
- 👥 Manage patients & doctors
- 📈 System analytics

---

## 🏗️ Architecture

```
MediCare/
├── src/main/java/com/HMS/MediCare/
│   ├── controller/     # REST Controllers
│   ├── dto/            # Request/Response DTOs
│   ├── entity/         # JPA Entities
│   ├── repository/     # Data Access Layer
│   ├── service/        # Business Logic
│   ├── exception/      # Global Exception Handling
│   ├── config/         # Configuration
│   └── enums/          # Enumerations
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Page Components
│   │   └── services/   # API Services
└── postman/            # API Collection
```

---

## 🗄️ Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   PATIENT   │     │   DOCTOR    │     │   APPOINTMENT   │
├─────────────┤     ├─────────────┤     ├─────────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)         │
│ name        │     │ name        │     │ patient_id (FK) │
│ email       │◄────┤ email       ├────►│ doctor_id (FK)  │
│ password    │     │ password    │     │ date            │
│ phone       │     │ phone       │     │ time_slot       │
│ age         │     │ special..   │     │ status          │
│ gender      │     │ fee         │     │ symptoms        │
│ blood_group │     │ experience  │     │ created_at      │
└──────┬──────┘     └─────────────┘     └────────┬────────┘
       │                                         │
       │        ┌─────────────────┐              │
       │        │ MEDICAL_RECORD  │              │
       │        ├─────────────────┤              │
       └───────►│ patient_id (FK) │◄─────────────┘
                │ doctor_id (FK)  │
                │ appointment_id  │
                │ diagnosis       │
                │ prescription    │
                │ dosage          │
                └─────────────────┘
                         │
                ┌────────┴────────┐
                │    PAYMENT      │
                ├─────────────────┤
                │ appointment_id  │
                │ patient_id (FK) │
                │ doctor_id (FK)  │
                │ amount          │
                │ status          │
                │ transaction_id  │
                └─────────────────┘
```

---

## 🚀 Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 15+
- Node.js 18+

### Step 1: Database Setup
```sql
CREATE DATABASE hospital_db;
```

### Step 2: Configure Backend
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hospital_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### Step 3: Build Frontend (One-Time)
```bash
cd frontend
npm install
npm run build
```
This builds React into `src/main/resources/static/`

### Step 4: Run from IDE (Eclipse/IntelliJ)
1. Open project in IDE
2. Run `MediCareApplication.java`
3. Access at: **http://localhost:8080**

### Alternative: Run via Maven
```bash
./mvnw spring-boot:run
```

### 📍 Single Port Access (8080)
After building frontend, everything runs on **http://localhost:8080**:
- Frontend UI: http://localhost:8080
- API endpoints: http://localhost:8080/api/*
- Swagger UI: http://localhost:8080/swagger-ui.html

---

## 📡 API Endpoints

### Patient APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/register` | Register patient |
| POST | `/api/patients/login` | Login |
| GET | `/api/patients/{id}` | Get patient |
| POST | `/api/patients/{id}/appointments` | Book appointment |
| GET | `/api/patients/{id}/appointments` | Get appointments |
| GET | `/api/patients/{id}/records` | Get records |

### Doctor APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doctors` | Create doctor |
| GET | `/api/doctors` | List doctors |
| GET | `/api/doctors/{id}/slots?date=` | Get available slots |
| POST | `/api/doctors/{id}/records` | Add medical record |

### Appointment APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/appointments/{id}/cancel` | Cancel |
| PATCH | `/api/appointments/{id}/confirm` | Confirm |
| PATCH | `/api/appointments/{id}/complete` | Complete |

### Payment APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| POST | `/api/payments/{id}/process` | Process payment |
| PATCH | `/api/payments/{id}/status` | Update status |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get stats |
| GET | `/api/admin/revenue` | Revenue report |

---

## 🧪 Testing

### Using Postman
Import `postman/MediCare_API_Collection.json`

### Sample Workflow
1. Register a patient
2. Create a doctor
3. Patient books appointment
4. Doctor confirms appointment
5. Doctor adds medical record (auto-completes appointment)
6. Create payment
7. Process payment

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medicare.com | admin123 |
| Patient | (register new) | - |
| Doctor | (create via API) | - |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.5.9, Java 17 |
| Database | PostgreSQL, Spring Data JPA |
| Validation | Jakarta Validation |
| API Docs | SpringDoc OpenAPI (Swagger) |
| Security | BCrypt Password Encryption |
| Frontend | React 18, Vite, Axios |
| Styling | Custom CSS (Hospital-grade UI) |

---

## 📦 Deployment

### Backend (JAR)
```bash
./mvnw clean package
java -jar target/MediCare-0.0.1-SNAPSHOT.jar
```

### Frontend (Static)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

---

## 📄 License

MIT License - Feel free to use for personal/commercial projects.

---

**Built with ❤️ for better healthcare management**
