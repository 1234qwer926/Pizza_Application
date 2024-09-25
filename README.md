
# Pizza Delivery Application

This is a Node.js-based pizza delivery web application. It features user authentication, pizza exploration, cart management, and order tracking. The admin dashboard allows viewing and updating orders, checking items, and managing the pizza stock.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Application Structure](#application-structure)
- [Admin Access](#admin-access)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (version 14+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud instance)
- An active internet connection for sending email via Nodemailer and Razorpay integration.

---

## Installation

1. Clone this repository to your local machine.

   ```bash
   git clone https://github.com/your-repo/pizza-delivery-app.git
   cd pizza-delivery-app
   ```

2. Install the necessary dependencies.

   ```bash
   npm install
   ```

---

## Environment Setup

1. Create a `.env` file in the root directory and add the following variables:

   ```bash
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/pizzaDelivery


   # Admin Emails
   ADMIN_EMAILS=["admin@example.com"] 

   # Razorpay Keys
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Nodemailer Configuration
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password

   ```

2. Update your Gmail credentials for sending emails through Nodemailer. If using Gmail, you might need to enable access to less secure apps or set up an App Password.

---

## Running the Application

1. Ensure MongoDB is running on your machine (or connect to a cloud MongoDB instance).
   
   To start MongoDB locally, run:

   ```bash
   mongod
   ```

2. Start the application.

   ```bash
   npm start
   ```

3. Open your browser and go to:

   ```
   http://localhost:8080
   ```

---

## Application Structure

- `/routes`: Contains route files for payment, cart management, and user functionality.
- `/models`: Defines the Mongoose models for `Pizza`, `Order`, and `User`.
- `/views`: EJS templates for rendering the front-end pages.
- `/public`: Static assets like styles, images, and JavaScript files.

---

## Admin Access

To access the admin dashboard, log in with an email specified in the `ADMIN_EMAILS` variable in the `.env` file.

- Admin can manage orders, view pizza stock, and update pizza availability.
- Regular users can explore, customize pizzas, and track their orders.

---

## Troubleshooting

- **MongoDB not connecting**: Ensure MongoDB is installed and running, or check the `MONGODB_URI` in your `.env` file.
- **Nodemailer issues**: Double-check your email credentials, ensure access to less secure apps is enabled, or use an App Password.
- **Admin access not working**: Verify that the email you're using is listed in the `ADMIN_EMAILS` array in the `.env` file.

---

Enjoy building your pizza delivery application!
