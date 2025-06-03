# BrazilCo Court Reporter Job Sheet

![App Screenshot](./screenshot.jpg)

## Overview

BrazilCo Court Reporter Job Sheet is a modern web application for court reporters to submit job information quickly and efficiently. Built with Next.js, React, Tailwind CSS, and Supabase, it provides a seamless experience for entering job details, uploading exhibits, and managing submissions.

## Features
- **Modern UI**: Clean, responsive design using Tailwind CSS.
- **Drag-and-Drop File Upload**: Upload exhibits with a user-friendly dropzone and preview area.
- **Supabase Backend**: Stores job sheet data securely in a Postgres database.
- **Form Validation**: Robust validation with Zod and React Hook Form.
- **Image & PDF Previews**: See thumbnails for images and icons for PDFs before submitting.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LukeBrazil/reporter_turnin.git
   cd reporter_turnin
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials.
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Technologies Used
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [react-dropzone](https://react-dropzone.js.org/)

## License

MIT
