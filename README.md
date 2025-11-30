# SD Herbs Backend

This is the backend for the SD Herbs Dynamic Website, built with Node.js, Express, MongoDB, and Cloudinary.

## Features
- **Authentication**: JWT-based admin authentication.
- **Content Management**: APIs for Products, Activities, Blogs, Gallery, News, etc.
- **Image Upload**: Integrated with Cloudinary for image storage.
- **Database**: MongoDB Atlas for data persistence.

## Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account
- Cloudinary Account

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd sdherbs-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLIENT_URL=https://your-frontend-domain.com

    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

4.  **Run Locally:**
    ```bash
    # Development mode (nodemon)
    npm run dev

    # Production mode
    npm start
    ```

## Deployment (Render.com)

1.  Create a new **Web Service** on Render.
2.  Connect your GitHub repository.
3.  **Build Command**: `npm install`
4.  **Start Command**: `npm start`
5.  **Environment Variables**: Add all variables from your `.env` file to Render's environment settings.

## API Documentation
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity (Admin)
- `DELETE /api/activities/:id` - Delete activity (Admin)
- ... (See `routes/` folder for all endpoints)
