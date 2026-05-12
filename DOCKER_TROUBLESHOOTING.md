# Docker Troubleshooting & Local Setup Guide

## Current Issue

Docker Desktop is unresponsive and cannot be initialized. This is a Windows-specific issue that may require:
1. Docker daemon restart
2. Local PostgreSQL setup
3. Windows system restart

---

## Solution 1: Force Docker Restart (Recommended First)

### Step 1: Terminate all Docker processes
```powershell
# Kill all Docker processes
taskkill /IM "Docker Desktop.exe" /F 2>&1
taskkill /IM "com.docker.service" /F 2>&1
taskkill /IM "wsl.exe" /F 2>&1

# Wait 10 seconds
Start-Sleep -Seconds 10
```

### Step 2: Clear Docker state
```powershell
# Remove problematic Docker state files
Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue

# Wait another 5 seconds
Start-Sleep -Seconds 5
```

### Step 3: Restart Docker Desktop
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to initialize (60-120 seconds)
Start-Sleep -Seconds 60

# Verify Docker is running
docker --version
docker ps
```

### Step 4: Build and run containers
```powershell
cd "c:\Users\Ali Khan\Desktop\SPM Project\SPM"
docker-compose up --build -d
```

---

## Solution 2: Local PostgreSQL Setup (If Docker Fails)

### Prerequisites
- Windows 10/11 with administrator access
- ~2GB free disk space

### Step 1: Download PostgreSQL Installer

1. Visit: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 (or latest stable)
3. Run installer

### Step 2: Install PostgreSQL

During installation:
- **Data directory**: C:\Program Files\PostgreSQL\16\data
- **Port**: 5432 (default)
- **Password**: postgres
- **Components**: Database server + Command Line tools
- **Create superuser**: postgres with your password

### Step 3: Verify Installation

```powershell
# Check PostgreSQL is running
Get-Service PostgreSQL*

# Test connection
psql -U postgres -h localhost -d postgres -c "SELECT version();"
```

### Step 4: Create Database and Schema

```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost

# In psql prompt:
CREATE DATABASE social_impact;
\c social_impact
```

Then run the SQL schema:
```powershell
psql -U postgres -h localhost -d social_impact -f "c:\Users\Ali Khan\Desktop\SPM Project\SPM\backend\sql\init.sql"

# Verify tables created
psql -U postgres -h localhost -d social_impact -c "\dt"
```

### Step 5: Configure Backend Environment

Create `.env` in backend directory:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=social_impact
DATABASE_SYNC=true
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3002
```

### Step 6: Start Backend

```powershell
cd backend
npm install
npm run start:dev
```

Expected output:
```
🚀 Backend running on http://localhost:3001
📚 Swagger docs at http://localhost:3001/api/docs
```

### Step 7: Seed Database

```powershell
cd backend
npm run seed
```

### Step 8: Start Frontend

In another terminal:
```powershell
cd frontend
npm install
npm run dev
```

---

## Solution 3: Docker Compose with Explicit Service Start

If Docker is partially working:

```powershell
cd "c:\Users\Ali Khan\Desktop\SPM Project\SPM"

# Stop everything
docker-compose down -v

# Clean up
docker system prune -af
docker volume prune -f

# Start services with logs
docker-compose up --build

# In separate terminal, verify
docker ps
docker logs social-impact-backend
```

---

## Solution 4: Rebuild Everything from Scratch

```powershell
# BACKUP YOUR CODE FIRST

# Remove all containers
docker-compose down -v
docker system prune -af
docker volume rm $(docker volume ls -q)

# Remove images
docker rmi social-impact-backend social-impact-frontend postgres

# Rebuild
cd "c:\Users\Ali Khan\Desktop\SPM Project\SPM"
docker-compose build --no-cache
docker-compose up -d

# Seed database
docker-compose exec -T backend npm run seed
```

---

## Verification Checklist

### Docker Running
```powershell
# Should show 3 containers
docker ps

# Should show:
# - social-impact-postgres
# - social-impact-backend
# - social-impact-frontend
```

### Database Working
```powershell
# Check database connection
docker-compose exec postgres psql -U postgres -d social_impact -c "SELECT COUNT(*) FROM users;"

# Should return a number (not error)
```

### Backend Running
```powershell
# Check backend logs
docker-compose logs backend

# Should see:
# "🚀 Backend running on http://localhost:3001"

# Test endpoint
curl http://localhost:3001/api/projects
```

### Seed Data Present
```powershell
# Check projects created
curl http://localhost:3001/api/projects

# Should return JSON array with 8 projects
```

---

## If All Else Fails: Manual Setup Summary

```powershell
# 1. Install PostgreSQL locally from postgresql.org
# 2. Create database: CREATE DATABASE social_impact;
# 3. Apply schema: psql -U postgres -d social_impact -f sql/init.sql

# Backend
cd backend
npm install
npm run seed
npm run start:dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev

# 3. Access application: http://localhost:3002
```

---

## Common Docker Errors & Fixes

### "Cannot connect to Docker daemon"
```powershell
# Check Docker daemon status
Get-Service Docker

# Start Docker
Start-Service Docker

# If permission denied, run as Administrator
Start-Process powershell -Verb RunAs -ArgumentList "Start-Service Docker"
```

### "No space left on device"
```powershell
# Clean Docker
docker system prune -af
docker volume prune -f

# Or uninstall and reinstall Docker
```

### "Port 5432 already in use"
```powershell
# Find process using port 5432
Get-Process | Where-Object {$_.ProcessName -like "*postgres*"}

# Or change port in docker-compose.yml
# Change: 5433:5432 to 5434:5432
```

### "Port 3001 already in use"
```powershell
# Check what's using port 3001
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID {PID} /F

# Or update docker-compose.yml port
```

---

## WSL2 vs Hyper-V Issues

If using WSL2 for Docker:

```powershell
# Check WSL status
wsl --list --verbose

# Update WSL2
wsl --update

# Restart WSL
wsl --shutdown

# Restart Docker Desktop
taskkill /IM "Docker Desktop.exe" /F
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Start-Sleep -Seconds 60
```

---

## Uninstall and Reinstall (Last Resort)

```powershell
# 1. Uninstall Docker from Control Panel
# 2. Remove Docker config folder
Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Download fresh Docker Desktop installer from docker.com
# 4. Run installer with default settings
# 5. Restart computer
# 6. Run docker-compose up
```

---

## Performance Optimization (Optional)

If Docker runs but slowly:

### docker-compose.yml additions:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### Windows Defender exclusions:
- Add `C:\Program Files\Docker` to exclusions
- Add project folder to exclusions
- Add `.docker` folder to exclusions

---

## Getting Help

If still stuck:

1. Check Docker Desktop logs:
   - Docker menu → Troubleshoot → View Logs

2. Check Docker daemon:
   ```powershell
   docker system info
   ```

3. Run health check:
   ```powershell
   docker-compose ps
   docker-compose logs
   ```

4. Nuclear option—full restart:
   - Save your code
   - Restart Windows
   - Try again

---

## Next Steps After Setup

Once database and services are running:

```powershell
# 1. Seed database
npm run seed

# 2. Test backend
curl http://localhost:3001/api/projects

# 3. Start frontend
npm run dev

# 4. Open http://localhost:3002
# 5. Login with volunteer@demo.com / demo123
```

Good luck!
