# SocialConnect

A modern, feature-rich social media platform built with Next.js, TypeScript, and PostgreSQL.

![SocialConnect Banner](https://example.com/banner.jpg)

## Overview

SocialConnect is a full-featured social media application that enables users to create profiles, share posts with images and videos, connect with others, and explore content from across the platform. The application features a responsive design, real-time updates, and a modern, intuitive interface.

## Features

### User Management
- **Secure Authentication**: Email/password-based authentication using NextAuth.js
- **User Profiles**: Customizable profiles with bio, avatar, and social links
- **Profile Dashboard**: View your posts and profile information in one place

### Social Interaction
- **Posts with Media Support**: Share text posts with images or videos
- **Dynamic Feed**: View a timeline of posts from all users
- **My Posts Feed**: Filter to view only your own posts
- **User Search**: Find other users by name with a responsive search function
- **User Profiles**: Visit any user's profile by clicking on their avatar or name in posts

### Media Handling
- **Image & Video Upload**: Upload and share images and videos in posts
- **Profile Pictures**: Upload and manage your profile picture
- **Media Viewing**: Embedded image and video viewing within the feed

### User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Real-time Updates**: Posts appear immediately after creation

## Technology Stack

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Accessible UI components
- **Lucide React**: Beautiful, consistent icons

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Robust relational database for data storage
- **AWS S3**: Cloud storage for images and videos
- **NextAuth.js**: Authentication solution for Next.js

### Optimization
- **Batch Processing**: Efficient loading of user avatars through batched API calls
- **Lazy Loading**: Optimized image loading for better performance
- **Error Handling**: Graceful error handling for failed media loads

## Project Structure

```
/
├── app/                 # Next.js app directory
│   ├── api/             # API routes
│   ├── account/         # Account management pages
│   ├── dashboard/       # User dashboards
│   ├── profile/         # Profile pages
│   ├── search/          # User search functionality
│   └── ...              # Other app routes
├── components/          # Reusable React components
│   ├── ui/              # UI components
│   ├── middle-bar.tsx   # Main feed component
│   ├── left-sidebar.tsx # Navigation sidebar
│   └── ...              # Other components
├── hooks/               # Custom React hooks
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets
└── ...                  # Configuration files
```

## Optimized Avatar Loading

The application uses a batch processing approach to efficiently load user avatars:

```
┌────────────────┐      ┌───────────────────┐     ┌──────────────────┐
│                │      │                   │     │                  │
│  Load Posts    │──►   │ Extract Unique    │──►  │ Batch Request    │
│                │      │ User IDs          │     │ for Avatars      │
└────────────────┘      └───────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌────────────────┐      ┌───────────────────┐     ┌──────────────────┐
│                │      │                   │     │                  │
│  Render Posts  │◄──   │ Update Posts with │◄──  │ Process Avatar   │
│  with Avatars  │      │ Avatar URLs       │     │ URLs from S3     │
└────────────────┘      └───────────────────┘     └──────────────────┘
```

### Benefits:

1. **Reduced API Calls**: Instead of making one request per avatar, we batch process all needed avatars in a single API call
2. **Improved Performance**: Fewer network requests mean faster page loading times
3. **Caching**: We track which avatars we've already loaded to prevent duplicate requests
4. **Parallel Processing**: Avatars are processed in parallel for maximum efficiency

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- AWS S3 bucket for media storage
- npm or yarn

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/socialconnect"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
BUCKET_REGION="your-region"
BUCKET_NAME="your-bucket-name"
BUCKET_POST_NAME="your-post-bucket-name"
ACCESS_KEY="your-access-key"
SECRET_ACCESS_KEY="your-secret-access-key"
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/socialconnect.git
   cd socialconnect
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment

To build for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Deployment Options

SocialConnect can be deployed on various platforms:

- **Vercel**: Recommended for Next.js applications
- **AWS**: Using services like EC2, ECS, or Lambda
- **Heroku**: Simple deployment with PostgreSQL add-on
- **Docker**: Containerized deployment option

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Vercel](https://vercel.com/)
