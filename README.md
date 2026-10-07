# A Digital Platform for Community Problem Solving and Resources

A full-stack college project using HTML/CSS/JavaScript + Node.js/Express. It does **not require MongoDB**. Data is stored locally in JSON files inside `backend/data`.

## Features
- User registration and login with encrypted passwords
- Report local community problems
- Search/filter problems and resources
- Like problems
- Comment on problems
- Admin can update problem status: Reported, In Progress, Resolved
- Add local resources/services
- Seeded emergency and civic resources
- Responsive UI

## Run
1. Install Node.js LTS.
2. Open this folder in VS Code.
3. Open Terminal.
4. Run `npm install`.
5. Copy `.env.example` to `.env` (optional; defaults work).
6. Run `npm start`.
7. Open http://localhost:5000

Default admin email is `admin@example.com`. Register using that email to create an admin account.

For a real deployment, replace local JSON storage with a production database and add proper hosting/security controls.
