# Project Manager Backend

This repository contains the backend code for our ALX portfolio project, a project management tool designed to facilitate team collaboration. The project is part of a micro-repo structure, where the backend, frontend, and other components are developed separately to streamline the development process.

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

## Documentation

Currently I used quick markdown files for documenting main features.

- [Authentication](/docs/auth.md)

## Team Members

- **Fadi Asaad (Davenchy):** Backend
- **Mostafa Elmasry (M1-Elmasry):** Backend
- **Mahmoud Samy:** Frontend
