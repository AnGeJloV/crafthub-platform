# CraftHub Platform

A specialized marketplace platform connecting local artisans and craftspeople with buyers. Features include secure seller verification, order management, built-in communication, and detailed analytics. BSUIR course project.

## ✨ Features

- **Role-Based Access Control (RBAC):** Secure ecosystem with three distinct roles: Buyer (`ROLE_USER`), Seller (`ROLE_SELLER`), and Administrator (`ROLE_ADMIN`). Includes JWT authentication and Google OAuth2 integration.
- **Secure Seller Verification:** A robust application system for users to become sellers. Includes dynamic forms based on legal status and automated PII (Personally Identifiable Information) deletion upon admin review to ensure data privacy.
- **Interactive Dashboards & Analytics:**
  - **Sellers:** Track gross revenue, net income, and view sales dynamics via interactive charts.
  - **Admins:** Monitor platform GMV, user growth, dispute rates, and a top-seller leaderboard.
- **PDF Report Export:** Server-side generation of detailed, formatted financial and performance reports using OpenPDF.
- **E-commerce Flow:** Complete shopping cart functionality with address memory, stock validation, and a "Secure Deal" order lifecycle (`Paid → Shipped → Delivered / Disputed`).
- **Real-time Communication:** Built-in chat system allowing buyers to communicate directly with artisans regarding specific products.
- **Review & Rating System:** Buyers can leave verified reviews after order completion, which dynamically recalculate product and seller average ratings. Admin moderation tools included.

## 🛠️ Technology Stack

### Backend
- Java 21
- Spring Boot 4.0.3
- Spring Security
- Spring Data JPA (Hibernate)
- JWT (JSON Web Tokens)
- OAuth2 Client (Google)
- OpenPDF
- Flyway
- Lombok

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router DOM
- Recharts
- React Hot Toast

### Database
- MySQL 8.0

### DevOps
- Docker
- Docker Compose

## 🚀 Getting Started

The easiest way to run the project is with Docker. It will automatically start the database, backend, and frontend services.

### Prerequisites

- Docker
- Docker Compose
- Free ports:
  - `8080` for backend
  - `5173` for frontend
  - `3307` for MySQL

### Installation and Run

#### 1. Clone the repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd crafthub-platform
```

#### 2. Configure environment variables (Google OAuth2)

To use Google Login, provide your own Google OAuth2 credentials.

Create a `.env` file in the project root, next to `docker-compose.yml`, and add:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

> **Note:** Without these variables, Google authentication may not work correctly.

#### 3. Run with Docker Compose

```bash
docker compose up --build
```

Docker will build the backend and frontend applications and start all services.

After startup:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`

#### 4. Database migrations and initial data

No manual database setup is required.

- Flyway automatically applies all SQL migrations from `backend/src/main/resources/db/migration`
- A custom `DataInitializer` detects an empty database on startup and populates it with categories, sample products, fake orders, reviews, and test users

#### 5. Default test accounts

Use these accounts to explore different roles in the application.

##### Administrator
- **Email:** `admin@crafthub.by`
- **Password:** `adminadmin`

##### Seller
- **Email:** `anna@crafthub.by`
- **Password:** `password`

##### Buyer
- **Email:** `ivan@crafthub.by`
- **Password:** `password`

You can also register a new account or sign in with Google.

## 🏗️ Local Development Without Docker

To run the project manually:

1. Make sure MySQL is running on `localhost:3306`
2. Create a database named `crafthub`
3. Use credentials:
   - **User:** `root`
   - **Password:** `root`

### Run backend

```bash
cd backend
mvn spring-boot:run
```

### Run frontend

```bash
cd frontend
npm install
npm run dev
```
