# CareConnect - Installation Guide

## Prerequisites

- Python 3.12+
- Node.js 20 LTS (recommended) or Node.js 22 LTS
- PostgreSQL 12+
- npm 9+ or yarn 1.22+

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd Care_connect
```

## Step 2: Backend Setup

1. Create virtual environment (optional but recommended):
```bash
cd backend
py -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

2. Install dependencies:
```bash
py -m pip install -r requirements.txt
```

3. Configure database in `.env`:
```
DATABASE_URL=postgres://postgres:postgres123@localhost:5432/careconnect_db
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
```

4. Run migrations:
```bash
py manage.py migrate
```

5. Seed initial data:
```bash
py manage.py seed
```

6. Start development server:
```bash
py manage.py runserver 0.0.0.0:8000
```

7. Access admin panel: http://localhost:8000/admin/
   - Default admin: `admin@careconnect.local` / `admin123`

8. Access API docs: http://localhost:8000/swagger/

## Step 3: Admin Portal Setup

1. Install dependencies:
```bash
cd admin_portal
npm install
```

2. Create `.env` (optional):
```
VITE_API_URL=http://localhost:8000/api
```

3. Start development server:
```bash
npm run dev
```

4. Access at: http://localhost:3000

## Step 4: Mobile App Setup

1. Install dependencies:
```bash
cd mobile_app
npm install
```

2. Create `.env` (optional):
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

3. Start Expo:
```bash
npx expo start --clear
```

4. Scan QR code with Expo Go app (Android) or Camera app (iOS)

## Step 5: Verify Installation

### Test Backend
```bash
curl http://localhost:8000/api/sos/categories/
```

### Test Admin Portal
Open http://localhost:3000 and log in with admin credentials.

### Test Mobile App
1. Register a new resident
2. Create emergency contacts
3. Trigger an SOS alert

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running
- Verify credentials in `.env`
- Create database: `CREATE DATABASE careconnect_db;`

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Or use different ports
py manage.py runserver 0.0.0.0:8001
```

### Mobile App Build Issues
- Use Node.js 20 LTS or 22 LTS
- Clear cache: `npx expo start --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` in `config/settings.py`
- Ensure backend is running on correct port
