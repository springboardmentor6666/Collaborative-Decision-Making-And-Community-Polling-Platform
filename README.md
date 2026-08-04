# DecisionHub

## PostgreSQL, backend, and frontend setup

1. Start PostgreSQL. If you have Docker, this command starts a ready-to-use local database:

   ```powershell
   docker compose up -d postgres
   ```

   Otherwise, create the database yourself (the application creates the tables from `src/main/resources/schema.sql` on its first startup):

   ```sql
   CREATE DATABASE decisionhub;
   ```

2. Copy the values from `.env.example` into the environment that starts Spring Boot. For the supplied Docker database, use `decisionhub` as the password:

   ```powershell
   $env:DB_URL = "jdbc:postgresql://localhost:5432/decisionhub"
   $env:DB_USERNAME = "postgres"
   $env:DB_PASSWORD = "decisionhub"
   mvn spring-boot:run
   ```

   The backend listens on `http://localhost:8081`. It initializes `users`, `decisions`, `options`, `votes`, communities, comments, notifications, and reports using the supplied PostgreSQL schema, then Hibernate validates the mappings.

3. In a second terminal, start the frontend:

   ```powershell
   cd decisionhub-frontend
   npm install
   npm run dev
   ```

   The Vite development server forwards `/api/*` requests to `http://localhost:8081`, so the register and login pages use the PostgreSQL-backed backend with no hard-coded host in the UI.

For deployment, set `VITE_API_BASE_URL` to the public backend API URL (including `/api`) when building the frontend, and add its web origin to `CORS_ALLOWED_ORIGINS` for the backend.
