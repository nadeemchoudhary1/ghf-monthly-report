# GHF Portal – Admin User Guide (एडमिन उपयोगकर्ता मार्गदर्शिका)

This guide explains how authorized Guided Humanity Foundation (GHF) administrators and responsible reviewers use the `/admin` portal.

---

## 1. How to Log In
1. Open `/admin/login` in your browser.
2. Enter your administrator **Email or Username** (`ईमेल या यूज़रनेम`) and **Password** (`पासवर्ड`).
3. Click **लॉगिन करें**.
4. Authentication uses secure `HttpOnly` session cookies issued by the backend. If you see an authorization prompt after inactivity, log in again.

## 2. Dashboard Overview (`/admin`)
- Displays real-time MongoDB summary counts:
  - **Total Submissions**: All records stored in MongoDB.
  - **Current Month Submissions**: Records matching the current `YYYY-MM` month.
  - **Pending Review (`rs = 0`)**, **Reviewed (`rs = 1`)**, and **Approved (`rs = 2`)**.
- Shows a paginated **Recent Submissions** table with quick **विवरण देखें** links.

## 3. Viewing All Submissions (`/admin/submissions`)
- Open **सभी जायज़े (Submissions)** from the sidebar (or mobile menu drawer).
- Each row displays Submission ID (`SID`), Member Name, Mobile / Email, City / Area, Assessment Month & Submission Date, Review Status, and **Email / Google Sheets Sync Status** badges.
- Use the **प्रति पृष्ठ** selector (`10`, `25`, `50`) and **पिछला / अगला** buttons for paginated navigation.

## 4. Searching & Filtering Records
- **Search**: Type a Member Name, Mobile Number, Email, City, or Submission ID (`GHF-...`) into the search box.
- **Filters**: Filter by **Assessment Month**, **City / Area**, and **Review Status** (`Pending`, `Reviewed`, `Approved`).
- **Sorting**: Sort by Newest First, Oldest First, Member Name, or Assessment Month.
- Click **फ़िल्टर रीसेट** to clear all active filters.

## 5. Viewing Individual Member Details (`/admin/submissions/:sid`)
- Click **विवरण / देखें** on any row to open the full 9-section assessment.
- Sections 1–8 display all member answers decoded from numeric database codes into readable Hindi labels.

## 6. Completing Responsible Review (Section 9) & Approving a Submission
1. Scroll to **भाग 9 : ज़िम्मेदार की समीक्षा (Responsible Review)** at the bottom of `/admin/submissions/:sid`.
2. Choose the **समीक्षा स्थिति (Review Status)**:
   - `0` — **Pending Review** (लंबित समीक्षा)
   - `1` — **Reviewed** (समीक्षित)
   - `2` — **Approved** (स्वीकृत)
3. Fill in feedback fields (`नमाज़ और व्यक्तिगत इबादत`, `इल्मी मुताले और सिलेबस की प्रगति`, `मीटिंग में भागीदारी`, `बैतुलमाल में योगदान`, `साथी की प्रमुख खूबियाँ`, `सुधार के लिए विशेष हिदायत`, `अगले महीने की कार्ययोजना`, signatures, and review date).
4. Click **समीक्षा सहेजें**.
   - MongoDB saves the review immediately and marks Google Sheets synchronization pending so the existing row in Google Sheets is updated automatically without duplicating the record.

## 7. Retrying Failed Emails & Google Sheets Sync
- **Per Submission**: On `/admin/submissions/:sid`, check the **सिंक स्थिति** badges and click **Retry Email** or **Retry Sheets Sync** if either shows `Failed` or `Pending`. (Already-sent emails are never duplicated.)
- **Bulk Retry**: Open **सेटिंग्स → इंटीग्रेशन** (`/admin/integrations`) and click **Retry Failed Email** or **Retry Failed Sheets Sync**.
- **Connection Tests**: Use **Test Email Configuration** or **Test Google Sheets Connection** to verify provider settings without sending member data.

## 8. Exporting CSV & Excel Reports
1. Open **सभी जायज़े (Submissions)** (`/admin/submissions`).
2. Optionally select **Month**, **City**, **Review Status**, and **Export Date Range** (`एक्सपोर्ट अवधि`).
3. Click **CSV एक्सपोर्ट** (UTF-8 BOM encoded for Hindi in Microsoft Excel) or **Excel (.xlsx) एक्सपोर्ट** (includes a master `All Submissions` sheet plus 9 separate section sheets).

## 9. Checking System Health (`/admin/system-health`)
- Open **सिस्टम हेल्थ** from the Admin sidebar to inspect:
  - Backend status & uptime
  - MongoDB Atlas connectivity & total records
  - Email & Google Sheets configuration status
  - Pending / Failed / Completed background sync jobs and recent error codes.

## 10. Changing the Admin Password (`/admin/change-password`)
1. Open **पासवर्ड बदलें** from the sidebar.
2. Enter your **Current Password**, **New Password** (minimum 8 characters), and **Confirm New Password**.
3. Click **पासवर्ड अपडेट करें**.
