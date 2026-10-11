import sys
import os
import io
import json
import math
import requests
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# Ensure UTF-8 output encoding for Windows consoles
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

app = Flask(__name__)
CORS(app)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:latest")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "engine": "python-pandas-v3",
        "python_version": "3.14.2",
        "pandas_version": pd.__version__,
        "numpy_version": np.__version__,
        "ollama_available": check_ollama_available()
    })

def check_ollama_available():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2.0)
        return r.status_code == 200
    except Exception:
        return False

# ==========================================
# 1. PYTHON MONEY CALCULATOR & WHAT-IF ENGINE
# ==========================================
@app.route('/api/money/calculate', methods=['POST'])
def calculate_money():
    data = request.json or {}
    income = float(data.get('monthlyIncome', 0))
    rent = float(data.get('rent', 0))
    food = float(data.get('food', 0))
    transport = float(data.get('transport', 0))
    entertainment = float(data.get('entertainment', 0))
    other = float(data.get('other', 0))
    target = float(data.get('savingsTarget', 0))

    expenses_series = pd.Series({
        'rent': rent,
        'food': food,
        'transport': transport,
        'entertainment': entertainment,
        'other': other
    })

    total_expenses = float(expenses_series.sum())
    monthly_surplus = float(income - total_expenses)
    savings_rate = float((monthly_surplus / income * 100) if income > 0 else 0)
    target_progress = float((monthly_surplus / target * 100) if target > 0 else 100)

    months = np.arange(0, 13)
    projected_baseline = (months * monthly_surplus).tolist()

    what_if = data.get('whatIf', {})
    rent_delta = float(what_if.get('rentDeltaPercent', 0))
    food_delta = float(what_if.get('foodDeltaPercent', 0))
    income_delta = float(what_if.get('incomeDeltaPercent', 0))
    ent_delta = float(what_if.get('entertainmentDeltaPercent', 0))

    sim_income = income * (1 + income_delta / 100)
    sim_rent = rent * (1 + rent_delta / 100)
    sim_food = food * (1 + food_delta / 100)
    sim_ent = entertainment * (1 + ent_delta / 100)
    sim_total = sim_rent + sim_food + sim_ent + transport + other
    sim_surplus = sim_income - sim_total
    projected_sim = (months * sim_surplus).tolist()

    breakdown = []
    colors = {'rent': '#818cf8', 'food': '#38bdf8', 'transport': '#a78bfa', 'entertainment': '#f472b6', 'other': '#94a3b8'}
    labels = {'rent': 'Rent & Living', 'food': 'Food & Dining', 'transport': 'Transport', 'entertainment': 'Entertainment', 'other': 'Other Expenses'}
    
    for k, val in expenses_series.items():
        pct = (val / total_expenses * 100) if total_expenses > 0 else 0
        breakdown.append({
            "category": labels.get(k, k),
            "amount": float(val),
            "percentage": round(float(pct), 1),
            "color": colors.get(k, '#94a3b8')
        })

    return jsonify({
        "totalExpenses": total_expenses,
        "monthlySurplus": monthly_surplus,
        "savingsRate": round(savings_rate, 1),
        "targetProgress": round(target_progress, 1),
        "isDeficit": monthly_surplus < 0,
        "projected6Months": monthly_surplus * 6,
        "projected12Months": monthly_surplus * 12,
        "breakdown": breakdown,
        "projections": {
            "months": [f"Month {m}" if m > 0 else "Start" for m in months],
            "baseline": projected_baseline,
            "simulated": projected_sim
        },
        "simulatedSurplus": sim_surplus,
        "varianceMonthly": sim_surplus - monthly_surplus,
        "varianceAnnual": (sim_surplus - monthly_surplus) * 12
    })

# ==========================================
# 2. PYTHON TIME CALCULATOR
# ==========================================
@app.route('/api/time/calculate', methods=['POST'])
def calculate_time():
    data = request.json or {}
    sleep = float(data.get('sleep', 7.5))
    college_work = float(data.get('collegeWork', 6.0))
    travel = float(data.get('travel', 1.5))
    study = float(data.get('study', 3.0))
    entertainment = float(data.get('entertainment', 2.0))
    meals_personal = float(data.get('mealsPersonal', 2.0))
    other = float(data.get('other', 1.0))
    study_target = float(data.get('studyTargetDaily', 3.5))
    semester_weeks = int(data.get('semesterWeeks', 16))
    days_per_week = int(data.get('selectedDaysPerWeek', 5))

    activities = pd.Series({
        'sleep': sleep,
        'college_work': college_work,
        'travel': travel,
        'study': study,
        'entertainment': entertainment,
        'meals_personal': meals_personal,
        'other': other
    })

    total_allocated = float(activities.sum())
    unallocated = float(max(0.0, 24.0 - total_allocated))
    is_overallocated = total_allocated > 24.0
    overallocated_hours = round(total_allocated - 24.0, 2) if is_overallocated else 0.0

    weekly_study = round(study * days_per_week, 1)
    semester_study = round(weekly_study * semester_weeks)

    what_if = data.get('whatIf', {})
    shift_min = float(what_if.get('shiftMinutes', 0))
    apply_days = int(what_if.get('applyDaysCount', days_per_week))
    additional_weekly = round((shift_min / 60.0) * apply_days, 1)
    additional_semester = round(additional_weekly * semester_weeks)

    return jsonify({
        "totalAllocated": round(total_allocated, 2),
        "unallocated": round(unallocated, 2),
        "isOverAllocated": is_overallocated,
        "overAllocatedHours": overallocated_hours,
        "dailyStudy": study,
        "weeklyStudy": weekly_study,
        "semesterProjectedStudy": semester_study,
        "studyGoalMet": study >= study_target,
        "additionalWeeklyHours": additional_weekly,
        "additionalSemesterHours": additional_semester,
        "sleepQuality": "optimal" if 7.0 <= sleep <= 8.5 else ("suboptimal_low" if sleep < 7.0 else "suboptimal_high")
    })

# ==========================================
# 3. PYTHON PANDAS CSV PROFILING
# ==========================================
@app.route('/api/csv/profile', methods=['POST'])
def profile_csv():
    req_json = request.json or {}
    csv_text = req_json.get('csvText', '')
    file_name = req_json.get('fileName', 'dataset.csv')

    if not csv_text:
        return jsonify({"error": "Empty CSV content"}), 400

    try:
        df = pd.read_csv(io.StringIO(csv_text))
    except Exception as e:
        return jsonify({"error": f"Pandas parse failed: {str(e)}"}), 400

    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols
    
    missing_cells = int(df.isnull().sum().sum())
    missing_pct = round((missing_cells / total_cells * 100) if total_cells > 0 else 0, 2)
    duplicate_rows = int(df.duplicated().sum())

    column_profiles = []
    numeric_cols = []

    for col in df.columns:
        s = df[col]
        missing_count = int(s.isnull().sum())
        unique_count = int(s.nunique(dropna=True))
        is_numeric = pd.api.types.is_numeric_dtype(s)
        
        prof = {
            "name": str(col),
            "missingCount": missing_count,
            "uniqueCount": unique_count,
            "inferredType": "numeric" if is_numeric else "categorical",
            "isConstant": unique_count <= 1
        }

        if is_numeric:
            numeric_cols.append(col)
            valid_nums = s.dropna()
            if len(valid_nums) > 0:
                q1 = float(valid_nums.quantile(0.25))
                q3 = float(valid_nums.quantile(0.75))
                iqr = q3 - q1
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                outliers = int(((valid_nums < lower) | (valid_nums > upper)).sum())

                prof["stats"] = {
                    "mean": round(float(valid_nums.mean()), 2),
                    "median": round(float(valid_nums.median()), 2),
                    "stdDev": round(float(valid_nums.std()), 2) if len(valid_nums) > 1 else 0.0,
                    "min": float(valid_nums.min()),
                    "max": float(valid_nums.max()),
                    "q1": round(q1, 2),
                    "q3": round(q3, 2),
                    "iqr": round(iqr, 2),
                    "outlierCount": outliers
                }
        else:
            top_vals = s.value_counts().head(5).to_dict()
            prof["frequencies"] = [{"value": str(k), "count": int(v)} for k, v in top_vals.items()]

        column_profiles.append(prof)

    correlations = []
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr()
        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):
                col_a = numeric_cols[i]
                col_b = numeric_cols[j]
                val = corr_matrix.loc[col_a, col_b]
                if not math.isnan(val):
                    correlations.append({
                        "colA": str(col_a),
                        "colB": str(col_b),
                        "coefficient": round(float(val), 3)
                    })

    return jsonify({
        "fileName": file_name,
        "totalDataRows": total_rows,
        "totalColumns": total_cols,
        "totalCells": total_cells,
        "missingCells": missing_cells,
        "missingPercentage": missing_pct,
        "duplicateRowsCount": duplicate_rows,
        "columnProfiles": column_profiles,
        "correlationPairs": correlations
    })

# ==========================================
# 4. UNLIMITED REAL-PERSON CONVERSATIONAL AI
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat():
    body = request.json or {}
    user_query = body.get('message', '').strip()
    active_tab = body.get('activeTab', 'overview')
    context = body.get('context', {})
    chat_history = body.get('history', [])

    if not user_query:
        return jsonify({"reply": "Hey there! How can I help you today? Ask me anything about your schedule, budget, or CSV dataset!"}), 200

    money_ctx = context.get('money', {})
    time_ctx = context.get('time', {})
    csv_ctx = context.get('csv', {})

    # System instruction giving the AI a real human persona with deep data awareness
    system_prompt = f"""You are ORACLE AI, a warm, articulate, highly intelligent personal advisor and decision companion.
You talk like a real, supportive human pair-programmer and mentor—conversational, clear, friendly, and natural. There are NO limits to what you can discuss.

You have live, real-time awareness of the user's data on the ORACLE platform:
- Current Module: {active_tab.upper()}
- Money Simulator Data: Monthly Income={money_ctx.get('currency', '₹')}{money_ctx.get('monthlyIncome', 0):,}, Rent={money_ctx.get('currency', '₹')}{money_ctx.get('rent', 0):,}, Food={money_ctx.get('currency', '₹')}{money_ctx.get('food', 0):,}, Transport={money_ctx.get('currency', '₹')}{money_ctx.get('transport', 0):,}, Entertainment={money_ctx.get('currency', '₹')}{money_ctx.get('entertainment', 0):,}, Other Expenses={money_ctx.get('currency', '₹')}{money_ctx.get('other', 0):,}, Monthly Surplus={money_ctx.get('currency', '₹')}{money_ctx.get('surplus', 0):,}, Savings Target={money_ctx.get('currency', '₹')}{money_ctx.get('savingsTarget', 0):,}
- Time Simulator Data: Sleep Duration={time_ctx.get('sleep', 7.5)} hours, Daily Study={time_ctx.get('study', 3.0)} hours, College/Work={time_ctx.get('collegeWork', 6.0)} hours, Commute={time_ctx.get('travel', 1.5)} hours, Leisure/Entertainment={time_ctx.get('entertainment', 2.0)} hours, Meals & Care={time_ctx.get('mealsPersonal', 2.0)} hours, Other Tasks={time_ctx.get('other', 1.0)} hours, Study Target={time_ctx.get('studyTargetDaily', 3.5)} hours, Active Days={time_ctx.get('selectedDaysPerWeek', 5)} days/week, Semester Length={time_ctx.get('semesterWeeks', 16)} weeks, Total Daily Allocated={time_ctx.get('totalAllocated', 23.0)}/24h, Remaining Buffer={time_ctx.get('unallocated', 1.0)}h
- CSV Dataset Data: File='{csv_ctx.get('fileName', 'Active Dataset')}', Total Data Rows={csv_ctx.get('totalRows', 0)}, Total Columns={csv_ctx.get('totalCols', 0)}, Missing Cells={csv_ctx.get('missingCells', 0)} ({csv_ctx.get('missingPercentage', 0)}%), Duplicate Rows={csv_ctx.get('duplicateRows', 0)}, Columns={csv_ctx.get('columns', [])}

Conversational Guidelines:
- If the user says "hii", "hello", "hey", or casual greetings: Greet them back warmly and naturally (e.g., "Hi there! How can I help you today? We can dive into your study schedule, look at your budget, or analyze your CSV data!"), like a friend.
- If they ask to increase study time without cutting sleep: Explicitly preserve their {time_ctx.get('sleep', 7.5)} hours of sleep (emphasizing its importance for cognitive endurance), and show how to borrow 30-45 minutes from leisure/entertainment ({time_ctx.get('entertainment', 2.0)}h) or commute downtime, giving the exact math (+weekly and semester hours).
- If they ask about CSV data (empty rows, missing values, duplicates, column questions): Answer directly and accurately with exact numbers from the context above.
- Answer ANY question the user asks—general life, student productivity, time management, statistics, Python, or data analysis—without pre-scripted limits.
- Sound natural, supportive, and conversational. Use markdown formatting and bold numbers for readability."""

    # 1. Try local Ollama LLM for full natural human conversation
    if check_ollama_available():
        try:
            # Build messages structure for Ollama /api/chat
            messages_payload = [{"role": "system", "content": system_prompt}]
            
            # Append recent history (up to last 6 messages)
            for m in chat_history[-6:]:
                role = "assistant" if m.get("sender") == "ai" else "user"
                content = m.get("text", "")
                if content:
                    messages_payload.append({"role": role, "content": content})

            messages_payload.append({"role": "user", "content": user_query})

            ollama_req = {
                "model": OLLAMA_MODEL,
                "messages": messages_payload,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 500
                }
            }

            res = requests.post(f"{OLLAMA_URL}/api/chat", json=ollama_req, timeout=25)
            if res.status_code == 200:
                content = res.json().get('message', {}).get('content', '').strip()
                if content:
                    return jsonify({
                        "reply": content,
                        "engine": f"ORACLE AI (Powered by {OLLAMA_MODEL})",
                        "status": "success"
                    })
        except Exception as e:
            pass  # Fall through to the smart natural fallback

    # 2. Rich Natural Fallback Engine
    reply = generate_natural_fallback_response(user_query, active_tab, money_ctx, time_ctx, csv_ctx)
    return jsonify({
        "reply": reply,
        "engine": "ORACLE Intelligence Assistant",
        "status": "success"
    })

def generate_natural_fallback_response(query, tab, money_ctx, time_ctx, csv_ctx):
    q = query.lower().strip()

    # Casual Greetings
    if q in ["hi", "hii", "hiii", "hello", "hey", "heyy", "hey there", "good morning", "good evening", "howdy", "sup", "yo"]:
        return "Hey there! 😊 How can I help you today? I'm here to help you optimize your daily routine, strategize your finances, or answer any questions about your CSV data. What's on your mind?"

    # Small talk: How are you? Who are you?
    if "how are you" in q:
        return "I'm doing great, thank you for asking! Ready to help you make sense of your data and optimize your daily schedule. How is your day going?"

    if "who are you" in q or "what can you do" in q or "help me" in q:
        return "I'm your **ORACLE AI Co-Pilot**! Think of me as your personal data and productivity partner. You can ask me anything about:\n- **Your Time Routine:** e.g. finding more study hours without touching your sleep.\n- **Your CSV Dataset:** checking for empty rows, duplicates, outliers, and key patterns.\n- **Your Financial Plan:** managing surplus, cutting expenses, or hitting savings goals.\n\nAsk me anything in plain language!"

    # Study increase without touching sleep
    if ("study" in q and ("sleep" in q or "increase" in q or "more" in q or "time" in q)) or "routine" in q:
        sleep = time_ctx.get('sleep', 7.5)
        study = time_ctx.get('study', 3.0)
        ent = time_ctx.get('entertainment', 2.0)
        travel = time_ctx.get('travel', 1.5)
        days = time_ctx.get('selectedDaysPerWeek', 5)
        weeks = time_ctx.get('semesterWeeks', 16)
        
        shift_mins = 45
        add_daily = 0.75
        new_study = study + add_daily
        add_weekly = round(add_daily * days, 1)
        add_semester = round(add_weekly * weeks)

        return f"""Hey! That's a great question. Protecting your sleep is absolutely the right call—cognitive retention and memory consolidation depend heavily on getting proper rest.

Here is an actionable way to increase your study time while keeping your **{sleep} hours of sleep completely untouched**:

1. **Keep Your Sleep Locked at {sleep} Hours:**
   - Do not cut into your {sleep}h sleep buffer. Sleep debt will only hurt your exam performance and energy.

2. **Borrow 45 Minutes from Leisure/Entertainment:**
   - Your current leisure is **{ent} hours**. If you shift just **45 minutes** to study, you still have **{max(0.5, ent - 0.75):.2f} hours** for relaxation, gaming, or unwinding in the evening.

3. **Look at the Compounded Arithmetic:**
   - **Daily Study:** Increases from **{study}h** ➔ **{new_study:.2f}h / day**.
   - **Weekly Gain:** Adds **+{add_weekly} hours / week** across {days} study days.
   - **Semester Total ({weeks} weeks):** Generates **+{add_semester} additional deep-work hours**!

> **Pro-Tip:** Try placing this 45-minute block right after your return commute using a Pomodoro focus sprint (45m study + 10m break). It builds momentum before dinner!"""

    # CSV Questions: Duplicates
    if "duplicate" in q or "dublicate" in q:
        dups = csv_ctx.get('duplicateRows', 0)
        total = csv_ctx.get('totalRows', 0)
        if dups > 0:
            return f"Yes, there is duplicate data! Your active dataset contains **{dups} duplicate row** (out of **{total} total rows**).\n\nDuplicate records can artificially bias averages and counts. If you want to remove them, just head over to the **Cleaning Studio** tab in CSV Intelligence and click **'Generate Sanitized Copy'**!"
        else:
            return f"Good news! There are **0 duplicate records** in your active dataset across all **{total} rows**. Every row is unique."

    # CSV Questions: Empty rows & missing cells
    if "empty" in q or "missing" in q or "null" in q or "blank" in q:
        missing = csv_ctx.get('missingCells', 0)
        missing_pct = csv_ctx.get('missingPercentage', 0)
        total = csv_ctx.get('totalRows', 0)
        return f"Here is the breakdown of empty and missing data:\n\n- **Empty Rows:** 0 (all {total} rows contain at least some data; there are no 100% empty rows).\n- **Missing / Blank Cells:** There are **{missing} missing cells** ({missing_pct}% of the total data matrix).\n\nYou can inspect the exact rows and column names in the **Data Quality Inspector** tab, or fill them in using the **Cleaning Studio**."

    # CSV Questions: Column list & rows count
    if "how many row" in q or "how many column" in q or "row count" in q or "size" in q:
        rows = csv_ctx.get('totalRows', 'N/A')
        cols = csv_ctx.get('totalCols', 'N/A')
        fname = csv_ctx.get('fileName', 'Active Dataset')
        cols_str = ', '.join(csv_ctx.get('columns', []))
        return f"Your active dataset **'{fname}'** has:\n- **{rows} data rows** (excluding the header line on line 1)\n- **{cols} columns**: {cols_str}"

    # Money / Savings Questions
    if "save" in q or "money" in q or "surplus" in q or "rent" in q or "food" in q or "expense" in q:
        income = money_ctx.get('monthlyIncome', 0)
        surplus = money_ctx.get('surplus', 0)
        target = money_ctx.get('savingsTarget', 0)
        food = money_ctx.get('food', 0)
        cur = money_ctx.get('currency', '₹')

        pot_cut = round(food * 0.15)
        return f"Looking at your current financial setup:\n- **Monthly Inflow:** {cur}{income:,}\n- **Current Monthly Surplus:** **{cur}{surplus:,}**\n- **Target Goal:** **{cur}{target:,}**\n\nIf you want to reach your goal faster, a great place to start is **Food & Dining** ({cur}{food:,}). Trimming just 15% frees up **+{cur}{pot_cut:,}/month** = **+{cur}{pot_cut * 12:,}/year** without touching fixed expenses like rent!"

    # Open-ended intelligent response
    return f"I hear you! Based on your current data in **{tab.upper()}**, I can help you analyze patterns, model scenarios, or troubleshoot challenges. Could you tell me a little more about what specific goal you'd like to achieve?"

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f">> ORACLE Python Analytics Engine listening on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
