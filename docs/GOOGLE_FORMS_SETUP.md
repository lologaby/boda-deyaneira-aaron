# Google Forms RSVP Setup

The website form sends: **Name**, **Attendance** (yes/no), **Guests** (1–6), **Song**. Your Google Form must have one question for each. If the Name question is missing or the entry IDs are wrong, names will not appear in Sheets.

---

## 1) Create the Form

Add these **four questions in this order** (do not skip Full Name):

| # | Question    | Type              | Required |
|---|-------------|-------------------|----------|
| 1 | **Full Name** | Short answer      | ✓        |
| 2 | Attendance  | Short answer or Dropdown | ✓  |
| 3 | Guests     | Short answer or Number   | ✓  |
| 4 | Song       | Short answer      | —        |

- Make the form **accepting responses** and **public** (Anyone with the link).
- The website sends `"yes"` or `"no"` for Attendance. If you use a dropdown, you can use those same options.
- For Guests, the site sends a number 1–6.

---

## 2) Get the Form Action URL

- Open the **public form link**:  
  `https://docs.google.com/forms/d/e/FORM_ID/viewform`
- Change `viewform` to `formResponse`:  
  `https://docs.google.com/forms/d/e/FORM_ID/formResponse`
- Put that URL in **`VITE_GOOGLE_FORM_ACTION`** in your `.env`.

---

## 3) Get Entry IDs

- In the form editor, click **⋮** (More) → **Get pre-filled link**.
- Enter a sample value in **each** of the four questions (e.g. "Jane Doe", "yes", "2", "Callaita").
- Click **Get link** and copy the URL.
- In the URL you’ll see `entry.123456789`, `entry.234567890`, etc. The **order in the URL matches the order of your questions**:
  - The **first** `entry.XXXX` = **Full Name** → `VITE_GOOGLE_FORM_ENTRY_NAME`
  - The **second** = Attendance → `VITE_GOOGLE_FORM_ENTRY_ATTENDANCE`
  - The **third** = Guests → `VITE_GOOGLE_FORM_ENTRY_GUESTS`
  - The **fourth** = Song → `VITE_GOOGLE_FORM_ENTRY_SONG`

Example URL:  
`...viewform?usp=pp_url&entry.111111111=Jane+Doe&entry.222222222=yes&entry.333333333=2&entry.444444444=Callaita`

Then in `.env`:

```
VITE_GOOGLE_FORM_ENTRY_NAME=entry.111111111
VITE_GOOGLE_FORM_ENTRY_ATTENDANCE=entry.222222222
VITE_GOOGLE_FORM_ENTRY_GUESTS=entry.333333333
VITE_GOOGLE_FORM_ENTRY_SONG=entry.444444444
```

---

## 4) Link to Google Sheets (Optional)

- Open the form → **Responses**.
- Click **Link to Sheets** and create a spreadsheet.
- New submissions will appear as rows. Columns should match: Timestamp, Full Name, Attendance, Guests, Song (if you use those titles).

---

## 5) Test

- Run `npm run dev`, open the RSVP section, and submit a test.
- In the linked Google Sheet, confirm a new row with **Name**, Attendance, Guests, and Song filled.

---

## Troubleshooting

### Name is missing in the Google Sheet

- The **Full Name** question is required. Add it as the **first** question (Short answer) if it’s missing.
- In **Get pre-filled link**, you must fill every question, including Full Name. The first `entry.XXXX` in the URL is Full Name — use it for `VITE_GOOGLE_FORM_ENTRY_NAME`.
- If you added Full Name after creating the form, get a **new** pre-filled link and update `VITE_GOOGLE_FORM_ENTRY_NAME` with the new `entry.XXXX` for that question.
- Restart the dev server (`npm run dev`) after changing `.env` so the new values are picked up.

### Wrong data in columns (e.g. name in Attendance column)

- Entry IDs must match each question. Re-open **Get pre-filled link**, fill all four, and copy each `entry.XXXX` into the correct env var (see table in step 3).
- If you reordered or added/removed questions, get a new pre-filled link and update all four `VITE_GOOGLE_FORM_ENTRY_*` in `.env`.

### Success toast but no row in the Sheet

- Check that `VITE_GOOGLE_FORM_ACTION` uses `formResponse`, not `viewform`.
- Confirm the form is **accepting responses** and that the form link is correct.
- Verify all four `VITE_GOOGLE_FORM_ENTRY_*` are set in `.env` and that you’ve restarted the dev server (or rebuilt) after editing `.env`.

### Error toast when submitting

- Usually a network or CORS issue. The action URL must be the `formResponse` URL.
- For production (e.g. GitHub Pages), `VITE_*` must be set at **build time**. Configure them in your CI (e.g. GitHub Actions secrets) or in the environment where `npm run build` runs.

---

## Checklist

- [ ] Form has **Full Name** (1st), Attendance, Guests, Song.
- [ ] Form is accepting responses and is public.
- [ ] `VITE_GOOGLE_FORM_ACTION` = `.../formResponse` (not `viewform`).
- [ ] All four `VITE_GOOGLE_FORM_ENTRY_*` are set from a **Get pre-filled link** (with all four questions filled).
- [ ] `.env` is in the project root; dev server restarted after changing `.env`.
- [ ] For deploy: `VITE_*` are set in the build environment.
