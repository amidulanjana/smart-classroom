#!/bin/bash

echo "🏫 Smart Classroom - Emergency Pickup System Setup"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend-two" ] || [ ! -d "aithon-backend-node" ]; then
    echo "❌ Error: Please run this script from the smart-classroom root directory"
    exit 1
fi

echo "📦 Setting up Backend..."
cd aithon-backend-node

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "✓ Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart-classroom
NODE_ENV=development
EOF
    echo "✓ Created .env file"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "📱 Setting up Frontend..."
cd ../frontend-two

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✓ Frontend dependencies already installed"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start MongoDB (if not already running):"
echo "   brew services start mongodb-community"
echo ""
echo "2. Start the backend server:"
echo "   cd aithon-backend-node"
echo "   npm start"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend-two"
echo "   npm start"
echo ""
echo "4. Choose your platform:"
echo "   - Press 'i' for iOS simulator"
echo "   - Press 'a' for Android emulator"
echo "   - Press 'w' for web browser"
echo ""
echo "📖 For detailed documentation, see EMERGENCY_PICKUP_GUIDE.md"
echo ""
