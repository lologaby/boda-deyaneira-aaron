## Google Forms RSVP Setup

### 1) Create the Form
- Add fields in this order:
  - Full Name (short answer)
  - Attendance (short answer or dropdown)
  - Guests (short answer or number)
  - Song (short answer)
- Make sure the form is **accepting responses** and is **public**.

### 2) Get the Form Action URL
- Open the **public form link**:
  `https://docs.google.com/forms/d/e/FORM_ID/viewform`
- Convert it to:
  `https://docs.google.com/forms/d/e/FORM_ID/formResponse`
- Paste that into `VITE_GOOGLE_FORM_ACTION`.

### 3) Get Entry IDs
- Open the form editor.
- Click **⋮** (More) → **Get pre-filled link**.
- Fill sample values for each field and click **Get link**.
- Copy the URL and extract the `entry.########` keys.
- Map them to:
  - `VITE_GOOGLE_FORM_ENTRY_NAME`
  - `VITE_GOOGLE_FORM_ENTRY_ATTENDANCE`
  - `VITE_GOOGLE_FORM_ENTRY_GUESTS`
  - `VITE_GOOGLE_FORM_ENTRY_SONG`

### 4) Save to Google Sheets (Optional)
- Open the form → **Responses** tab.
- Click **Link to Sheets** to create a spreadsheet.
- All submissions will appear there automatically.

### 5) Test
- Run `npm run dev`.
- Submit the RSVP and check the Google Sheet for a new row.
