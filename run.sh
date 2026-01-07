# Kill processes on ports 3000 and 3001 if they exist
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the services
# Use python3 -m flask to be robust against PATH issues
# Point FLASK_APP to rest_api.py (relative to project root)
FLASK_APP=rest_api.py FLASK_ENV=development python3 -m flask run --port 3001 &

# Start Next.js
# Use yarn --cwd ui to run the command in the ui directory without changing shell directory
yarn --cwd ui next dev