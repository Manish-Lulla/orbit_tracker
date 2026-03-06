
# Orbit – AI Powered Project & Task Manager

## Overview

Orbit is a **React + TypeScript based project management application** designed to help users organize projects and track tasks efficiently. The application allows users to create projects, manage tasks, track progress, and visualize productivity through an analytics dashboard.

A key feature of Orbit is **AI-powered task generation using the Gemini API**, which automatically suggests tasks based on the project name and description, helping users quickly plan their work.

---

# Features

### Project Management

* Create and manage multiple projects
* Add project descriptions
* Delete projects easily

### Task Management

* Add tasks to projects
* Mark tasks as completed
* Delete tasks
* Track task progress

### AI Task Generation

* Generate suggested tasks using **Gemini AI**
* Automatically create task lists based on project details

### Analytics Dashboard

* Visual overview of project progress
* Track productivity across projects

### Additional Features

* Search projects instantly
* Clean and modern UI
* Progress bars for task completion
* Expandable task views
* Persistent storage using **localStorage**

---

# Tech Stack

* **React**
* **TypeScript**
* **Vite**
* **Gemini API**
* **Lucide React Icons**
* **LocalStorage for persistence**
* **CSS / Utility styling**

---

# Project Structure

```
src
 ├── components
 │    └── Analytics.tsx
 ├── services
 │    └── geminiService.ts
 ├── utils
 │    └── storage.ts
 ├── types.ts
 ├── App.tsx
 └── main.tsx
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Manish_Lulla/orbit_tracker.git
```

Go to the project directory:

```bash
cd orbit_tracker
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

# Future Improvements

* User authentication
* Cloud storage for projects
* Team collaboration
* Drag and drop task management
* Task priority levels
* Deadline tracking
* Notifications and reminders

---

# Purpose of the Project

This project demonstrates building a **modern AI-assisted productivity application using React and TypeScript**. It showcases frontend development, state management, API integration, and building interactive UI components.

---
