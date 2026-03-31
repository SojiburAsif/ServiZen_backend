# 🚀 ServiZen Backend

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5+-orange.svg)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-5.2+-black.svg)](https://expressjs.com/)

A robust and scalable backend API for **ServiZen**, a comprehensive service booking platform that connects customers with service providers. Built with modern technologies to ensure high performance, security, and maintainability.

## 🌟 Features

- **🔐 Authentication & Authorization**: Secure user authentication with JWT tokens and Better Auth integration
- **📅 Booking Management**: Complete booking workflow with status tracking and notifications
- **💳 Payment Processing**: Integrated Stripe payment gateway for secure transactions
- **📧 Email Notifications**: Automated email notifications for bookings, payments, and updates
- **👥 User Management**: Role-based access control for users, providers, and admins
- **⭐ Review System**: Customer reviews and ratings for services
- **📊 Statistics & Analytics**: Comprehensive stats dashboard for insights
- **🔔 Real-time Notifications**: Instant notifications for booking updates
- **🔍 Service Discovery**: Advanced search and filtering for services and providers
- **📱 RESTful API**: Well-structured REST API endpoints with proper error handling

## 🛠️ Tech Stack

### Backend Framework
- **Node.js** - Runtime environment
- **Express.js** - Web framework for API development
- **TypeScript** - Type-safe JavaScript

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma** - ORM for database management and migrations

### Authentication & Security
- **Better Auth** - Modern authentication solution
- **JWT** - JSON Web Tokens for session management
- **bcrypt** - Password hashing

### Payment Integration
- **Stripe** - Payment processing and webhooks

### Email & Communication
- **Nodemailer** - Email sending service
- **EJS** - Email template engine

### Development Tools
- **ESLint** - Code linting
- **tsx** - TypeScript execution
- **tsup** - TypeScript bundler
- **Prisma Studio** - Database GUI

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/servizen-backend.git
   cd servizen-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory and configure the following variables:
   
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/servizen_db"
   
   # Better Auth Configuration
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:5000
   
   # JWT Configuration
   ACCESS_TOKEN_SECRET=your-access-token-secret
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   REFRESH_TOKEN_EXPIRES_IN=7d
   BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=1d
   BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=1h
   
   # Email Configuration
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_FROM=noreply@servizen.com
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run migrate
   
   # Generate Prisma client
   npm run generate
   
   # (Optional) Seed admin user
   npm run seed:admin
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:5000` with hot reload enabled.

### Production Mode
```bash
npm start
```

## 📚 API Documentation

The API follows RESTful conventions and includes the following main endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service (Provider/Admin)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Payments
- `POST /api/payments/create-session` - Create Stripe payment session
- `POST /api/payments/webhook` - Stripe webhook handler

### Reviews
- `GET /api/reviews` - Get reviews for a service
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/bookings` - Manage all bookings

For detailed API documentation, please refer to the Postman collection or Swagger docs (if available).

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 🗄️ Database Management

### Prisma Commands
```bash
# View database in GUI
npm run studio

# Create new migration
npx prisma migrate dev --name your-migration-name

# Reset database
npx prisma migrate reset

# Generate client after schema changes
npm run generate
```

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio
- `npm run stripe:webhook` - Listen to Stripe webhooks

## 🌐 Deployment

### Vercel Deployment
This project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
Ensure all environment variables from `.env` are set in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@servizen.com or join our Discord community.

## 🔗 Links

- **Frontend Application**: [https://servi-zen-fontend.vercel.app/](https://servi-zen-fontend.vercel.app/)
- **Demo Video**: [https://drive.google.com/file/d/1TTPKsI8YCEszoxKHtXUTTRnQbkZBMIaQ/view](https://drive.google.com/file/d/1TTPKsI8YCEszoxKHtXUTTRnQbkZBMIaQ/view)
- **API Documentation**: [Coming Soon]
- **Issue Tracker**: [GitHub Issues](https://github.com/your-username/servizen-backend/issues)

---

**Made with ❤️ for the ServiZen community**