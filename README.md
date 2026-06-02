

---

# ClubVault — Club Finance Manager

ClubVault is a lightweight, offline-first financial management system built for club treasurers. It runs entirely in the browser — no server, no database, no subscription required.

---

## Getting Started

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## How It Works

### Login & Roles
ClubVault supports two users. On the login screen, select your role and enter your password:

- **Admin** (`admin` / `admin123`) — full access to all features
- **Viewer** (`viewer` / `viewer123`) — read-only access; can view and print reports

Passwords can be changed anytime under **Settings**.

---

### Dashboard
The first thing you see after logging in. Shows your club's current balance, total income, total expenses, and transaction count. A 6-month area chart tracks income vs expenses over time, and the five most recent transactions are listed for quick reference.

---

### Transactions
The complete record of all club money movement. Each transaction has a date, type (income or expense), category, and description. Admins can add, edit, and delete records. Viewers can search and browse but cannot make changes.

---

### Analytics
Visual breakdowns of the club's financial data — a monthly bar chart comparing income and expenses, a pie chart showing spending by category, and a budget progress tracker that highlights categories where spending is approaching or exceeding the set limit.

---

### Reports
Generate a formatted financial report for any period — this month, this quarter, this year, or all time. Click **Preview PDF** to see the full report inside the app before committing. Admins can download it as a PDF or export raw data as CSV. Viewers can preview and print.

---

### Accountability
A full chronological audit log of every transaction, each stamped with a unique ID. Also runs automatic health checks on the data — flagging missing descriptions, uncategorised entries, or a negative balance — so the records stay clean and trustworthy.

---

### Settings *(Admin only)*
Configure the club name, treasurer name, currency symbol, and fiscal year. Set monthly budget targets for each expense category. Change the admin and viewer passwords. The danger zone lets you wipe all transaction data if needed.

---

## Data & Privacy
All data is stored in your browser's **localStorage**. Nothing is sent to any server. Data persists between sessions on the same device and browser. To back up your data, use the **Export CSV** button in Reports.

---

## Default Credentials

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | admin    | admin123   |
| Viewer | viewer   | viewer123  |

*Change these immediately in Settings after first login.*
