# IRPro Payment System

Professional Immunization Assessment Payment System with integrated 3-step workflow.

## Features

### 3-Step Process
1. **Service Selection** - Choose assessment type and review features
2. **Secure Payment** - PayPal integration for $50 one-time payment
3. **Assessment Form** - Complete 14-field medical assessment

### Core Functionality
- Complete immunization assessment form with 14 required fields
- PayPal payment integration with secure token-based access
- Professional PDF report generation
- Email notifications with attachments
- SQLite database for payment tracking
- 24-hour access after payment
- Reference code system for tracking submissions

### Technical Stack
- **Backend**: Node.js with Express
- **Database**: SQLite3
- **PDF Generation**: PDFKit
- **Payment**: PayPal Checkout SDK
- **Email**: Nodemailer
- **Frontend**: Vanilla JavaScript with modern CSS

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd irpro-payment-system

# Install dependencies
npm install

# Start the server
npm start
```

## Configuration

Set the following environment variables:
```bash
PORT=3000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

## API Endpoints

- `GET /` - Redirects to payment page
- `GET /payment.html` - Payment flow (3 steps)
- `GET /assessment` - Protected assessment form (requires payment token)
- `POST /payment-success` - PayPal payment verification
- `POST /submit` - Form submission and PDF generation
- `GET /health` - Health check endpoint

## Payment Flow

1. User selects service on payment page
2. Secure PayPal payment for $50
3. System generates access token valid for 24 hours
4. User redirected to assessment form
5. Form submission generates PDF and sends email notification

## Database Schema

```sql
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    access_token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

```
├── server.js              # Main server file
├── database.js            # Database configuration
├── package.json           # Dependencies
├── docker-compose.yml     # Docker setup
├── public/
│   ├── index.html         # Assessment form
│   ├── payment.html       # Payment page (3 steps)
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # Styles
└── files/                 # Generated PDFs and JSON files
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev
```

## Security Features

- Payment verification through PayPal API
- Token-based authentication for assessment access
- Input validation and sanitization
- CORS protection
- Secure file handling

## License

MIT License