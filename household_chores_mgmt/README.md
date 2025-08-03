# Household Chores Management System

A comprehensive web application for managing household chores, assignments, and tracking family task completion with analytics and reporting features.

## 🚀 Features

### Core Functionality
- **Chore Management**: Create, update, rename, and delete household tasks
- **User Management**: Add family members and manage user profiles
- **Assignment System**: Assign chores to specific users with multiple assignment support
- **Priority & Scheduling**: Set due dates and priority levels (High, Medium, Low)
- **Status Tracking**: Monitor chore progress (Pending, In Progress, Completed)

### Advanced Features
- **Tagging System**: Categorize chores with custom tags (kitchen, bathroom, outdoor, etc.)
- **Search & Filter**: Advanced filtering by tags, priority, status, user, and due date
- **Reporting & Analytics**: 
  - User progress reports and completion rates
  - Priority-based analytics
  - Tag performance metrics
  - Time-based trends and comparisons
  - Interactive dashboards with charts
  - Export functionality (PDF/Excel)

## 🛠️ Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: SQLite with comprehensive schema
- **Security**: CORS, Helmet, Rate limiting, Input validation
- **Development**: Nodemon for hot reloading

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: CSS with modern design patterns
- **Development**: React Scripts with hot reloading
- **Testing**: Jest and React Testing Library

## 📁 Project Structure

```
household_chores_mgmt/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # React components and logic
│   ├── package.json       # Client dependencies
│   └── tsconfig.json      # TypeScript configuration
├── server/                # Node.js backend application
│   ├── data/              # SQLite database files
│   ├── database/          # Database initialization
│   ├── routes/            # API route handlers
│   └── index.js           # Server entry point
├── package.json           # Root project configuration
└── household_chores_management_plan.md  # Detailed project plan
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd household_chores_mgmt
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   This command installs dependencies for both the root project and the client.

3. **Initialize the database**
   ```bash
   npm run setup-db
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   This starts both the backend server (port 3002) and frontend client (port 3001) concurrently.

### Available Scripts

- `npm run dev` - Start both server and client in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React client
- `npm run build` - Build the client for production
- `npm run install-all` - Install dependencies for both server and client
- `npm run setup-db` - Initialize the database with sample data

## 🌐 API Endpoints

### Base URL
```
http://localhost:3002/api
```

### User Management
- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Chore Management
- `GET /chores` - List chores with optional filters
- `POST /chores` - Create new chore
- `GET /chores/{id}` - Get chore details
- `PUT /chores/{id}` - Update chore
- `DELETE /chores/{id}` - Delete chore
- `PATCH /chores/{id}/status` - Update chore status

### Assignment Management
- `POST /chores/{id}/assign` - Assign user to chore
- `DELETE /chores/{id}/assign/{user_id}` - Remove assignment
- `GET /users/{id}/chores` - Get user's assigned chores

### Tag Management
- `GET /tags` - List all tags
- `POST /tags` - Create new tag
- `PUT /tags/{id}` - Update tag
- `DELETE /tags/{id}` - Delete tag
- `POST /chores/{id}/tags` - Add tag to chore
- `DELETE /chores/{id}/tags/{tag_id}` - Remove tag from chore

### Search & Filter
- `GET /chores/search?tags=kitchen,bathroom` - Search by tags
- `GET /chores/search?priority=high` - Search by priority
- `GET /chores/search?user_id=1` - Search by assigned user
- `GET /chores/search?status=pending` - Search by status

### Reporting & Analytics
- `GET /reports/user-progress` - User completion progress
- `GET /reports/priority-analysis` - Priority-based analytics
- `GET /reports/tag-analytics` - Tag performance metrics
- `GET /reports/completion-trends` - Time-based trends
- `GET /reports/dashboard-summary` - Dashboard summary data

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **users** - Family member information
- **chores** - Task details with priority and status
- **tags** - Categorization labels
- **chore_assignments** - User-chore relationships
- **chore_tags** - Chore-tag relationships
- **chore_history** - Activity tracking for reporting

## 🎨 User Interface

### Main Dashboard
- Overview of pending and completed chores
- Quick statistics and progress indicators
- Calendar view of upcoming due dates
- Recent activity feed
- Interactive charts and analytics

### Chore Management
- Filterable and sortable chore list
- Advanced search with tag autocomplete
- Priority indicators and status badges
- Quick action buttons for common operations

### Reporting Interface
- Interactive dashboards with real-time charts
- User progress visualization
- Priority and tag-based analytics
- Export options for reports
- Drill-down capabilities for detailed analysis

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Secure headers with Helmet

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Component and function testing with Jest
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: User workflow testing

Run tests with:
```bash
cd client && npm test
```

## 📈 Performance Optimization

- Database indexing on frequently queried fields
- API response caching
- Pagination for large datasets
- Lazy loading for UI components
- Bundle size optimization

## 🚀 Deployment

The application is containerization-ready and includes:
- Environment configuration
- Database migration strategy
- CI/CD pipeline setup
- Monitoring and logging capabilities

## 🔮 Future Enhancements

- Mobile app development
- Push notifications for due dates
- Gamification features (points, badges)
- Calendar app integration
- Recurring chore templates
- Photo completion verification
- AI-powered insights and recommendations
- Multi-household support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for better household management**
