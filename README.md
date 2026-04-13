# Scrawl  
A university-based social platform for KBTU students to share thoughts, moods, and discussions in a modern threaded format.

---

## Overview

Scrawl is a full-stack web application built with Angular and Django REST Framework.  
It is inspired by platforms like Threads, but redesigned for a university environment.

Students can:
- share posts ("Scrawls")
- express mood
- reply in threaded discussions
- interact through likes, saves, and reposts
- organize content using tags and faculties

The goal is to create a clean, modern, and structured social space specifically for KBTU.

---

## Idea / Concept

Most social platforms are too general.  
Scrawl focuses on a **university ecosystem** where content is:

- structured by **faculties**
- enriched with **mood-based expression**
- organized with **tags**
- built around **threaded conversations**

Instead of random feeds, Scrawl creates a more meaningful and contextual student discussion space.

---

## Features

- User authentication (login/logout with token)
- Create posts ("Scrawls")
- Optional mood selection (visualized with gradient UI)
- Image upload support
- Anonymous posting option
- Nested replies (threaded conversations)
- Like and Save system
- Tag system for filtering and grouping posts
- Faculty-based filtering (FIT, BS, ISE, etc.)
- Clean dark UI with modern design
- REST API integration between frontend and backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17, TypeScript, SCSS |
| Backend | Django 4.x, Django REST Framework |
| Database | SQLite (development) |
| Auth | Token Authentication (DRF) |
| API | RESTful JSON API |

---

## Project Structure

Scrawl/
├── frontend/
│   └── Feed/
│       ├── src/
│       │   ├── app/
│       │   │   ├── feed/          # Main feed page
│       │   │   ├── profile/       # Profile page
│       │   │   ├── auth/          # Login/Register
│       │   │   └── shared/        # Components & services
│       │   └── environments/
│       └── angular.json
│
├── backend/
│   ├── api/                      # Main app (models, views, serializers)
│   ├── scrawl_backend/           # Django project settings
│   ├── manage.py
│   └── requirements.txt
│
└── README.md

---

## Backend Overview

### Main Models

**Scrawl**  
Represents a post created by a user.  
Includes content, mood, image, tags, and author.

**Reply**  
Supports threaded conversations.  
Each reply can belong to a Scrawl or another reply (nested structure).

**Tag**  
Used to categorize posts for filtering and search.

**Like / Save**  
Tracks user interactions with posts.

---

## API Endpoints

### Auth

POST   /api/login/
POST   /api/logout/

### Scrawls

GET    /api/scrawls/           # list all posts
POST   /api/scrawls/           # create post
GET    /api/scrawls/:id/       # get one
PUT    /api/scrawls/:id/       # update
DELETE /api/scrawls/:id/       # delete

### Other

POST   /api/replies/
POST   /api/like/
POST   /api/save/
GET    /api/tags/

---

## Frontend Pages

| Route | Description |
|---|---|
| `/login` | User login |
| `/feed` | Main Scrawl feed |
| `/profile` | User profile |
| `/create` | New Scrawl (inline in feed) |

---

## How to Run

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python manage.py migrate
python manage.py runserver

Backend runs on:

http://127.0.0.1:8000


⸻

Frontend

cd frontend/Feed
npm install
ng serve

Frontend runs on:

http://localhost:4200


⸻

Notes
	•	.env is used to store SECRET_KEY securely
	•	CORS is enabled for frontend-backend communication
	•	API is fully testable via Postman

⸻

Team

Name	
Medetkhan Aruzhan	
Moldakan Nazerke	
Kaztay Dauren	


⸻

Final Notes

This project was developed as part of a university course, but follows real-world development practices:
	•	modular architecture
	•	REST API design
	•	frontend-backend separation
	•	clean UI/UX principles

Scrawl demonstrates how a simple idea can be turned into a full-stack product.

