# USAJOBS Weekly Digest

Sends a weekly email with entry-level federal job listings available in Puerto Rico and remote positions. Runs free on GitHub Actions.

---

## Setup (one time, ~15 minutes)

### 1. Get your API keys

**USAJOBS:**
1. Go to https://developer.usajobs.gov/apirequest/
2. Fill out the form. Key arrives by email (usually within a day).

**Resend:**
1. Sign up free at https://resend.com
2. Go to API Keys and create one.
3. Add and verify your sending domain (or use their onboarding.resend.dev sandbox for testing).

---

### 2. Create a GitHub repo

1. Create a new repo at https://github.com/new (can be private)
2. Push this project to it:

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/usajobs-digest.git
git push -u origin main
```

---

### 3. Add GitHub Secrets

Go to your repo on GitHub: **Settings > Secrets and variables > Actions > New repository secret**

Add these 5 secrets:

| Secret name | Value |
|---|---|
| `USAJOBS_API_KEY` | Your USAJOBS API key |
| `USAJOBS_EMAIL` | The email you used to register with USAJOBS |
| `RESEND_API_KEY` | Your Resend API key |
| `EMAIL_FROM` | Sending address (must be on your verified Resend domain) |
| `EMAIL_TO` | Your personal email address to receive the digest |

---

### 4. Test it manually

Once secrets are set, go to your repo on GitHub:
**Actions > Weekly Jobs Digest > Run workflow**

Check your inbox within ~30 seconds.

---

## Schedule

Runs every Monday at 8:00 AM UTC (4:00 AM Puerto Rico / AST).
To change the schedule, edit `.github/workflows/digest.yml` and update the cron expression.

---

## Filters applied

- `WhoMayApply=public` (open to all U.S. citizens)
- `PayGradeLow=01` / `PayGradeHigh=07` (GS-01 to GS-07, entry-level proxy)
- `DatePosted=7` (posted in the last 7 days only)
- Two passes: Puerto Rico location + remote listings
- Deduplicated by USAJOBS Control Number

---

## Customizing

**Change grade range:** Edit `PayGradeLow` / `PayGradeHigh` in `src/digest.js`

**Add job category filter:** Add `JobCategoryCode: "2210"` (or any series code) to the query objects in `src/digest.js`

**Add more recipients:** Change `to: [process.env.EMAIL_TO]` in `src/mailer.js` to an array of addresses
