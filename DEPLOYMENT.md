# cPanel Deployment Guide for Shams TMS

## Prerequisites

1. cPanel hosting with **Node.js Selector** enabled
2. MySQL database access
3. SSH access (recommended) or File Manager
4. Domain or subdomain configured

---

## Step 1: Prepare Your Local Build

### 1.1 Build the Frontend

```bash
npm run build
```

This creates a `dist` folder with the production frontend.

### 1.2 Project Structure for Upload

```
your-app/
├── dist/                    # Built frontend (from npm run build)
├── src/
│   └── server/              # Backend code
│       ├── auth.js
│       ├── config.js
│       ├── db/
│       │   ├── index.js
│       │   ├── init.sql
│       │   ├── seed.sql
│       │   └── tables.sql
│       ├── routes/
│       │   ├── auth.js
│       │   ├── categories.js
│       │   ├── news.js
│       │   ├── settings.js
│       │   ├── users.js
│       │   └── xml.js
│       └── scripts/
│           └── db-setup.js
├── server.js
├── package.json
└── public/
    ├── uploads/             # Create empty folder
    └── xml/                 # Create empty folder
```

---

## Step 2: Database Setup

### 2.1 Create MySQL Database in cPanel

1. Go to **cPanel → MySQL Databases**
2. Create a new database (e.g., `username_newsticker`)
3. Create a new user with a strong password
4. Add the user to the database with **ALL PRIVILEGES**

### 2.2 Import Database Schema

1. Go to **cPanel → phpMyAdmin**
2. Select your database
3. Click **Import** and upload the combined SQL:

```sql
-- Combined SQL for initial setup
-- Run this in phpMyAdmin

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    designation VARCHAR(100),
    email VARCHAR(100),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    main_scene_name VARCHAR(100),
    source_name VARCHAR(100),
    template_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    image_path VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_categories (
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(100),
    website VARCHAR(255),
    email VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, name, designation, email, role) 
VALUES (
    'admin',
    '$2a$10$BObfteIb7axUmEU0EDFfhe3XRKWfdKy1tmkR/BLHcxG3Oh6ew8/yi',
    'Administrator',
    'System Administrator',
    'admin@example.com',
    'admin'
) ON DUPLICATE KEY UPDATE id=id;

-- Insert default categories
INSERT INTO categories (identifier, name_ar, name_en) VALUES
    ('news', 'أخبار', 'News'),
    ('sports', 'رياضة', 'Sports'),
    ('weather', 'طقس', 'Weather')
ON DUPLICATE KEY UPDATE identifier=identifier;

-- Insert default settings
INSERT INTO settings (id, company_name, website, email) 
VALUES (1, 'ShamsTV', 'https://shams.tv', 'info@shams.tv')
ON DUPLICATE KEY UPDATE id=id;
```

---

## Step 3: Configure Server Files

### 3.1 Update Database Configuration

Edit `src/server/config.js` for production:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PRODUCTION SETTINGS - Update these values!
export const JWT_SECRET = 'your-very-long-random-secret-key-here-change-this';

export const DB_CONFIG = {
    host: 'localhost',
    user: 'your_cpanel_username_dbuser',    // e.g., 'shams_newsuser'
    password: 'your_database_password',      // The password you created
    database: 'your_cpanel_username_dbname'  // e.g., 'shams_newsticker'
};

export const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
export const XML_DIR = path.join(__dirname, '..', '..', 'public', 'xml');

// Ensure directories exist
[UPLOADS_DIR, XML_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});
```

### 3.2 Update Server for Production

Edit `server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { UPLOADS_DIR } from './src/server/config.js';
import newsRoutes from './src/server/routes/news.js';
import usersRoutes from './src/server/routes/users.js';
import categoriesRoutes from './src/server/routes/categories.js';
import authRoutes from './src/server/routes/auth.js';
import xmlRoutes from './src/server/routes/xml.js';
import settingsRoutes from './src/server/routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS for production - update with your domain
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'dist')));

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage });

// API Routes
app.use('/api', authRoutes);
app.use('/api', newsRoutes);
app.use('/api', usersRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', xmlRoutes);
app.use('/api', settingsRoutes);

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 3.3 Create Production package.json

Create a minimal `package.json` for the server:

```json
{
  "name": "shams-tms-server",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.12.0"
  }
}
```

---

## Step 4: Upload Files to cPanel

### 4.1 Using File Manager

1. Go to **cPanel → File Manager**
2. Navigate to your domain's root folder (usually `public_html` or a subdomain folder)
3. Upload all files maintaining the structure:
   - `dist/` folder
   - `src/server/` folder
   - `server.js`
   - `package.json`
   - `public/uploads/` (empty folder)
   - `public/xml/` (empty folder)

### 4.2 Using FTP (Recommended for large uploads)

Use FileZilla or similar FTP client with your cPanel FTP credentials.

---

## Step 5: Configure Node.js in cPanel

### 5.1 Setup Node.js Application

1. Go to **cPanel → Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/public_html` (or your app folder)
   - **Application URL**: Your domain
   - **Application startup file**: `server.js`

4. Click **Create**

### 5.2 Install Dependencies

1. In the Node.js App panel, click **Run NPM Install**
2. Or via SSH:
   ```bash
   cd /home/username/public_html
   source /home/username/nodevenv/public_html/18/bin/activate
   npm install
   ```

### 5.3 Start the Application

1. Click **Start App** in the Node.js panel
2. Or via SSH:
   ```bash
   npm start
   ```

---

## Step 6: Configure .htaccess (if needed)

Create `.htaccess` in your app root:

```apache
DirectoryIndex disabled

RewriteEngine On

# Redirect to Node.js app
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

**Note**: Some cPanel setups handle this automatically through the Node.js Selector.

---

## Step 7: Update Frontend API URL

Before building, update your frontend to use the correct API URL.

Create/edit `src/config.ts`:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || '';
```

Then update all API calls to use relative URLs (since frontend and backend are on same domain):

```typescript
// Instead of: fetch('http://localhost:3000/api/...')
// Use: fetch('/api/...')
```

---

## Step 8: SSL Certificate

1. Go to **cPanel → SSL/TLS** or **Let's Encrypt SSL**
2. Install a free SSL certificate for your domain
3. Enable **Force HTTPS** redirect

---

## Troubleshooting

### Application won't start
- Check Node.js error logs in cPanel
- Verify database credentials
- Ensure all dependencies are installed

### 500 Internal Server Error
- Check `.htaccess` configuration
- Verify file permissions (755 for folders, 644 for files)
- Check Node.js application logs

### Database connection failed
- Verify database credentials in `config.js`
- Ensure database user has proper permissions
- Check if MySQL is running

### CORS errors
- Update CORS origin in `server.js` with your domain
- Clear browser cache

### File upload issues
- Ensure `public/uploads` folder exists with write permissions (755)
- Check multer configuration

---

## Default Login Credentials

- **Username**: admin
- **Password**: admin123

⚠️ **Change the admin password immediately after first login!**

---

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Set proper file permissions
- [ ] Configure CORS with your specific domain
- [ ] Remove console.log statements from production code
