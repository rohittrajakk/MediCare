# 🚀 How to Deploy MediCare to the Internet

This guide will show you how to host your application on **Render** (a popular cloud provider) and connect it to your domain `rohittrajakk.tech`.

---

## Step 1: Push to GitHub
1.  Create a new repository on [GitHub](https://github.com/new).
2.  Push your code to this repository.
    *(If you haven't done this yet, use the Source Control tab in VS Code or Git Bash).*

---

## Step 2: Create a Free Database (PostgreSQL)
1.  Sign up/Login to **[Render.com](https://render.com)**.
2.  Click **New +** -> **PostgreSQL**.
3.  Name: `medicare-db`.
4.  Region: Choose one closest to you (e.g., Singapore or Frankfurt).
5.  Plan: Select **Free**.
6.  Click **Create Database**.
7.  **IMPORTANT:** Once created, scroll down to the "Connection" section and copy the **"Internal Database URL"**. You will need this!

---

## Step 3: Deploy the Application
1.  Go to Dashboard -> **New +** -> **Web Service**.
2.  Connect your **GitHub** account and select your `MediCare` repository.
3.  **Name**: `medicare-app`.
4.  **Runtime**: Select **Docker**.
5.  **Region**: Same as your database.
6.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these **Three** keys:

    | Key | Value |
    |-----|-------|
    | `SPRING_DATASOURCE_URL` | *(Paste the "Internal Database URL" you copied in Step 2)* |
    | `DB_USERNAME` | `postgres` |
    | `DB_PASSWORD` | *(Paste the password provided by Render for your database)* |

7.  Click **Create Web Service**.

Render will now verify your `Dockerfile`, build your backend and frontend, and start the server. This might take 5-10 minutes.

---

## Step 4: Connect Your Domain
1.  Once your Web Service is **Live** (green checkmark), go to the **Settings** tab of your Web Service.
2.  Scroll down to **Custom Domains**.
3.  Click **Add Custom Domain**.
4.  Enter: `rohittrajakk.tech`
5.  Render will give you a **DNS Record** (A Record or CNAME) to add.
6.  Go to where you bought your domain (GoDaddy, Namecheap, etc.) and add that record.

**That's it!** Your website will be live at `https://rohittrajakk.tech`.
