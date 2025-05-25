# Kill processes on ports 3000 and 3001 if they exist
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the services
FLASK_APP=../rest_api.py FLASK_ENV=development flask run --port 3001 &
next dev --turbopack