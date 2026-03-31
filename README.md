# Scentra 
A perfume recommendation platform that matches fragrances to your personality and lifestyle.

---

## Overview

Scentra is a full-stack web app built with Angular and Django REST Framework. The idea is simple - instead of just browsing perfumes by scent notes, you describe yourself: what music you listen to, what kind of climate you live in, what movies you're into, and what you're sensitive to. Scentra uses that to suggest fragrances that actually fit you.

It was built as a university project, but the concept is real and the stack is production-style.

---

## Idea / Concept

Most perfume recommendation tools only ask "do you like floral or woody?" - which isn't enough. Scentra builds a preference profile for each user across multiple dimensions:

- **Scent preferences** — the obvious one (vanilla, citrus, woody, floral, etc.)
- **Music taste** — dark and moody listeners tend to like different scents than pop fans
- **Movies / anime** — tells us something about your aesthetic
- **Climate & season** — a heavy oud that works in Almaty winters doesn't work in summer heat
- **Budget & sensitivities** — practical filters that actually matter

The backend matches user profiles against a perfume catalog using a scoring system based on these attributes. No AI black boxes — just weighted matching logic.

---

## Features

- User registration and profile creation
- Multi-step preference form (scent, music, movies, climate, budget)
- Personalized perfume recommendations based on full profile
- Perfume catalog with detailed pages (notes, season, price range)
- Sensitivity/allergy filter
- Recommendations update when preferences change
- Simple, clean UI with Angular routing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17, TypeScript, SCSS |
| Backend | Django 4.x, Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT (SimpleJWT) |
| API | RESTful JSON API |

---

## Project Structure

```
scentra/
├── backend/
│   ├── scentra/              # Django project settings
│   ├── users/                # Auth + user management
│   ├── perfumes/             # Perfume catalog + models
│   ├── preferences/          # User preference logic
│   ├── recommendations/      # Matching + scoring engine
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/         # Login, register pages
│   │   │   ├── profile/      # User profile + preferences
│   │   │   ├── catalog/      # Perfume browse page
│   │   │   ├── recommendations/  # Results page
│   │   │   └── shared/       # Components, guards, services
│   │   └── environments/
│   └── angular.json
│
└── README.md
```

---

## Backend Overview

### Main Models

**`User` / `Profile`**
Extends Django's default user. Stores display name, age range, and links to preferences.

**`Perfume`**
The catalog model. Fields include name, brand, scent family, season suitability, price tier, and ingredient flags (for sensitivities).

**`Preferences`**
One-to-one with Profile. Stores the user's answers from the preference form — scent likes/dislikes, music genres, climate, budget, and sensitivities.

**`Recommendation`**
Generated results. Each record links a user to a list of ranked perfumes with a match score. Gets recalculated when preferences are updated.

---

## API Endpoints

### Auth
```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/token/refresh/
```

### Core
```
GET    /api/perfumes/              # Full catalog
GET    /api/perfumes/:id/          # Single perfume detail
GET    /api/profile/               # Current user profile
PUT    /api/preferences/           # Update preferences
GET    /api/recommendations/       # Get personalized results
POST   /api/recommendations/generate/  # Trigger recalculation
```

---

## Frontend Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/register` | Sign up |
| `/login` | Log in |
| `/onboarding` | Preference setup (multi-step form) |
| `/profile` | View and edit preferences |
| `/catalog` | Browse all perfumes |
| `/perfumes/:id` | Single perfume page |
| `/recommendations` | Your personalized results |

---

## How to Run

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up your .env with DB credentials and SECRET_KEY
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend runs on `http://localhost:4200`, backend on `http://localhost:8000`.

Make sure your `.env` and `environment.ts` API URLs match.

---

## Team

| Name | Role |
|---|---|
| Medetkhan Aruzhan | in progress  |
| Moldakan Nazerke | in progress |
| Kaztay Dauren | in progress |

---

