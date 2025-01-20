### Discord Bot Notify Service Setup Guide

Follow these steps to set up and run the Discord Bot Notify Service.

#### Prerequisites
1. Ensure you have [Node.js](https://nodejs.org/) installed (preferably the latest LTS version).
2. Install `npm` (comes bundled with Node.js).
3. Ensure you have a valid Discord Bot token.
4. Set up a PostgreSQL database.

---

### Steps to Run the Service

#### 1. Clone the Repository
```bash
# Clone the repository to your local machine
git clone <repository-url>
cd <repository-folder>
```

#### 2. Install Dependencies
```bash
# Install all required dependencies
npm install
```

## 3. Update the Config File
Ensure the `config.js` file is correctly set up to read environment variables from the `.env` file.

Example `config.js`:
```javascript
export default {
    discord: {
        botToken: BOT_TOKEN,
    },
    database: {
        username: your_database_username,
        password: your_database_password,
        name: your_database_name,
        host: your_database_host,
        port: 5432
    }
};
```

#### 5. Compile TypeScript to JavaScript
```bash
# Compile TypeScript files to JavaScript
tsc
```

#### 6. Run the Service
```bash
# Start the service
node dist
```
