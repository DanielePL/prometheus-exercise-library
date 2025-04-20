# Prometheus Exercise Library

A web application for managing and organizing exercise routines, workouts, and fitness plans.

## Features

- Browse and search exercise database
- Create custom workouts
- Track progress and performance
- Generate AI-powered workouts
- Organize exercises by muscle groups and equipment
- View comprehensive workout statistics

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client && npm install
   ```
3. Set up environment variables in `.env` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001
   ```

## Running the Application

To run the application in development mode:

```
npm run dev-all
```

This will start both the server and client concurrently.

To run just the server:
```
npm run dev
```

To run just the client:
```
npm run client
```

## Development Setup

If you want to contribute or modify the application:

1. Clone the repository
2. Navigate to the project root
3. Install dependencies for each component:
   ```
   # Root dependencies
   npm install
   
   # Client dependencies
   cd client
   npm install
   ```
4. Run the development environment:
   ```
   cd ..
   npm run dev-all
   ```

## Technology Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB

## License

MIT