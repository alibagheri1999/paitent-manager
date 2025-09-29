# Dental Clinic Management System - Docker Deployment

This guide explains how to deploy the Dental Clinic Management System using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- At least 4GB RAM available for containers
- 10GB free disk space

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd paitent-manager
```

### 2. Environment Configuration

Copy the environment template and update the values:

```bash
cp env.production.template .env.production
```

Edit `.env.production` with your production values:

```bash
# Update these values for production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 3. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Initialize Database

The application will automatically run Prisma migrations and seed the database on first startup.

### 5. Access the Application

- **Application**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (admin: minioadmin / minioadmin123)
- **PostgreSQL**: localhost:5446 (postgres / postgres)

## Services Overview

### Application (app)
- **Port**: 3000
- **Image**: Built from local Dockerfile
- **Dependencies**: PostgreSQL, MinIO
- **Volumes**: `app_uploads:/app/public/uploads`

### PostgreSQL Database
- **Port**: 5446
- **Database**: dental_clinic
- **Credentials**: postgres / postgres
- **Volumes**: `postgres_data:/var/lib/postgresql/data`

### MinIO Object Storage
- **API Port**: 9000
- **Console Port**: 9001
- **Credentials**: minioadmin / minioadmin123
- **Bucket**: dental-clinic
- **Volumes**: `minio_data:/data`

### Nginx (Production Only)
- **Ports**: 80, 443
- **Profile**: production
- **Features**: SSL termination, rate limiting, caching

## Production Deployment

### 1. Enable Nginx Reverse Proxy

```bash
# Start with Nginx
docker-compose --profile production up -d
```

### 2. SSL Configuration

1. Place your SSL certificates in the `ssl/` directory:
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. Update `nginx.conf` with your domain name
3. Restart Nginx: `docker-compose restart nginx`

### 3. Environment Security

For production, ensure you:

1. **Change default passwords**:
   - PostgreSQL: Update `POSTGRES_PASSWORD`
   - MinIO: Update `MINIO_ROOT_PASSWORD`
   - NextAuth: Update `NEXTAUTH_SECRET`

2. **Use environment files**:
   ```bash
   # Create production environment
   cp env.production.template .env.production
   # Edit with production values
   ```

3. **Enable SSL**:
   - Update `NEXTAUTH_URL` to use HTTPS
   - Configure SSL certificates in Nginx

## Management Commands

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app npx prisma db seed

# Open Prisma Studio
docker-compose exec app npx prisma studio
```

### Application Management

```bash
# View application logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Update application
docker-compose build app
docker-compose up -d app
```

### Backup and Restore

```bash
# Backup PostgreSQL database
docker-compose exec postgres pg_dump -U postgres dental_clinic > backup.sql

# Restore PostgreSQL database
docker-compose exec -T postgres psql -U postgres dental_clinic < backup.sql

# Backup MinIO data
docker-compose exec minio mc mirror /data /backup
```

## Monitoring and Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose logs app | grep health
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5446
   netstat -tulpn | grep :9000
   ```

2. **Database Connection Issues**:
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec app npx prisma db push
   ```

3. **MinIO Connection Issues**:
   ```bash
   # Check MinIO logs
   docker-compose logs minio
   
   # Test MinIO connection
   docker-compose exec app curl http://minio:9000/minio/health/live
   ```

4. **Application Build Issues**:
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache app
   
   # Check build logs
   docker-compose logs app
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs postgres
docker-compose logs minio

# Follow logs in real-time
docker-compose logs -f app
```

### Performance Optimization

1. **Resource Limits**:
   ```yaml
   # Add to docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
         cpus: '0.5'
   ```

2. **Database Optimization**:
   - Enable connection pooling
   - Optimize PostgreSQL configuration
   - Regular database maintenance

3. **MinIO Optimization**:
   - Configure appropriate storage class
   - Enable compression
   - Set up monitoring

## Security Considerations

1. **Network Security**:
   - Use Docker networks for service isolation
   - Restrict external access to database
   - Enable firewall rules

2. **Data Security**:
   - Encrypt sensitive data at rest
   - Use strong passwords
   - Regular security updates

3. **Application Security**:
   - Enable HTTPS in production
   - Configure CORS properly
   - Implement rate limiting
   - Regular dependency updates

## Scaling

### Horizontal Scaling

```bash
# Scale application instances
docker-compose up -d --scale app=3
```

### Load Balancing

Update `nginx.conf` to include multiple app instances:

```nginx
upstream app {
    server app_1:3000;
    server app_2:3000;
    server app_3:3000;
}
```

## Support

For issues and questions:

1. Check the logs: `docker-compose logs`
2. Verify service health: `docker-compose ps`
3. Review this documentation
4. Check GitHub issues

## License

This project is licensed under the MIT License.
