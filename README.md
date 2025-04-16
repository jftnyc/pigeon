# Pigeon - Shared Contact Book

A mobile-first web application that serves as a shared contact book for friends, allowing users to maintain and share their contact information, availability, and location with their connected friends.

## Features

- User authentication (register, login, logout)
- Password reset functionality
- Friend connections
- Contact information management
- Availability scheduling
- Location sharing
- Real-time notifications

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Docker (optional, for running PostgreSQL)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pigeon.git
   cd pigeon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Password Reset Functionality

The application includes a complete password reset flow:

1. User requests a password reset from the login page
2. System sends an email with a reset link
3. User clicks the link and sets a new password
4. User is redirected to login with the new password

### Setting Up Email

To enable the password reset functionality, configure the SMTP settings in your `.env` file:

```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@example.com"
SMTP_SECURE="false"
```

### Testing Email Functionality

To test the email functionality:

```bash
npm run test:email
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `POST /api/auth/reset-password/request` - Request a password reset
- `POST /api/auth/reset-password/confirm` - Confirm a password reset

## License

This project is licensed under the MIT License - see the LICENSE file for details.
