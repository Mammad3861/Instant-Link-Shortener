# Instant Link Shortener (ILS) 🚀

A lightning-fast, serverless URL shortener built on Cloudflare Pages and KV. Features an Apple iOS-style Glassmorphism UI, built-in security, role-based administration, and public access toggles.

## ✨ Key Features
- **Serverless & Free:** Runs entirely on Cloudflare Edge (Pages + Functions).
- **Auto-i18n:** Automatically detects user language (supports English & Persian).
- **Security First:** Built-in IP rate limiting and bad-word content filtering.
- **Admin Dashboard:** Full dashboard to view links, track blocked IPs, manage sub-admins, and configure system settings.
- **Private Mode:** Easily disable public link creation so only authenticated team members can use the service.
- **Custom Domain:** Automatically supports your own custom domains (e.g., `link.yourdomain.com`).

## 🛠 Direct Deploy (GitHub Integration)

This project is designed to be deployed directly and automatically via Cloudflare Pages using GitHub integration.

### Step 1: Fork this Repository
1. Click the **Fork** button at the top right of this page to copy the project to your own GitHub account.

### Step 2: Create a Cloudflare KV Database
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** -> **KV**.
3. Click **Create a namespace**, name it `ILS`, and click Add.

### Step 3: Deploy to Cloudflare Pages
1. Go to **Workers & Pages** -> **Overview** and click **Create application**.
2. Select the **Pages** tab and click **Connect to Git**.
3. Select your forked repository and click **Begin setup**.
4. In the setup page, leave **Framework preset** as `None`.
5. Ensure the **Build command** and **Build output directory** are completely **empty**.
6. Click **Save and Deploy**. (Wait for the initial build to finish, then click Continue to project).

### Step 4: Configure Database and Security Key
1. Go to your Pages project **Settings**.
2. Navigate to **Functions** -> **KV namespace bindings**.
   - Variable name: `ILS`
   - KV namespace: *Select the KV you created in Step 2*.
3. Navigate to **Environment variables** (under Settings). Add a new variable:
   - Variable name: `MASTER_KEY`
   - Value: *Enter a strong, secret password or UUID*. (Click Encrypt to hide it).
4. **Important:** Go back to the **Deployments** tab and click **Retry deployment** to apply these database variables.

### Step 5: Enable Google Safe Browsing (Optional but Recommended)
For enterprise-grade security, you can connect the system to Google's threat database to automatically block malware and phishing links.
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Safe Browsing API**.
3. Generate an API Key.
4. Go to your Cloudflare Pages project **Settings** -> **Environment variables**.
5. Add a new variable:
   - Variable name: `SAFE_BROWSING_KEY`
   - Value: *Your Google API Key*
*(If you skip this step, the system will seamlessly fall back to its internal ultra-fast Regex filter).*

## 🔒 Email Authentication via Cloudflare Zero Trust (Highly Recommended)

To add enterprise-grade security to your admin panel without modifying the code:
1. In your Cloudflare Dashboard, go to **Zero Trust** -> **Access** -> **Applications**.
2. Click **Add an application** -> **Self-hosted**.
3. Name it "Admin Panel" and set the subdomain to your Pages URL with the path `/dashboard.html`.
4. Under **Policies**, create a rule (Action: **Allow**, Include: **Emails** -> *Your Email*).
5. Save. Anyone accessing the admin panel will now need a One-Time PIN sent to your email!

## 💻 Usage
- **Public Interface:** Navigate to your Pages domain (e.g., `your-domain.pages.dev`).
- **Super Admin Dashboard:** Navigate to `your-domain.pages.dev/dashboard.html` and log in with your `MASTER_KEY`.

## 🛡️ License
MIT License. Free to use, modify, and distribute.
