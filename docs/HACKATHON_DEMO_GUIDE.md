# CivicLens AI — Hackathon Demonstration Guide

**Event:** Hacktoberfest Hack Day Lucknow  
**Track:** Option 1: Best Open-Source AI Project  
**Demo Duration:** ~3 Minutes  

---

## ⚡ 3-Minute Quick Demonstration Script for Judges

### Step 1: Open the Application & Check System Diagnostics
1. View the top navigation bar sub-banner:
   - Notice: `SQLite Persistent Storage: Active`
   - Notice: `Inference: gemini-3.8-flash (gemini)`
2. Notice the live Lucknow city activity stats on the Home page (4 pre-seeded realistic reports from Hazratganj, Gomti Nagar, Alambagh, and Indira Nagar).

---

### Step 2: Test 1-Click Multimodal Photo Triage (The "Magic" Moment)
1. Click the **"Report Issue"** button in the navbar.
2. In the photo section, look at the green box titled **"Hackathon Quick-Test: 1-Click Multimodal Photo Samples"**:
   - Click **"Pothole Road Damage"** (or "Overflowing Waste Bin").
3. Notice that:
   - The photo evidence preview attaches automatically.
   - Title, description, and location auto-populate with realistic field data.
4. Click **"Analyze with AI Triage"**.
5. Observe the live AI inference in real time:
   - Evaluates road hazard severity.
   - Correctly assigns **High Priority** due to skidding risk.
   - Maps to **Lucknow Nagar Nigam (Zone 1 - Public Works)**.
   - Highlights **Missing Information** (e.g. pole ID, road milestone).
   - Generates a formal, respectful **Complaint Letter Draft** addressed to the Municipal Commissioner.
6. Test **Human-in-the-Loop Agency**:
   - Edit a sentence in the complaint draft or adjust the priority dropdown.
7. Click **"Confirm & Save Report"**:
   - Confetti bursts 🎉
   - Unique reference ID generated (e.g. `LKO-2026-XXXX`).
   - Persisted directly into SQLite!

---

### Step 3: Explore the Public Grievance Feed
1. Click **"Public Feed"** in the navbar.
2. Filter by category: click **"Roads & Potholes"** or **"Sanitation & Waste"**.
3. Use the search bar to search for `Metro` or `Hazratganj`.
4. Click the **thumbs up (Upvote)** icon on any report to see the community solidarity count increment in real time.
5. Click on any report card to open the **Report Details Modal**:
   - Review the complete **Resolution Audit Trail**.
   - Copy or Print the official complaint letter.

---

### Step 4: Admin Demonstration Review Panel
1. Click **"Admin Demo"** in the navbar.
2. Click **"One-Click Unlock with Default PIN (1234)"**.
3. Find any report and click **"Change Status"**:
   - Update status to `Action In Progress` or `Resolved`.
   - Add an official note: `"Emergency cold mix bituminous patch applied by Zone 1 team."`
   - Click **"Apply Status Update"**.
4. The SQLite database updates immediately, and the new audit history entry appears with timestamp and officer badge!

---

### Step 5: Verify Automated Test Suite
Open the terminal and run:
```bash
npm test
```
Observe all 25 automated unit tests passing across input validation, SQLite persistence, AI validation, and graceful offline fallback handling.
