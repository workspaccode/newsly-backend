# Newsly Backend API

A modern news aggregation and publishing platform backend built with NestJS, TypeScript, and PostgreSQL.

## Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Article Management** - Full CRUD operations for news articles
- **Category System** - Organize articles by categories
- **User Roles** - Support for User, Editor, Admin, and Super Admin roles
- **Bookmarks & Likes** - User engagement features
- **Search & Filtering** - Advanced article search and filtering
- **Trending Articles** - Popular content discovery
- **PostgreSQL Database** - reliable data persistence
- **Ready for Render Deployment** - Optimized for cloud deployment

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Validation**: Class Validator & Class Transformer

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database

##  Deployment on Render

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file and set up:
   - Web service with Node.js environment
   - PostgreSQL database
   - Environment variables

### Option 2: Manual Setup
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following build and start commands:
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm run render-start`
4. Add a PostgreSQL database addon
5. Set environment variables:
   - `DATABASE_URL` (automatically provided by PostgreSQL addon)
   - `JWT_SECRET` (generate a secure secret)
   - `NODE_ENV=production`

### Environment Variables for Render
```env
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-here
JWT_EXPIRES_IN=24h
DATABASE_URL=postgresql://... (auto-provided by Render)
```
## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```
The API will be available at `http://localhost:3000`

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
