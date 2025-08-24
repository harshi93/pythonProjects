# DevOps Leadership Transition - 90 Day Tracker

A comprehensive web application designed to help DevOps professionals transition from Senior Engineer to Team Lead roles over a 90-day period, following 12 Factor App principles.

## Features

- **Task Management**: Track progress across three phases (Foundation, Development, Excellence)
- **Team Assessment**: Evaluate and manage team member relationships
- **Learning Resources**: Monitor skill development and training completion
- **KPI Metrics**: Track key performance indicators for leadership effectiveness
- **Risk Management**: Identify and mitigate transition risks
- **Progress Reporting**: Export comprehensive reports in JSON and Excel formats
- **Multipoint Checklists**: Create and manage detailed task checklists
- **Responsive Design**: Collapsible navigation with mobile-first approach

## 12 Factor App Compliance

This application strictly follows the [12 Factor App](https://12factor.net/) methodology:

- **I. Codebase**: Single codebase tracked in version control
- **II. Dependencies**: Explicitly declared and isolated dependencies
- **III. Config**: Configuration stored in environment variables
- **IV. Backing Services**: Database treated as attached resource
- **V. Build, Release, Run**: Strict separation of build and run stages
- **VI. Processes**: Stateless application processes
- **VII. Port Binding**: Self-contained service export via port binding
- **VIII. Concurrency**: Scale via process model
- **IX. Disposability**: Fast startup and graceful shutdown
- **X. Dev/Prod Parity**: Keep development and production similar
- **XI. Logs**: Treat logs as event streams
- **XII. Admin Processes**: Run admin tasks as one-off processes

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone and setup environment**:
   ```bash
   git clone <repository-url>
   cd leadership-transition
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Application: http://localhost:5001
   - Database: localhost:5433

### Using Docker

1. **Build the image**:
   ```bash
   docker build -t leadership-transition .
   ```

2. **Run with database**:
   ```bash
   # Start PostgreSQL
   docker run -d --name postgres \
     -e POSTGRES_DB=leadership_transition \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     postgres:15-alpine

   # Start application
   docker run -d --name app \
     --link postgres:postgres \
     -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/leadership_transition \
     -p 5000:5000 \
     leadership-transition
   ```

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup database**:
   ```bash
   # Create PostgreSQL database
   createdb leadership_transition
   
   # Push database schema
   npm run db:push
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=5000

# Database (Factor IV: Backing Services)
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=localhost
PGPORT=5432
PGDATABASE=leadership_transition
PGUSER=postgres
PGPASSWORD=postgres

# Performance
WEB_CONCURRENCY=1
```

### Optional Environment Variables

```bash
# Security
SESSION_SECRET=your-secret-key

# Logging (Factor XI: Logs)
LOG_LEVEL=info
```

## Docker Configuration

### Health Checks

The application includes comprehensive health checks:

- **Application**: HTTP health endpoint on `/health`
- **Database**: PostgreSQL connection verification
- **Containers**: Automatic restart on failure

### Security Features

- **Non-root user**: Application runs as `appuser` (UID 1001)
- **Init system**: Uses `dumb-init` for proper signal handling
- **Minimal image**: Alpine Linux base for reduced attack surface
- **Dependency scanning**: Frozen lockfiles for reproducible builds

### Resource Management

- **Multi-stage builds**: Optimized image size and build caching
- **Process isolation**: Single responsibility containers
- **Graceful shutdown**: Proper signal handling for clean stops

## API Endpoints

### Core Resources
- `GET /api/dashboard/stats` - Dashboard overview
- `GET /api/tasks` - Task management
- `GET /api/team-members` - Team assessment
- `GET /api/learning-resources` - Learning progress
- `GET /api/kpi-metrics` - Performance metrics
- `GET /api/weekly-assessments` - Self-assessments
- `GET /api/risks` - Risk management
- `GET /api/activities` - Activity logs
- `GET /api/checklists` - Checklist management

### Export Features
- Multiple format support (JSON, Excel)
- Comprehensive data inclusion
- Timestamped downloads

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout
- **Drizzle ORM** with PostgreSQL
- **Passport.js** for authentication

### Infrastructure
- **Docker** with multi-stage builds
- **PostgreSQL 15** database
- **Alpine Linux** base images
- **Health checks** and monitoring

## Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes

# Docker
docker-compose up -d           # Start with compose
docker-compose down            # Stop containers
docker-compose logs -f app     # View application logs
docker-compose exec app sh     # Shell into container
```

## Monitoring and Logs

### Application Logs
- Structured JSON logging
- Request/response tracking
- Error stack traces
- Performance metrics

### Health Monitoring
- Endpoint: `GET /health`
- Database connectivity
- Application readiness
- Resource utilization

### Container Logs
```bash
# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Monitor resources
docker stats leadership-transition_app_1
```

## Production Deployment

### Prerequisites
- Docker and Docker Compose
- PostgreSQL database (if external)
- Environment variables configured
- SSL/TLS certificates (recommended)

### Deployment Steps
1. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit production values
   ```

2. **Deploy with compose**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Verify deployment**:
   ```bash
   curl http://localhost:5001/health
   ```

### Scaling
- **Horizontal**: Multiple app containers behind load balancer
- **Vertical**: Increase container resources
- **Database**: External managed PostgreSQL service

## Security Considerations

- **Environment separation**: No secrets in images
- **User permissions**: Non-privileged container user
- **Network isolation**: Container-to-container communication
- **Data persistence**: External volume mounts
- **Regular updates**: Automated security patches

## Docker Issues & Fixes

This section documents specific Docker deployment issues that were identified and resolved during the setup process.

### Issue #1: Merge Conflicts During Git Pull
**Problem**: Git merge conflicts prevented pulling latest changes
```
error: Pulling is not possible because you have unmerged files.
fatal: Exiting because of an unresolved conflict.
```

**Root Cause**: Remote branch attempted to convert the project directory into a git submodule

**Solution**: Used "ours" merge strategy to preserve local project structure
```bash
git merge --abort
git merge origin/master --strategy=ours
```

### Issue #2: Docker Build Path Error
**Problem**: Docker build failed with directory not found error
```
failed to compute cache key: "/app/client/dist": not found
```

**Root Cause**: Dockerfile was copying from `/app/client/dist` but Vite builds to `/app/dist/public`

**Solution**: Updated Dockerfile copy paths
- **Before**: `COPY --from=builder /app/client/dist ./client/dist`
- **After**: `COPY --from=builder /app/dist/public ./client/dist`

### Issue #3: PostgreSQL Port Conflict
**Problem**: PostgreSQL container failed to start due to port binding error
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Root Cause**: Port 5432 was already in use by existing PostgreSQL instance

**Solution**: Changed external port mapping in docker-compose.yml
- **Before**: `"5432:5432"`
- **After**: `"5433:5432"`

### Issue #4: Application Port Conflict
**Problem**: App container failed to start due to port binding error
```
Ports are not available: listen tcp 0.0.0.0:5000: bind: address already in use
```

**Root Cause**: Port 5000 was occupied by macOS Control Center

**Solution**: Changed application port configuration
- **Port mapping**: `"5001:5001"`
- **Environment**: `PORT=5001`
- **Health check**: Updated URL to use port 5001

### Issue #5: Runtime Module Resolution Error
**Problem**: App container crashed with module not found errors
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /app/dist/index.js
```

**Root Cause**: esbuild with `--packages=external` expected dev dependencies at runtime

**Solution**: Moved required packages to production dependencies
- Moved `vite` from devDependencies to dependencies
- Moved `@vitejs/plugin-react` to dependencies
- Moved Replit plugins to dependencies

### Issue #6: ES Module Path Resolution Error
**Problem**: App crashed with path resolution error
```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
```

**Root Cause**: `import.meta.dirname` is not available in bundled Node.js code

**Solution**: Replaced with compatible `__dirname` equivalent
```typescript
// Added to affected files
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Replaced all instances of import.meta.dirname with __dirname
```

### Issue #7: Build Output Directory Mismatch
**Problem**: Server couldn't find client build files in expected location

**Root Cause**: Vite config and Docker paths were misaligned

**Solution**: 
- Updated Dockerfile to copy from Vite's actual output directory
- Ensured `serveStatic` function uses correct relative path
- Added directory creation in Dockerfile: `RUN mkdir -p dist client/dist`

### Resolution Summary

| Issue | Component | Root Cause | Solution | Status |
|-------|-----------|------------|----------|--------|
| Merge Conflicts | Git | Submodule conversion attempt | `git merge --strategy=ours` | ✅ Fixed |
| Build Path Error | Docker/Vite | Incorrect copy source path | Updated Dockerfile paths | ✅ Fixed |
| PostgreSQL Port | Docker | Port 5432 in use | Changed to port 5433 | ✅ Fixed |
| App Port | Docker | Port 5000 in use | Changed to port 5001 | ✅ Fixed |
| Module Resolution | Node.js/esbuild | Dev deps missing at runtime | Moved to prod dependencies | ✅ Fixed |
| Path Resolution | ES Modules | `import.meta.dirname` undefined | Replaced with `__dirname` | ✅ Fixed |
| Directory Structure | Build Process | Mismatched build outputs | Aligned paths and created dirs | ✅ Fixed |

### Final Configuration

**Application Access**:
- **Frontend**: http://localhost:5001
- **Health Check**: http://localhost:5001/health
- **API**: http://localhost:5001/api/*

**Database Access** (External):
- **Host**: localhost
- **Port**: 5433
- **Database**: leadership_transition
- **Username**: postgres
- **Password**: postgres

## Troubleshooting

### Common Issues

1. **Database connection failure**:
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready
   
   # View connection logs
   docker-compose logs postgres
   ```

2. **Application startup failure**:
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Verify environment variables
   docker-compose exec app env
   ```

3. **Port conflicts**:
   ```bash
   # Change ports in .env file
   PORT=3000
   
   # Or in docker-compose.yml
   ports:
     - "3000:3000"
   ```

### Performance Tuning

- **Database**: Connection pooling and query optimization
- **Application**: Enable compression and caching
- **Docker**: Resource limits and multi-stage builds

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.