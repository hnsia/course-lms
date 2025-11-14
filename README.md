# Course LMS

This project is a course learning management system (LMS) which sells courses, and allows users to watch the courses on the platform. This project is purely geared towards exploring technologies.

## Setup

1. Configure environment variables by creating a copy of .env.example and renaming it as .env, attach relevant keys.
1. Setup accounts in Clerk, Arcjet, Stripe.
1. Configure clerk/stripe webhooks

## Development commands

1. Run server locally using `npm run dev`

### Shadcn

1. `npx shadcn@2.3.0 add <component>` This is the specific cli version that works with next canary.
