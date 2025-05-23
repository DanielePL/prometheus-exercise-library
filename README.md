# Prometheus Exercise Library - Backend Server

A comprehensive backend API for the Prometheus Exercise Library application, built with Node.js, Express, and MongoDB.

## Features

- **Exercise Management**: Complete CRUD operations for exercises
- **Advanced Search**: AI-powered search with semantic understanding
- **File Upload**: Support for exercise images and videos
- **Excel Import**: Bulk import exercises from Excel files
- **Discussion System**: Comments and discussions on exercises
- **Approval Workflow**: Exercise approval system for quality control
- **Statistics**: Comprehensive analytics and reporting
- **Rate Limiting**: Built-in protection against abuse
- **Security**: Helmet, CORS, and input validation

## Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prometheus-exercise-library/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/prometheus-exercise-library` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | - |
| `MAX_FILE_SIZE` | Maximum upload file size | `52428800` (50MB) |

## API Endpoints

### Exercises

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/exercises` | Get all exercises with filtering |
| `GET` | `/api/exercises/:id` | Get single exercise |
| `POST` | `/api/exercises` | Create new exercise |
| `PUT` | `/api/exercises/:id` | Update exercise |
| `DELETE` | `/api/exercises/:id` | Delete exercise |
| `POST` | `/api/exercises/:id/approve` | Approve exercise |
| `POST` | `/api/exercises/:id/discussions` | Add discussion comment |
| `GET` | `/api/exercises/stats/summary` | Get exercise statistics |
| `POST` | `/api/exercises/import` | Import exercises from Excel |

### AI Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai-search` | Intelligent exercise search |
| `GET` | `/api/ai-search/suggestions` | Get search suggestions |
| `GET` | `/api/ai-search/popular` | Get popular searches |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/stats` | System statistics |

## Query Parameters

### GET /api/exercises

- `muscleGroup`: Filter by muscle group
- `category`: Filter by category  
- `difficulty`: Filter by difficulty level
- `equipment`: Filter by equipment type
- `approved`: Filter by approval status
- `search`: Text search in name/description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort direction (asc/desc, default: desc)

Example:
```
GET /api/exercises?muscleGroup=Chest&category=Strength&page=1&limit=10
```

## File Upload

The API supports file uploads for:
- Exercise images (JPEG, PNG, GIF)
- Exercise videos (MP4, WebM)
- Excel files for bulk import (XLSX, XLS)

Maximum file size: 50MB per file

## Excel Import Format

When importing exercises from Excel, use the following column headers:

| Column | Required | Description |
|--------|----------|-------------|
| `name` | ✅ | Exercise name |
| `description` | ✅ | Exercise description |
| `muscleGroup` | ✅ | Target muscle group |
| `category` | ✅ | Exercise category |
| `difficulty` | ❌ | Difficulty level |
| `equipment` | ❌ | Required equipment |
| `tags` | ❌ | Comma-separated tags |
| `approved` | ❌ | Approval status (true/false) |

## Data Models

### Exercise Schema

```javascript
{
  name: String (required),
  description: String (required),
  muscleGroup: String (required),
  category: String (required),
  difficulty: String,
  equipment: String,
  loadType: String,
  executionMode: String,
  repRange: { min: Number, max: Number },
  restTime: { min: Number, max: Number },
  timeUnderTension: { pattern: String, total: Number },
  velocityTracking: { required: String, target: Number },
  barPathTracking: String,
  primaryPurpose: String,
  progressionType: String,
  sport: String,
  imageUrl: String,
  videoDemo: String,
  tags: [String],
  notes: String,
  approved: Boolean,
  discussions: [{ user: String, text: String, date: Date }],
  usageCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Prevents malicious data
- **File Type Validation**: Restricts upload types
- **Error Handling**: Secure error responses

## Performance Optimizations

- **Database Indexing**: Optimized queries
- **Compression**: Gzip compression
- **Caching**: Response caching
- **Pagination**: Efficient data loading
- **File Size Limits**: Prevents large uploads

## Development

### Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Watch tests
npm run test:watch

# Seed database with sample data
npm run seed

# Create database backup
npm run backup
```

### Database Seeding

To populate the database with sample exercises:

```bash
npm run seed
```

### Testing

Run the test suite:

```bash
npm test
```

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure proper CORS origins
5. Set up process manager (PM2)
6. Configure reverse proxy (Nginx)
7. Set up SSL certificates

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Monitoring

The API provides several monitoring endpoints:

- Health check: `GET /api/health`
- System stats: `GET /api/stats`
- Exercise analytics: `GET /api/exercises/stats/summary`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Prometheus Exercise Library Backend**
Built with ❤️ for fitness professionals