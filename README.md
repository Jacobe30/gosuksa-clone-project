# Website Mirror

Lovable AI Prompt — Clone My Existing Website

I own the existing website:



I want you to recreate/clone this website inside this Lovable project.

IMPORTANT

Do not redesign the website.

Do not add new features.

Do not add new pages.

Do not add new form fields.

Do not change the existing user flow.

Do not use Lovable Cloud.

The goal is to reproduce my existing website as closely as possible, including its existing pages, forms, content structure, navigation, styling, and behavior.

Use the existing website as the source of truth:

https://gosuksa.com/

The #start section is also part of the existing website:

https://gosuksa.com/#start

1. Inspect the existing website first

Before writing the application, inspect the entire existing website.

Identify:

Every existing page

Every existing route

Every navigation link

Every section

Every form

Every form field

Every button

Every input

Every dropdown

Every checkbox/radio option

Every validation rule that is visible

Every existing user flow

Existing text/content

Existing images/logos/icons where possible

Existing colors

Existing typography

Existing spacing

Existing responsive behavior

Existing mobile layout

Do not guess.

If something does not exist on the original website, do not create it.

2. Frontend clone

Recreate the frontend to visually match the existing website.

Match:

Header

Navigation

Hero sections

Forms

Buttons

Cards

Sections

Footer

Typography

Colors

Borders

Shadows

Spacing

Alignment

Responsive behavior

Mobile navigation

Desktop layout

The cloned website should feel like the same website, not a redesign inspired by it.

Preserve the existing wording and structure wherever possible.

3. Pages and routes

Create only the pages/routes that currently exist on:

https://gosuksa.com/

Do not create:

Extra dashboards

Extra admin pages

Extra login systems

Extra settings pages

Extra profile pages

Extra features

Extra fields

Extra steps

unless they already exist on the original website.

The original website is the specification.

4. Forms

Reproduce every existing form exactly.

For each form:

Keep the same fields.

Keep the same field names/meaning.

Keep the same order.

Keep the same required/optional behavior.

Keep the same options.

Keep the same buttons.

Keep the same validation behavior where observable.

Keep the same navigation after submission.

Do not add fields simply because they would be useful.

5. Backend

I specifically do NOT want Lovable Cloud.

Create the backend separately from the Lovable frontend.

Use a simple maintainable backend structure such as:

/backend
server.js
package.json
.env.example

The backend should expose API endpoints required by the existing website.

The frontend should communicate with the backend using normal HTTP API requests.

Do not depend on Lovable Cloud services.

Keep configuration such as database URLs, API keys, secrets, and credentials in environment variables.

Never hard-code secrets into the frontend.

6. Database

Only create database tables/collections that are actually required by the existing website's functionality.

Do not invent additional data fields.

Use a structure that can run independently of Lovable Cloud.

If the existing website does not require a database for a particular feature, do not create one unnecessarily.

7. Project structure

Keep the project clean and easy to deploy:

/src
/backend
/public
/package.json
/.env.example

Use the existing Lovable-compatible frontend stack unless there is a strong technical reason not to.

The backend must be independently runnable.

For example:

Frontend:
npm install
npm run dev

Backend:
cd backend
npm install
npm start

Make the API URL configurable through an environment variable.

8. No Lovable Cloud

This is mandatory:

DO NOT use:

Lovable Cloud

Lovable-managed database

Lovable-managed authentication

Lovable backend services

Supabase through Lovable Cloud

The application must be capable of running with my own backend/server.

9. Assets

Use the existing website's assets where appropriate.

Do not replace the site's branding with generic images.

Do not create random placeholder content when the original content can be reproduced.

Keep the existing logo, imagery, icons, and visual identity.

10. Functionality

Every existing button and interaction should behave as it does on the original website.

Do not make buttons that currently navigate somewhere suddenly open something else.

Do not change the workflow.

Do not simplify the existing forms.

Do not add "helpful" functionality that isn't present.

11. Responsive design

The clone must work on:

Desktop

Laptop

Tablet

Mobile

Match the original site's responsive behavior as closely as possible.

12. Final verification

Before considering the project complete, compare the Lovable implementation against:

https://gosuksa.com/

Check every page and route.

Check:

Visual layout

Navigation

Forms

Buttons

Fields

Text

Images

Mobile layout

Desktop layout

User flow

Fix discrepancies.

MOST IMPORTANT RULE

Treat https://gosuksa.com/ as the single source of truth.

If you are unsure whether something should be added, do not add it.

I want a clone of my existing website — not a new interpretation of it.

Do not finish by adding extra features, extra fields, extra pages, or a new design.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gosuksa-clone-project.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/175f4f58-4e54-426c-b9c2-7ac4e8f4e2f0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
