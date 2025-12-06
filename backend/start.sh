#!/bin/bash
# iGreen+ Backend Quick Start Script

echo "🚀 Starting iGreen+ Backend API..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
if [ ! -f "venv/installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/installed
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials!"
    echo "Then run this script again."
    exit 1
fi

# Start the server
echo "✅ Starting server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/api/docs"
echo ""
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
