# QUANTRIX

> **"Turn Complexity Into Clarity."**
> 
> *A personal intelligence platform for understanding your finances, optimizing your time, and discovering insights hidden in your data.*
> 
> **FINANCE · TIME · DATA**  
> *Make better decisions with the power of computation.*

QUANTRIX is a premium, local-first personal intelligence and data analytics platform built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**.

It combines three interconnected analytical engines into a unified SaaS interface:
1. **Money Simulator**: Deterministic cashflow modeling, 12-month savings projections, What-If sensitivity adjustments, and rule-based arithmetic financial recommendations.
2. **Time Simulator**: 24-hour routine balancing, strict overflow validation, What-If time reallocations, and an algorithmic collision-free timetable generator.
3. **CSV Data Intelligence**: Local in-browser CSV parsing via PapaParse, dataset profiling, granular data-quality anomaly auditing, interactive visual charts (histograms, scatter plots, correlation heatmaps), and a non-destructive Data Cleaning Studio with CSV export.

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure **Node.js** (v18+ or v24+) and **npm** are available.

### Installation & Running Locally

1. **Clone or open the project folder:**
   ```bash
   cd c:\Users\pc\Downloads\GoogleAnt
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at: **`http://localhost:5173`**

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

---

## 💎 Architecture & Module Breakdown

### 1. Money Simulator (`/src/components/money/`)
- **Interactive Budget Inputs**: Income, rent, food, transport, entertainment, other expenses, and savings targets.
- **Dynamic Currency Support**: Default **INR (₹)** with one-click toggles for USD ($), EUR (€), GBP (£), JPY (¥), CAD (CA$), and AUD (A$).
- **Deterministic Math**: Calculates exact monthly surplus/deficit, savings rate, target achievement, and 6/12-month projections.
- **Interactive Visualizations**: Expense breakdown donut chart (Recharts) with center metric and 12-month wealth accumulation area chart.
- **What-If Sensitivity Engine**: Instant slider variations for rent, food, income, and leisure with before/after surplus comparisons.
- **Personalized Insights Engine**: Rule-based findings showing the transparent arithmetic behind every recommendation (e.g. 50/30/20 budget ratio checks and largest outflow cut calculations).

### 2. Time Simulator (`/src/components/time/`)
- **Daily Budget Inputs**: Sleep, college/work, commute, study, entertainment, meals & personal care, and other commitments.
- **Strict 24-Hour Validation**: Warns on schedule overflow and prevents silent truncation.
- **Compounding Study Projections**: Multiplies daily deep work across active days and semester duration (weeks).
- **Interactive Visualizations**: 24-hour visual donut chart and chronological block bar timeline from 00:00 to 24:00.
- **What-If Time Simulator**: Shift time from leisure to study and instantly view weekly and semester compounding gains.
- **Algorithmic Timetable Generator**: Schedules collision-free study blocks around fixed commitments with configurable cognitive break intervals (Pomodoro 50/10 or Ultradian 90/15) and downloadable timetable export.
- **Health Disclaimer**: Clearly specifies that schedules are personal planning aids, not clinical medical advice.

### 3. CSV Data Intelligence (`/src/components/csv/`)
- **Drag-and-Drop Ingestion**: Browser-based parsing via PapaParse (V8 sandbox).
- **Built-in Sample Datasets**: Includes 1-click presets for **Customer Churn & SaaS Analytics**, **Student Academic Performance**, and **Monthly Household Transactions**.
- **Dataset Overview Cards**: Rows, columns, total matrix cells, null cells, whitespace cells, and column types (Numeric, Categorical, Date, Boolean, Mixed).
- **Data Quality Inspector**: Granular issue registry detecting missing cells, whitespace padding, duplicate records, IQR outliers, and mixed column types with exact row indexing and Markdown report export.
- **Interactive Data Grid**: Global search, column sorting, column visibility picker, and cell issue highlighting.
- **Visual Analytics Studio**: Histograms with binning, categorical frequency bar charts, scatter plots with 2 numeric variables, and missing value audits.
- **Pearson Correlation Heatmap**: Full pairwise correlation coefficient matrix with statistical causality warning (`correlation ≠ causation`).
- **Non-Destructive Cleaning Studio**: Remove duplicates, trim whitespace, standardize text casing, impute missing values (mean, median, mode, or custom), and download the sanitized CSV.

---

## 🔒 100% Client-Side Privacy Guarantee

QUANTRIX executes all calculations and CSV parsing directly inside the client browser. No financial data or uploaded records are ever transmitted to third-party cloud services or external AI APIs.
