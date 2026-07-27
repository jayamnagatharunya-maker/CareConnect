# CareConnect - Project Report

## Abstract

CareConnect is a Community Emergency Response & Assistance Network designed to enhance safety and communication within residential societies. The platform connects residents, guardians, volunteers, security personnel, and administrators through a unified digital ecosystem. The system enables rapid emergency alerting via one-tap SOS, real-time multi-channel notifications (push, SMS, email), guardian escalation workflows, and community broadcast capabilities. Built with Django REST Framework, React, and Expo, CareConnect provides a robust backend API, an administrative web portal, and a native mobile application for comprehensive emergency management.

## 1. Introduction

### 1.1 Background
Modern residential communities face challenges in emergency response coordination. When an emergency occurs, residents need a reliable way to alert guardians, security, and medical responders instantly. Traditional communication methods (phone calls, WhatsApp groups) are often unstructured and unreliable during crises.

### 1.2 Problem Statement
- No centralized emergency alert system
- Slow communication between residents and guardians
- Lack of structured escalation workflows
- Difficulty tracking response times
- No unified platform for community safety

### 1.3 Proposed Solution
CareConnect addresses these issues through:
- One-tap SOS with GPS location
- Automated guardian notification
- Configurable escalation workflows
- Real-time status tracking
- Community broadcast to nearby volunteers/security

## 2. Objectives

1. Build a scalable REST API for emergency response
2. Enable role-based access (resident, guardian, volunteer, security, admin)
3. Implement one-tap SOS with location and category selection
4. Automate guardian notification via multi-channel alerts
5. Configure time-based escalation with auto-escalation
6. Provide admin tools for society and user management
7. Deliver native mobile experience for residents
8. Enable community broadcast for volunteer/security response

## 3. Technology Stack

### Backend
- **Framework**: Django 6.0.6
- **API**: Django REST Framework 3.17.1
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL
- **API Docs**: DRF-YASG (Swagger/OpenAPI)
- **CORS**: django-cors-headers

### Admin Portal
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios

### Mobile App
- **Framework**: Expo SDK 57
- **Runtime**: React Native 0.86
- **Router**: Expo Router
- **Language**: TypeScript

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CareConnect Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Mobile App  │    │ Admin Portal │    │  Swagger UI  │ │
│  │  (Expo/RN)    │    │   (React)    │    │   (DRF-YASG) │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘ │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │                              │
│                    ┌────────▼────────┐                     │
│                    │  Django REST    │                     │
│                    │    API          │                     │
│                    └────────┬────────┘                     │
│                             │                              │
│         ┌───────────────────┼───────────────────┐          │
│         │                   │                   │          │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐   │
│  │    Users    │    │   Society   │    │  Emergency  │   │
│  │   Module    │    │   Module    │    │   Module    │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                   │                   │          │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐   │
│  │     SOS    │    │Notification│    │ Escalation  │   │
│  │   Module    │    │   Module    │    │   Module    │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                             │                              │
│                    ┌────────▼────────┐                     │
│                    │   PostgreSQL    │                     │
│                    │   Database      │                     │
│                    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 Backend Modules

- **users**: Custom User model with roles, JWT authentication, resident profiles, approval workflows, directory
- **society**: Society, Block, Flat management with hierarchical relationships
- **emergency**: Guardian and emergency contact management with verification
- **sos**: SOS alerts, emergency categories, incident updates, community broadcast, volunteer availability
- **notifications**: Notification service with push/SMS/email support, templates, in-app notifications
- **escalation**: Response time configuration, escalation logs, auto-escalation triggers

### 4.2 Frontend

- **Admin Portal**: React SPA with routing, protected routes, CRUD interfaces for all modules
- **Mobile App**: Expo/React Native with tab-based navigation, auth flows, SOS, contacts, notifications

## 5. Database Design

### ER Diagram (Textual)

```
User (Custom)
├── id (PK)
├── email (unique)
├── role
├── phone_number
└── is_verified

ResidentProfile
├── id (PK)
├── user_id (FK -> User)
├── flat_id (FK -> Flat)
├── approval_status
├── approved_by (FK -> User)
└── approved_at

Society
├── id (PK)
├── name
├── address
└── city

Block
├── id (PK)
├── society_id (FK -> Society)
└── name

Flat
├── id (PK)
├── block_id (FK -> Block)
└── flat_number

Guardian
├── id (PK)
├── resident_id (FK -> User)
├── name
├── relation
└── is_primary

EmergencyContact
├── id (PK)
├── resident_id (FK -> User)
├── name
├── phone_number
└── verification_status

SOS
├── id (PK)
├── resident_id (FK -> User)
├── category_id (FK -> EmergencyCategory)
├── latitude
├── longitude
├── address
└── status

EmergencyCategory
├── id (PK)
├── name
└── description

IncidentUpdate
├── id (PK)
├── sos_id (FK -> SOS)
├── message
└── updated_by (FK -> User)

Notification
├── id (PK)
├── recipient_id (FK -> User)
├── channel
├── title
├── body
└── is_read

NotificationTemplate
├── id (PK)
├── name
├── channel
└── body_template

ResponseTimeConfig
├── id (PK)
├── role
├── response_window_minutes
└── auto_escalate

EscalationLog
├── id (PK)
├── sos_id (FK -> SOS)
├── from_role
├── to_role
└── triggered_at
```

## 6. API Documentation

Complete API documentation is available via Swagger UI:
- **Swagger UI**: http://localhost:8000/swagger/
- **Redoc**: http://localhost:8000/redoc/

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login, get JWT tokens |
| POST | /api/auth/token/refresh/ | Refresh access token |
| POST | /api/auth/logout/ | Logout, blacklist token |
| GET | /api/auth/me/ | Get current user |
| GET | /api/society/societies/ | List societies |
| POST | /api/society/societies/ | Create society |
| POST | /api/society/blocks/ | Create block |
| POST | /api/society/flats/ | Create flat |
| GET | /api/emergency/guardians/ | List guardians |
| POST | /api/emergency/guardians/ | Add guardian |
| GET | /api/emergency/contacts/ | List emergency contacts |
| POST | /api/emergency/contacts/ | Add emergency contact |
| POST | /api/emergency/contacts/{id}/verify/ | Verify contact |
| GET | /api/sos/categories/ | List SOS categories |
| POST | /api/sos/ | Create SOS |
| POST | /api/sos/broadcast/ | Broadcast SOS |
| GET | /api/notifications/ | List notifications |
| POST | /api/notifications/{id}/read/ | Mark notification read |
| GET | /api/escalation/response-configs/ | List escalation configs |
| POST | /api/escalation/trigger/ | Trigger escalation |

## 7. Installation

See [INSTALLATION.md](INSTALLATION.md) for detailed setup instructions.

## 8. User Manual

### For Residents
1. Register with email and select "Resident" role
2. Log in with credentials
3. Complete profile setup by selecting society, block, and flat
4. Add emergency contacts (guardians and other contacts)
5. Verify emergency contacts
6. Use SOS button in emergency to alert guardians
7. View notifications for alerts and updates

### For Guardians
1. Register with "Guardian" role
2. Log in to view resident SOS alerts
3. Accept/respond to SOS notifications
4. View incident status and updates

### For Volunteers
1. Register with "Volunteer" role
2. Toggle availability status
3. Receive community broadcast notifications for nearby emergencies
4. Respond to SOS alerts within radius

### For Security
1. Register with "Security" role
2. Receive all SOS alerts from the community
3. View incident details and status
4. Update incident status as resolved

### For Admins
1. Log in to Admin Portal at http://localhost:3000
2. Create societies, blocks, and flats
3. Review and approve/reject resident registrations
4. Configure notification templates
5. Set escalation response time windows
6. View escalation logs

## 9. Future Scope

1. **Real-time Chat**: WebSocket-based chat between residents and responders
2. **Map Integration**: Interactive map for incident location visualization
3. **Video Calls**: In-app video calling for emergency consultations
4. **AI-powered Triage**: Smart categorization and priority of emergencies
5. **Offline Mode**: Mobile app functionality without internet
6. **Multi-language Support**: Internationalization
7. **Advanced Analytics**: Dashboards for response times, incident trends
8. **IoT Integration**: Smart home sensors for fire/smoke detection
9. **Ambulance Integration**: Direct hospital/ambulance dispatch
10. **Blockchain**: Immutable audit trail for escalation logs

## 10. Conclusion

CareConnect successfully implements a comprehensive emergency response system with role-based access, multi-channel notifications, and structured escalation workflows. The platform provides a solid foundation for community safety and can be extended with additional features like real-time communication, AI triage, and IoT integration in future iterations.

## 11. Screenshots

*(Screenshots to be added during presentation)*

- Admin Portal: Dashboard
- Admin Portal: Societies management
- Admin Portal: Residents approval
- Admin Portal: Emergency contacts
- Admin Portal: Notifications
- Mobile App: Login screen
- Mobile App: Home screen with SOS
- Mobile App: SOS categories
- Mobile App: Emergency contacts
- Mobile App: Notifications
- Mobile App: Profile setup

## 12. References

1. Django Documentation: https://docs.djangoproject.com/
2. Django REST Framework: https://www.django-rest-framework.org/
3. Expo Documentation: https://docs.expo.dev/
4. React Documentation: https://react.dev/
5. PostgreSQL Documentation: https://www.postgresql.org/docs/
