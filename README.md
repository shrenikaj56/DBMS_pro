# Student Project Registry

A polished web-based MongoDB mini project for navigating student project records.

## Features

- Add, edit, delete, search, filter, sort, and update project status.
- MongoDB database connectivity through Node.js, Express, and Mongoose.
- Dashboard statistics for total projects, completed projects, reviews, high-priority work, and departments.
- Attractive responsive React and Material UI interface.
- Form validation through the MongoDB schema.

## Tech Stack

- Frontend: React, Material UI
- Backend: Node.js, Express
- Database: MongoDB

## Setup

1. Install MongoDB and start it locally, or set `MONGO_URI` in `backend/.env`.
2. In `backend`: `npm install`, then `npm start`
3. In `frontend`: `npm install`, then `npm start`
4. Open `http://localhost:3000`

Default local database URL:

```text
mongodb://127.0.0.1:27017/project_registry
```
