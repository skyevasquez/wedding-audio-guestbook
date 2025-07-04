# Audio Guestbook Platform

A modern, event-based audio guestbook platform where hosts can collect, manage, and enjoy multimedia messages (audio, video, photos) from their guests.

## Features

- **Host Dashboard**: Create and manage events, view submissions, download media
- **Guest Submissions**: Easy-to-use interface for recording audio, video, and uploading photos
- **Secure Authentication**: Clerk integration for host authentication
- **Media Storage**: UploadThing integration for reliable file storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **File Storage**: UploadThing
- **Deployment**: Docker containers

## Project Structure

```
├── frontend/          # React application
├── backend/           # Node.js API server
├── database/          # Database schemas and migrations
├── docker-compose.yml # Development environment
└── README.md
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` in both frontend and backend directories
3. Set up environment variables
4. Run with Docker: `docker-compose up`

## Environment Variables

See `.env.example` files in frontend and backend directories for required environment variables.

## License

MIT License