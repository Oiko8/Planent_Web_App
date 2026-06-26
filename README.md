# Planent Web Application
A full-stack web application designed for event management and online ticket booking,
developed as a university project for the **Internet Application Technologies** course at **DIT UoA**. It follows a modern web browser/server architecture,
powered by a **Java Spring Boot REST API** backend, a **React + TypeScript** frontend and a **MySQL** database.

### Pre-requisites:
* **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (installed and running)

### How to run locally:

The application relies on a `.env` file located in the project's root directory.
To run correctly, copy the provided `.env.example` file, rename it to `.env` and fill in the required fields.

Afterwards:
1. Open a terminal in the project's root directory (`Planent_Web_App/`)
2. Run the following command to start all services:

```bash
docker compose up --build
```
This automatically builds and launches the **Database**, **Backend**, and **Frontend** containers securely inside isolated internal Docker networks.

<br />

- **Accessing the Application**

Once all of the containers are running, the application (site) will be available at **[https://localhost](https://localhost)**.

The application enforces HTTPS using a local self-signed SSL certificate, so the browser will display a "Your connection is not private" warning. Simply click `Advanced` and then `Proceed to localhost (unsafe)`.

A default admin user is, also, automatically created with an `admin` username and password (can be changed in `backend/src/main/java/com/uoa/planent/PlanentApplication#initDatabase`).

<br />

- **Stopping & Resetting:**
```bash
docker compose down
```
All saved data is safely preserved in the `mysql-data` volume created by the **Database** container, even after termination.

Re-run the application with `docker compose up`, or again with the `--build` flag if files changed.

<br />

- **Cleaning Up & Deletion:**

To remove the files created by this project, use one of the following commands:

**1. Containers & Images only (excluding Database volume):**
```bash
docker compose down --rmi all
```

**2. Everything (including Database volume):**

```bash
docker compose down -v --rmi all
```
