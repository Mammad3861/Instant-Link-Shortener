# Instant Link Shortener (ILS) 🚀

A lightning-fast, serverless URL shortener built on Cloudflare Pages and KV. Features an Apple iOS-style Glassmorphism UI, built-in security, role-based administration, and public access toggles.

## ✨ Key Features
- **Serverless & Free:** Runs entirely on Cloudflare Edge (Pages + Functions).
- **Auto-i18n:** Automatically detects user language (supports English & Persian).
- **Security First:** Built-in IP rate limiting and bad-word content filtering.
- **Admin Dashboard:** Full dashboard to view links, track blocked IPs, manage sub-admins, and configure system settings.
- **Private Mode:** Easily disable public link creation so only authenticated team members can use the service.
- **Custom Domain:** Automatically supports your own custom domains (e.g., `link.yourdomain.com`).

## 🛠 Direct Deploy (Zip Upload Method)

You can deploy this project directly from your browser in less than 2 minutes without using Git!

### Step 1: Download the Correct Release File
1. Go to the [Releases page]([../../releases/latest](https://github.com/Mammad3861/Instant-Link-Shortener/releases/latest)) of this repository.
2. Under the **Assets** section of the latest release, download the **`ILS-Deploy-vX.X.X.zip`** file. 
*(⚠️ Note: Do **not** download the "Source code (zip)", as GitHub adds an extra folder wrapper that breaks the Cloudflare deployment).*

### Step 2: Create a Cloudflare KV Database
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** -> **KV**.
3. Click **Create a namespace**, name it `ILS`, and click Add.

### Step 3: Deploy to Cloudflare Pages
1. Go to **Workers & Pages** -> **Overview** and click **Create application**.
2. Select the **Pages** tab and choose **Upload assets** (Direct Upload).
3. Name your project and upload the `ILS-Deploy.zip` file you downloaded.
4. Click **Deploy**.

### Step 4: Configure Environment Variables
Once deployed, connect the database and set your admin password:
1. Go to your Pages project **Settings**.
2. Navigate to **Functions** -> **KV namespace bindings**.
   - Variable name: `ILS`
   - KV namespace: *Select the KV you created in Step 2*.
3. Navigate to **Environment variables** (under Settings). Add a new variable:
   - Variable name: `MASTER_KEY`
   - Value: *Enter a strong, secret password or UUID*. (Click Encrypt to hide it).
4. **Important:** Go back to the **Deployments** tab and click **Retry deployment** to apply these variables.

## 🔒 Email Authentication via Cloudflare Zero Trust (Highly Recommended)

To add enterprise-grade security to your admin panel without modifying the code:
1. In your Cloudflare Dashboard, go to **Zero Trust** -> **Access** -> **Applications**.
2. Click **Add an application** -> **Self-hosted**.
3. Name it "Admin Panel" and set the subdomain to your Pages URL with the path `/admin.html`.
4. Under **Policies**, create a rule (Action: **Allow**, Include: **Emails** -> *Your Email*).
5. Save. Anyone accessing the admin panel will now need a One-Time PIN sent to your email!

## 💻 Usage
- **Public Interface:** Navigate to your Pages domain.
- **Super Admin Dashboard:** Navigate to `your-domain.pages.dev/admin.html` and log in with your `MASTER_KEY`.

## 🛡️ License
MIT License. Free to use, modify, and distribute.
