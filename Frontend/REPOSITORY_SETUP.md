# Repository Organization Guide

This guide explains how to organize your files into separate GitHub repositories.

## Repository Structure

### Backend Repository (analytics-dashboard-backend)
**Files to include:**
- `server/` directory (entire contents)
- `server/README.md`
- `server/package.json`
- `server/tsconfig.json`
- `server/.gitignore`

**Files to exclude:**
- All frontend files (HTML, CSS, JS files in root)
- Root-level configuration files
- `aqueous-walker-455614-m3-2ab00feb749f.json` (sensitive credentials)

### Frontend Repository (analytics-dashboard-frontend)
**Files to include:**
- `index.html`
- `queries.html`
- `signal-pages.html`
- `styles.css`
- `script.js`
- `queries.js`
- `signal-pages.js`
- `serve.js`
- `config.js` (with environment variables)
- `gsc-api.js`
- `package.json`
- `README.md`
- `.gitignore`
- `env.example`

**Files to exclude:**
- `server/` directory
- `aqueous-walker-455614-m3-2ab00feb749f.json` (sensitive credentials)
- `setup-instructions.md`
- `setup.md`

## Setup Instructions

### 1. Create Backend Repository
```bash
# Create new directory for backend
mkdir analytics-dashboard-backend
cd analytics-dashboard-backend

# Initialize git repository
git init

# Copy server files
cp -r ../server/* .
cp ../server/.gitignore .

# Add and commit
git add .
git commit -m "Initial backend setup"

# Add remote and push
git remote add origin https://github.com/yourusername/analytics-dashboard-backend.git
git push -u origin main
```

### 2. Create Frontend Repository
```bash
# Create new directory for frontend
mkdir analytics-dashboard-frontend
cd analytics-dashboard-frontend

# Initialize git repository
git init

# Copy frontend files (exclude server directory and sensitive files)
cp ../index.html .
cp ../queries.html .
cp ../signal-pages.html .
cp ../styles.css .
cp ../script.js .
cp ../queries.js .
cp ../signal-pages.js .
cp ../serve.js .
cp ../config.js .
cp ../gsc-api.js .
cp ../package.json .
cp ../README.md .
cp ../.gitignore .
cp ../env.example .

# Add and commit
git add .
git commit -m "Initial frontend setup"

# Add remote and push
git remote add origin https://github.com/yourusername/analytics-dashboard-frontend.git
git push -u origin main
```

## Security Notes

1. **Never commit sensitive files:**
   - `aqueous-walker-455614-m3-2ab00feb749f.json`
   - `.env` files
   - Any files containing API keys or credentials

2. **Use environment variables:**
   - Copy `env.example` to `.env` in each repository
   - Fill in your actual credentials in the `.env` files
   - Never commit `.env` files

3. **Update .gitignore:**
   - Both repositories have comprehensive `.gitignore` files
   - These will prevent accidental commits of sensitive data

## Deployment

### Backend Deployment
- Deploy to services like Heroku, Railway, or DigitalOcean
- Set environment variables in your deployment platform
- Ensure CORS is configured for your frontend domain

### Frontend Deployment
- Deploy to services like Netlify, Vercel, or GitHub Pages
- Update API endpoints to point to your deployed backend
- Configure environment variables for production

## Development Workflow

1. **Backend changes:** Work in the backend repository
2. **Frontend changes:** Work in the frontend repository
3. **API integration:** Update frontend to use backend API endpoints
4. **Testing:** Test both repositories independently and together
