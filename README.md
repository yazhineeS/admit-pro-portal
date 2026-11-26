# AdmitPro - College Admission Portal

A frontend-only college admission portal built for the **Data Alcott Systems - Free Web Development Internship Online** (Task ID: WD-COL-004, Student Code: DAS-COL-004).

Students register, apply for a course, upload documents and track their status. Admins review applications, generate merit lists, confirm admissions and export reports. No database is used: all data lives in JavaScript arrays and is saved in the browser with `localStorage`.

## Links

- **Task link / blog post:** https://www.freeinternships.in/blog/
- **Live website:** _add your GitHub Pages / Netlify / Vercel link_
- **YouTube demo:** _add your video link_

## Features

**Core**
- Login / Sign up (simulated authentication)
- Student registration with validation
- Multi-step online application form (Student -> Course & Scores -> Review)
- Application listing with search and filters (status, course, date)
- Application detail view with documents, comments and status tracking
- Document upload (simulated - only file names are stored)
- Application review: mark Under Review, Approve (Shortlist) or Reject with comments
- Merit list generation by course, seats and minimum score

**Bonus**
- Admission confirmation and printable admission letter
- Export reports to CSV and PDF (print)
- Application status tracking timeline
- Course-wise analytics (bar charts)
- Simulated email notifications (toast messages)
- Dark mode toggle

## Tech Stack

- HTML5
- CSS3 (CSS variables, Grid, Flexbox, media queries)
- Vanilla JavaScript (ES6)
- Font Awesome icons, Google Fonts (Poppins)

## How to Run

1. Download or clone the repository:
   ```
   git clone https://github.com/your-username/admit-pro-portal.git
   ```
2. Open the `admit-pro-portal` folder.
3. Double-click `index.html` (or open it with Live Server in VS Code).
4. Log in with the demo account:
   - **Email:** `admin@admitpro.com`
   - **Password:** `admin123`

To reset all data to the sample data, open the browser console and run `localStorage.clear()`, then refresh.

## Project Structure

```
admit-pro-portal/
├── index.html   # Pages and layout
├── style.css    # Styling, dark mode and responsive design
├── script.js    # Data, CRUD, filters, merit list, reports
└── README.md
```

## How the Merit List Works

- Total Score = 60% Academic Score + 40% Entrance Score
- Only **Shortlisted** applicants for the selected course are ranked
- Applicants below the minimum score are skipped, and only the top N (seats) are listed
- Ranked applicants move to **Merit List** status, and can then be confirmed as **Admitted**

## Typical Workflow

1. Register a student -> 2. Fill the Application Form -> 3. Upload documents -> 4. Review and approve -> 5. Generate Merit List -> 6. Confirm Admission and print the letter -> 7. View Reports

## Learning Outcomes

- Structuring a multi-page interface with semantic HTML
- Responsive design with CSS Grid, Flexbox and media queries
- Managing application state with JavaScript arrays and `localStorage`
- Building search, filter, multi-step form and CRUD logic
- Deploying a static site and documenting a project on GitHub

## Author

_Your Name_ - Student Code: DAS-COL-004