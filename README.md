# CareConnect

Community Emergency Response & Assistance Network

## Project Overview

CareConnect is a comprehensive emergency response platform designed to connect residents, guardians, volunteers, security personnel, and administrators within a residential community. The system enables rapid SOS alerting, real-time notifications, guardian escalation workflows, and community broadcast capabilities.

## Tech Stack

### Backend
- Django 6.0.6
- Django REST Framework 3.17.1
- PostgreSQL
- JWT Authentication (djangorestframework-simplejwt)
- Swagger/DRF-YASG for API documentation

### Admin Portal
- React 19
- Vite
- React Router DOM
- Axios

### Mobile App
- Expo SDK 57
- React Native 0.86
- Expo Router
- TypeScript

## Quick Start

### Backend
```bash
cd backend
py manage.py migrate
py manage.py seed
py manage.py runserver 0.0.0.0:8000
```

### Admin Portal
```bash
cd admin_portal
npm install
npm run dev
```

### Mobile App
```bash
cd mobile_app
npm install
npx expo start --clear
```

## API Documentation

Once the backend is running, access Swagger UI at:
- http://localhost:8000/swagger/
- http://localhost:8000/redoc/

## Default Credentials

Admin: `admin@careconnect.local` / `admin123`

## Project Structure

```
Care_connect/
├── backend/           # Django REST API
│   ├── config/        # Project settings
│   ├── users/         # Auth, roles, resident profiles
│   ├── society/       # Society, Block, Flat management
│   ├── emergency/     # Guardians, emergency contacts
│   ├── sos/           # SOS alerts, incidents, categories
│   ├── notifications/ # Notification service & templates
│   ├── escalation/    # Response configs & escalation logs
│   └── manage.py
├── admin_portal/      # React web application
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── services/
└── mobile_app/        # Expo React Native app
    └── app/
        ├── (auth)/
        └── (tabs)/
```

## Features

### Milestone 1
- User registration with role selection
- JWT authentication
- Society/Block/Flat management
- Resident mapping and approval workflow
- Guardian and emergency contact management
- Contact verification

### Milestone 2
- SOS alert creation with categories
- Location capture and address lookup
- Incident updates
- Notification service (push, SMS, email)
- In-app notification center
- Guardian escalation workflow
- Community broadcast to volunteers and security
- Volunteer availability toggle

## License

This project is created for educational/demonstration purposes.
