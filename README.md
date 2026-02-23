# Instant Link Shortener (ILS) 🚀

A lightning-fast, serverless URL shortener built on Cloudflare Pages and KV. Features an Apple iOS-style Glassmorphism UI, built-in security, role-based administration, and public access toggles.

## ✨ Key Features
- **Serverless & Free:** Runs entirely on Cloudflare Edge (Pages + Functions).
- **Auto-i18n:** Automatically detects user language (supports English & Persian).
- **Security First:** Built-in IP rate limiting and bad-word content filtering.
- **Admin Dashboard:** Full dashboard to view links, track blocked IPs, manage sub-admins, and configure system settings.
- **Private Mode:** Easily disable public link creation so only authenticated team members can use the service.
- **Time-to-Live (TTL):** Option to create temporary, self-destructing short links.

## 🛠 Direct Deploy (Zip Upload Method)

You can deploy this project directly from your browser in less than 2 minutes without using Git!

### Step 1: Prepare the Files
1. Download this repository as a `.zip` file.
2. Ensure the zip contains the `public` folder, `functions` folder, and `wrangler.toml` at the root.

### Step 2: Create a Cloudflare KV Database
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** -> **KV**.
3. Click **Create a namespace**, name it `ILS`, and click Add.

### Step 3: Deploy to Cloudflare Pages
1. Go to **Workers & Pages** -> **Overview** and click **Create application**.
2. Select the **Pages** tab and choose **Upload assets** (Direct Upload).
3. Name your project and upload the `.zip` file you prepared.
4. Click **Deploy**.

### Step 4: Configure Environment Variables
Once deployed, connect the database and set your admin password:
1. Go to your Pages project **Settings**.
2. Navigate to **Functions** -> **KV namespace bindings**.
   - Variable name: `ILS`
   - KV namespace: *Select the KV you created in Step 2*.
3. Navigate to **Environment variables** (under Settings). Add a new variable:
   - Variable name: `MASTER_KEY`
   - Value: *Enter a strong, secret password (e.g., `SuperSecret123`)*.
4. **Important:** Go back to the **Deployments** tab and click **Retry deployment** to apply these variables.

## 🔒 Email Authentication via Cloudflare Zero Trust (Highly Recommended)

To add enterprise-grade security to your admin panel without modifying the code, use Cloudflare Access:

1. In your Cloudflare Dashboard, go to **Zero Trust** -> **Access** -> **Applications**.
2. Click **Add an application** -> **Self-hosted**.
3. Name it "Admin Panel" and set the subdomain to your Pages URL with the path `/admin.html` (e.g., `your-app.pages.dev/admin.html`).
4. Under **Policies**, create a rule:
   - Action: **Allow**
   - Include: **Emails** -> *Type your personal email address here*.
5. Save the application. Now, anyone trying to access the admin panel will be prompted to enter a One-Time PIN sent to their email!

## 💻 Usage
- **Public Interface:** Navigate to your Pages domain (e.g., `https://your-app.pages.dev`).
- **Super Admin Dashboard:** Navigate to `https://your-app.pages.dev/admin.html` and log in with your `MASTER_KEY`.

## 🌍 Custom Domain Support
Want to use your own domain (e.g., `link.yourdomain.com`)? Cloudflare Pages makes it free and easy!
1. Go to your Cloudflare Pages project.
2. Click on the **Custom Domains** tab.
3. Click **Set up a custom domain** and enter your desired domain.
4. Cloudflare will automatically configure the DNS and SSL.
5. The ILS script will dynamically detect your new domain and generate all future short links using it!

## 🛡️ License
MIT License. Free to use, modify, and distribute.
