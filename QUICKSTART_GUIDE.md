# 🏥 MediCare - Quick Start Guide

**MediCare** is a modern Hospital Management System that helps doctors and patients manage appointments, medical records, and payments easily.

---

## ⚡ Critical Setup: Security Credentials

**Before running the app**, you must configure your database password. We hid it from the code for security!

### How to set credentials in Eclipse:

**Method 1: Use VM Arguments (Easiest)**
1.  Right-click `MediCareApplication.java` -> **Run As** -> **Run Configurations...**
2.  Select your app on the left.
3.  Click the **Arguments** tab.
4.  In the **VM Arguments** box (the bottom one), paste this EXACTLY:
    ```
    -DDB_USERNAME=postgres -DDB_PASSWORD=Rohit@123
    ```
5.  Click **Apply** and **Run**.

*(Or if you can find the **Environment** tab, you can add `DB_USERNAME` and `DB_PASSWORD` there instead.)*

> **Note for other developers:**
> If you are running this code on your own machine, you do **not** need my password!
> You should use **your own** local PostgreSQL username and password in the steps above.

---

## 🚀 How to Run the Project

You can run this project in two ways. Choose the one that suits you!

### Option 1: For Developers (Recommended)
*Use this if you want to make changes to the code.*

**1. Start the Backend:**
*   Make sure you did the "**Critical Setup**" above.
*   Run the app in Eclipse.
*   The backend will start on port `8080`.

**2. Start the Frontend:**
*   Go to the project folder: `d:\MediCare`.
*   Double-click the file named **`start-frontend-dev.bat`**.
*   A black window will open. Keep it open!

**3. Access the App:**
*   Open your browser and search: **[http://localhost:3000](http://localhost:3000)**

---

### Option 2: Single Port Mode
... (rest of the file remains similar)
