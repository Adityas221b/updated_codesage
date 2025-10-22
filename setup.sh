#!/bin/bash

echo "🚀 Setting up CodeSage Enhanced React Frontend..."

# Create frontend directory if it doesn't exist
mkdir -p frontend

# Navigate to frontend directory
cd frontend

# Initialize React app if not already done
if [ ! -f "package.json" ]; then
    echo "📦 Creating React app..."
    npx create-react-app . --template typescript
fi

# Install additional dependencies
echo "📦 Installing dependencies..."
npm install axios chart.js react-chartjs-2 react-monaco-editor socket.io-client framer-motion lucide-react @headlessui/react

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

echo "✅ Frontend setup complete!"

# Go back to root directory
cd ..

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install flask flask-socketio flask-cors google-generativeai PyPDF2

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: python app.py"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Backend will run on: http://localhost:5001"
echo "Frontend will run on: http://localhost:3000"
