# Aithon Backend Node.js

Backend server solution for the Smart Classroom project built with Node.js and Express.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd aithon-backend-node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration settings.

### Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📁 Project Structure

```
aithon-backend-node/
├── src/
│   ├── config/          # Configuration files
│   │   └── config.js
│   ├── controllers/     # Request handlers
│   │   └── exampleController.js
│   ├── middleware/      # Custom middleware
│   │   └── errorHandler.js
│   ├── routes/          # API routes
│   │   └── exampleRoutes.js
│   └── server.js        # Application entry point
├── .env.example         # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Health Check
- **GET** `/` - Check server status

### Example Endpoints
- **GET** `/api/example` - Get example data
- **POST** `/api/example` - Create example resource

## 🛠️ Built With

- **Express.js** - Web framework
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **body-parser** - Request body parsing
- **nodemon** - Development auto-reload

## 📝 Development

### Adding New Routes

1. Create a new controller in `src/controllers/`
2. Create a new route file in `src/routes/`
3. Register the route in `src/server.js`

### Environment Variables

Configure your application using the following environment variables in `.env`:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `API_PREFIX` - API route prefix (default: /api)

## 📄 License

ISC
