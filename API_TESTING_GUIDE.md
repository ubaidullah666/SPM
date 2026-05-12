# API Testing Guide - Social Impact Platform

## Pre-requisites
1. Database must be running with initialized schema
2. Backend server running on http://localhost:3001
3. Frontend running on http://localhost:3002

## Seed Data
Before testing, run the seed script to populate dummy data:
```bash
cd backend
npm run seed
```

This creates:
- **Volunteer Account**: volunteer@demo.com / demo123
- **NGO Account**: ngo@demo.com / demo123
- **Demo Projects**:
  - Rural Literacy Program (remote, teaching focused)
  - Community Solar Workshop (in-person Portland)

---

## API Endpoints Testing Checklist

### 1. Authentication Endpoints

#### 1.1 User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Volunteer",
  "email": "john@example.com",
  "password": "secure123",
  "skills": ["Teaching", "Web Development"],
  "bio": "Passionate about education"
}
```
**Expected**: 200 OK, returns user object with ID and role='volunteer'

#### 1.2 User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "volunteer@demo.com",
  "password": "demo123"
}
```
**Expected**: 200 OK, returns { access_token, user: { userId, role, email } }
**Save the token** for authenticated requests

---

### 2. Projects Endpoints

#### 2.1 Get All Projects
```bash
GET /api/projects
```
**Expected**: 200 OK, array of projects with pagination
**Check**: Projects should have ngo details, required fields populated

#### 2.2 Get Project by ID
```bash
GET /api/projects/{projectId}
```
**Expected**: 200 OK, single project with full details
**Check**: All fields (description, requiredSkills, location, volunteersNeeded, etc.)

#### 2.3 Get Project Stats
```bash
GET /api/projects/stats
```
**Expected**: 200 OK, returns object with:
- totalProjects
- openProjects
- completedProjects
- totalVolunteers

#### 2.4 Create Project (NGO Only)
```bash
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Environmental Cleanup Drive",
  "description": "Help clean up local parks and beaches",
  "category": "Environment",
  "requiredSkills": ["Physical Work", "Teamwork"],
  "location": "San Francisco Bay Area",
  "isRemote": false,
  "volunteersNeeded": 20,
  "estimatedHours": 16,
  "startDate": "2024-06-01",
  "endDate": "2024-06-30"
}
```
**Expected**: 201 Created, returns created project
**Note**: Requires NGO role and JWT token

#### 2.5 Update Project (NGO Only)
```bash
PUT /api/projects/{projectId}
Authorization: Bearer {ngoToken}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "ongoing"
}
```
**Expected**: 200 OK, updated project

#### 2.6 Get My Projects (NGO Only)
```bash
GET /api/projects/my-projects
Authorization: Bearer {ngoToken}
```
**Expected**: 200 OK, array of projects created by this NGO

#### 2.7 Delete Project (NGO Only)
```bash
DELETE /api/projects/{projectId}
Authorization: Bearer {ngoToken}
```
**Expected**: 200 OK or 204 No Content

---

### 3. Applications Endpoints

#### 3.1 Apply to Project (Volunteer Only)
```bash
POST /api/applications
Authorization: Bearer {volunteerToken}
Content-Type: application/json

{
  "projectId": "1",
  "coverLetter": "I'm very interested in this project because..."
}
```
**Expected**: 201 Created, returns application with status='pending'
**Check**: Should prevent duplicate applications (409 Conflict)

#### 3.2 Get My Applications (Volunteer)
```bash
GET /api/applications/my
Authorization: Bearer {volunteerToken}
```
**Expected**: 200 OK, array of applications submitted by user
**Check**: Should include project details and current status

#### 3.3 Get My Application Stats (Volunteer)
```bash
GET /api/applications/my/stats
Authorization: Bearer {volunteerToken}
```
**Expected**: 200 OK, returns { pending, accepted, rejected, totalCount }

#### 3.4 Get Project Applications (NGO Only)
```bash
GET /api/applications/project/{projectId}
Authorization: Bearer {ngoToken}
```
**Expected**: 200 OK, array of all applications for this project
**Check**: Only NGO that owns the project should access this

#### 3.5 Review Application (NGO Only)
```bash
PUT /api/applications/{applicationId}/review
Authorization: Bearer {ngoToken}
Content-Type: application/json

{
  "status": "accepted",
  "ngoFeedback": "Great qualifications! Welcome aboard."
}
```
**Expected**: 200 OK, returns updated application
**Check**: Should update status and save feedback (stored as reviewNote)

---

### 4. Contributions Endpoints

#### 4.1 Create Contribution (Volunteer Only)
```bash
POST /api/contributions
Authorization: Bearer {volunteerToken}
Content-Type: application/json

{
  "projectId": "1",
  "hours": 8,
  "description": "Taught basic mathematics to 20 students",
  "tasksCompleted": ["Module 1", "Module 2"]
}
```
**Expected**: 201 Created
**Check**: Impact score should be calculated (hours * 10)

#### 4.2 Get My Contributions (Volunteer)
```bash
GET /api/contributions/my
Authorization: Bearer {volunteerToken}
```
**Expected**: 200 OK, array of contributions
**Check**: Should be ordered by most recent first

#### 4.3 Get My Impact Summary (Volunteer)
```bash
GET /api/contributions/my/summary
Authorization: Bearer {volunteerToken}
```
**Expected**: 200 OK, returns { totalHours, totalImpactScore, projectsContributedTo }

#### 4.4 Get Project Contributions
```bash
GET /api/contributions/project/{projectId}
Authorization: Bearer {token}
```
**Expected**: 200 OK, array of contributions to this project

#### 4.5 Verify Contribution (NGO Only)
```bash
PUT /api/contributions/{contributionId}/verify
Authorization: Bearer {ngoToken}
```
**Expected**: 200 OK, marks contribution as verified

---

### 5. Ratings Endpoints

#### 5.1 Create Rating (Authenticated)
```bash
POST /api/ratings
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "1",
  "rating": 5,
  "comment": "Excellent project, well organized!"
}
```
**Expected**: 201 Created

#### 5.2 Get Project Ratings
```bash
GET /api/ratings/project/{projectId}
```
**Expected**: 200 OK, array of ratings for project
**Check**: Should include average rating

#### 5.3 Get User Ratings
```bash
GET /api/ratings/user/{userId}
```
**Expected**: 200 OK, array of ratings about this user

---

### 6. Users Endpoints

#### 6.1 Get All Users
```bash
GET /api/users
Authorization: Bearer {token}
```
**Expected**: 200 OK, array of public user profiles

#### 6.2 Get User Leaderboard
```bash
GET /api/users/leaderboard
```
**Expected**: 200 OK, array of users sorted by impact score

#### 6.3 Get My Profile
```bash
GET /api/users/me
Authorization: Bearer {token}
```
**Expected**: 200 OK, returns current user profile
**Check**: If NGO, should return NGO details instead

#### 6.4 Get User Profile by ID
```bash
GET /api/users/{userId}
Authorization: Bearer {token}
```
**Expected**: 200 OK, public user profile

#### 6.5 Update My Profile
```bash
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "skills": ["Teaching", "Web Development", "New Skill"],
  "bio": "Updated bio",
  "location": "San Francisco"
}
```
**Expected**: 200 OK, returns updated profile

#### 6.6 Delete My Account
```bash
DELETE /api/users/me
Authorization: Bearer {token}
```
**Expected**: 200 OK or 204 No Content

---

### 7. AI Matching Endpoints

#### 7.1 Get Project Suggestions (Volunteer Only)
```bash
GET /api/ai-matching/suggestions
Authorization: Bearer {volunteerToken}
```
**Expected**: 200 OK, array of projects (max 10) sorted by skill match score
**Check**: 
- Should return projects where volunteer has matching skills
- If no skills, should return all open projects
- Each project should have `matchScore` (0-100)

#### 7.2 Analyze Project (AI Service Placeholder)
```bash
POST /api/ai-matching/analyze
Content-Type: application/json

{
  "projectId": "1",
  "title": "Project Title",
  "requiredSkills": ["Teaching"]
}
```
**Expected**: 200 OK, returns { status: 'queued', message, projectId }

---

## Frontend Integration Points to Test

### Dashboard Page (Volunteer)
**Expected to fetch**:
1. GET `/api/applications/my/stats` → Displays pending/accepted/rejected counts
2. GET `/api/contributions/my` → Shows recent contributions (first 5)
3. GET `/api/applications/my` → Shows recent applications (first 5)

### Dashboard Page (NGO)
**Expected to fetch**:
1. GET `/api/projects/my-projects` → Shows their projects
2. GET `/api/projects/stats` → Shows platform-wide stats

### Projects Page
**Expected to fetch**:
1. GET `/api/projects?status=open` → Lists all projects with filters
2. Supports query params: status, category, location, skills, page, limit

### Project Detail Page
**Expected to fetch**:
1. GET `/api/projects/{id}`
2. GET `/api/ratings/project/{id}`
3. Allows POST `/api/applications` to apply

### Contributions Page (Volunteer)
**Expected to fetch**:
1. GET `/api/contributions/my`
2. GET `/api/contributions/my/summary`
3. GET `/api/applications/my` (to link applications to contributions)

### NGO Applications Page
**Expected to fetch**:
1. GET `/api/projects/my-projects`
2. GET `/api/applications/project/{projectId}`
3. Allows PUT `/api/applications/{appId}/review`

---

## Known Issues & Fixes

### Issue 1: Missing `ngoFeedback` field in ApplicationEntity
**Status**: RESOLVED (mapped to reviewNote field)
- Frontend sends `ngoFeedback` 
- Backend maps it to `reviewNote` column
- Serialization converts it back to `ngoFeedback`

### Issue 2: Seed data expansion
**Recommendation**: Add more diverse test data:
- Multiple NGOs
- More projects with various skills and categories
- Pre-created volunteer profiles with different skills

### Issue 3: Error handling
**Check**: Verify proper error messages for:
- Duplicate applications (409 Conflict)
- NGO access control (403 Forbidden)
- Missing resources (404 Not Found)

---

## Testing Strategy

### Phase 1: Authentication
1. Test register endpoint
2. Test login endpoint
3. Verify JWT token works for protected routes

### Phase 2: Projects
1. Create NGO account and projects
2. List and filter projects
3. Update and delete projects

### Phase 3: Applications & Contributions
1. Create volunteer and apply to projects
2. Create contributions
3. Test NGO review flow

### Phase 4: Integration
1. Test complete user journeys (registration → apply → contribute)
2. Verify all frontend pages can load data
3. Check error handling and edge cases

---

## Troubleshooting

### 401 Unauthorized
- Check JWT token validity
- Ensure Authorization header format: `Bearer {token}`
- Token may have expired (default 7 days)

### 403 Forbidden
- Check user role matches endpoint requirements
- NGO endpoints need role='ngo' in JWT
- Volunteer endpoints need role='volunteer'

### 404 Not Found
- Verify resource ID exists in database
- Check project/user IDs after seeding

### 409 Conflict
- Duplicate application: user already applied to this project
- Check uniqueness constraints in database
