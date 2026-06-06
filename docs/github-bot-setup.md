# DealVault Bot — GitHub App Setup Guide

This guide walks you through creating and configuring the **DealVault Bot** GitHub App.

## Step 1: Create the GitHub App

1. Go to **https://github.com/organizations/DealVaultHQ/settings/apps/new**
   (or if doing it personally first: https://github.com/settings/apps/new)

2. Fill in the following:

| Field | Value |
|-------|-------|
| **GitHub App name** | `DealVault Bot` |
| **Description** | Automates contributor applications and issue assignment for DealVault |
| **Homepage URL** | `https://your-platform-url.com` (or `https://dealvault.dev`) |
| **Webhook URL** | `https://YOUR-RENDER-URL.onrender.com/api/webhooks/github` |
| **Webhook secret** | Generate one (see Step 2) |

3. **Permissions** — Set the following:

   **Repository permissions:**
   | Permission | Access |
   |------------|--------|
   | **Issues** | Read & Write |
   | **Metadata** | Read-only |

4. **Subscribe to events** — Check these boxes:
   - ✅ Issues
   - ✅ Issue comment

5. **Where can this GitHub App be installed?**
   - Select: **Only on this account** (DealVaultHQ org)

6. Click **Create GitHub App**

## Step 2: Generate Credentials

### Webhook Secret
Run this in your terminal to generate a secure webhook secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as the webhook secret during app creation.

### Private Key
1. After creating the app, scroll down to **"Private keys"** section
2. Click **"Generate a private key"**
3. A `.pem` file will be downloaded
4. **Base64-encode it** for use in environment variables:
```bash
cat your-downloaded-key.pem | base64 | tr -d '\n'
```
5. Copy the entire base64 string — this is your `GITHUB_APP_PRIVATE_KEY`

### App ID
After creating the app, you'll see the **App ID** at the top of the app settings page.

## Step 3: Install the App

1. Go to your app's settings page: `https://github.com/settings/apps/dealvault-bot`
2. Click **"Install App"** in the sidebar
3. Select the **DealVaultHQ** organization
4. Choose **"Only select repositories"** → select `dealvault-platform-escrow`
5. Click **Install**
6. After installing, check the URL — it will contain the **Installation ID**:
   ```
   https://github.com/organizations/DealVaultHQ/settings/installations/XXXXXXXX
   ```
   The number at the end (`XXXXXXXX`) is your `GITHUB_APP_INSTALLATION_ID`

## Step 4: Add Environment Variables to Render

1. Go to your Render dashboard → select your backend service
2. Go to **Environment** tab
3. Add the following environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `GITHUB_APP_ID` | Your App ID | From Step 2 |
| `GITHUB_APP_PRIVATE_KEY` | Base64-encoded private key | From Step 2 |
| `GITHUB_WEBHOOK_SECRET` | Your generated secret | From Step 2 |
| `GITHUB_APP_INSTALLATION_ID` | Installation ID | From Step 3 |
| `PLATFORM_BASE_URL` | `https://your-frontend-url.com` | Your frontend URL |

4. Click **Save Changes** — Render will automatically redeploy

## Step 5: Create the `dealvault` Label

1. Go to your repo: `https://github.com/DealVaultHQ/dealvault-platform-escrow/labels`
2. Click **"New label"**
3. Fill in:
   - **Label name:** `dealvault`
   - **Description:** `Issue tracked on DealVault Platform`
   - **Color:** Pick a distinctive color (e.g., `#6366f1` purple)
4. Click **"Create label"**

## Step 6: Test the Bot

1. Create a test issue on the repo (or use an existing one)
2. Add the `dealvault` label to it
3. Within a few seconds, the bot should comment:

   > This issue has been added to the **DealVault Platform** 🏦
   >
   > 🧑‍💻 **Interested in contributing?** Apply to work on this issue on DealVault...

4. If the comment doesn't appear, check:
   - Render logs for errors (`Dashboard → Logs`)
   - GitHub App → Advanced → Recent Deliveries (shows webhook payloads)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot doesn't comment | Check Render logs and GitHub webhook deliveries |
| 401 signature error | Verify `GITHUB_WEBHOOK_SECRET` matches exactly |
| "App not installed" error | Ensure the app is installed on the correct repo |
| Permission denied | Check the app has Issues Read & Write permission |
| Webhook not received | Verify the webhook URL points to your Render deployment |

## API Endpoints (for reference)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/webhooks/github` | POST | Webhook signature | GitHub webhook receiver |
| `/api/issues` | GET | Public | List platform issues |
| `/api/issues/:owner/:repo/:number` | GET | Public | Get issue + applications |
| `/api/issues/:id/funding` | PATCH | Maintainer | Update issue funding |
| `/api/applications` | POST | Auth | Submit application |
| `/api/applications` | GET | Auth | List applications |
| `/api/applications/:id` | GET | Auth | Get application details |
| `/api/applications/:id/confirm` | PATCH | Maintainer | Confirm application |
| `/api/applications/:id/reject` | PATCH | Maintainer | Reject application |
