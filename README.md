# Project Manager Backend

This repository contains the backend code for our ALX portfolio project, a project management tool designed to facilitate team collaboration. The project is part of a micro-repo structure, where the backend, frontend, and other components are developed separately to streamline the development process.

The frontend repository: [TaskHive](https://github.com/Mahmoud-Samy-Creator/TaskHive-web-app-client)

The docker image: [davenchy/project-manager](https://hub.docker.com/repository/docker/davenchy/project-manager)

## Table of Contents
- [Minimum Viable Product (MVP) Features](#minimum-viable-product-mvp-features)
- [Real-Time Event System](#real-time-event-system)
- [Technologies Used](#technologies-used)
- [Project Status](#project-status)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Team Members](#team-members)
- [License](#license)

## Minimum Viable Product (MVP) Features

For our first release, we focused on implementing the following core features:

- **Workspace:** A component that groups relevant projects together.
- **Project:** A collection of tasks organized according to their states.
- **Notes:** A feature within a project that allows members to document additional information or ideas relevant to the tasks.
- **Questions:** A feature that enables project members to initiate and participate in discussions related to any aspect of the project.
- **Replies:** Responses provided to questions, facilitating ongoing discussions within the project.
- **Tasks:** A set of to-do lists representing the steps needed to complete a task.
- **To-Do List:** A series of mini-tasks that serve as steps to complete a project task.

## Real-Time Event System

Our project manager uses Server-Sent Events (SSE) to provide a real-time event system, enabling seamless team collaboration.

## Technologies Used

The backend is built using the following technologies:

- **TypeScript:** For a strong type system and efficient development.
- **Hono:** A lightweight, Express.js alternative that offers robust typing and a variety of helpers and middlewares.
- **MongoDB:** Our chosen database for storing and managing data.
- **Zod:** For schema validation and type safety.

## Project Status

This project is currently under active development. We are continuously working on adding more features and improving the overall functionality.

## Installation and Setup

To get the backend running locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Davenchy/project-manager-backend.git
   cd project-manager-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (e.g., `.env` file).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

For ease of setup and deployment, we have published a Docker image containing the latest release of the backend:

```bash
docker pull davenchy/project-manager:beta
```

Additionally, we've included a `docker-compose.yml` file to simplify the setup and running of the backend server and the required MongoDB database. To start the services, simply run:

```bash
docker-compose up
```

This will start the backend server and the database in a single step, making it easy to get everything up and running quickly.

## API Documentation

We used Swagger for API documentation. The `swagger.yaml` file in the repository contains the complete documentation for the backend. 

For a rendered version of the Swagger documentation, visit:

```http
GET /docs
```

This endpoint serves the documentation in a user-friendly format.

## Team Members

- **Fadi Asaad ([Davenchy](https://github.com/Davenchy)):** Backend
- **Mostafa Elmasry ([M1-Elmasry](https://github.com/M1-Elmasry)):** Backend
- **Mahmoud Samy ([Mahmoud-Samy-Creator](https://github.com/Mahmoud-Samy-Creator)):** Frontend

## License

This project is licensed under the [MIT License](./LICENSE).
