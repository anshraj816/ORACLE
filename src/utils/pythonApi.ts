import { MoneyInputs, MoneyWhatIfState } from '../types/money';
import { TimeInputs, WhatIfTimeState } from '../types/time';

const PYTHON_BACKEND_URL = 'http://localhost:5000';

export interface PythonHealthStatus {
  isAvailable: boolean;
  engine?: string;
  pythonVersion?: string;
  pandasVersion?: string;
  ollamaAvailable?: boolean;
}

export async function checkPythonBackendHealth(): Promise<PythonHealthStatus> {
  try {
    const res = await fetch(`${PYTHON_BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        isAvailable: true,
        engine: data.engine,
        pythonVersion: data.python_version,
        pandasVersion: data.pandas_version,
        ollamaAvailable: data.ollama_available,
      };
    }
  } catch (e) {
    // Backend offline
  }
  return { isAvailable: false };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  engine?: string;
  timestamp: string;
}

export async function askQuantrixAi(
  userQuery: string,
  activeTab: string,
  contextData: any,
  chatHistory: ChatMessage[] = []
): Promise<{ reply: string; engine: string }> {
  try {
    const res = await fetch(`${PYTHON_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        activeTab,
        context: contextData,
        history: chatHistory.map((m) => ({ sender: m.sender, text: m.text })),
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        reply: data.reply,
        engine: data.engine || 'Python AI Advisor',
      };
    }
  } catch (err) {
    // If Python server is unreachable, use built-in natural conversational client intelligence
  }

  return {
    reply: generateClientSideAiReply(userQuery, activeTab, contextData),
    engine: 'QUANTRIX Built-in Free Intelligence',
  };
}

function generateClientSideAiReply(query: string, tab: string, ctx: any): string {
  const q = query.toLowerCase().trim();
  const time = ctx?.time || {};
  const csv = ctx?.csv || {};
  const money = ctx?.money || {};

  // Casual greetings
  if (['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'hey there', 'good morning', 'good evening', 'howdy', 'sup', 'yo'].includes(q)) {
    return "Hey there! 😊 How can I help you today? Whether you want to talk about your study routine, brainstorm ideas for your schedule, optimize your budget, or dig into your CSV data, I'm right here with you!";
  }

  if (q.includes('how are you')) {
    return "I'm doing wonderful, thank you for asking! Ready to help you make smart decisions with your data. How are things going with you?";
  }

  if (q.includes('who are you') || q.includes('what can you do')) {
    return "I'm your **QUANTRIX AI Co-Pilot**! You can chat with me about anything on this platform without limits: ask for schedule advice (like boosting study time without sacrificing sleep), query your CSV files (for empty rows, duplicates, correlations), or plan your monthly budget. What would you like to explore?";
  }

  if ((q.includes('study') && (q.includes('sleep') || q.includes('increase') || q.includes('more'))) || q.includes('routine')) {
    const sleep = time.sleep || 7.5;
    const study = time.study || 3.0;
    const ent = time.entertainment || 2.0;
    const days = time.selectedDaysPerWeek || 5;
    const weeks = time.semesterWeeks || 16;
    const addStudy = 0.75; // 45m
    const newStudy = study + addStudy;
    const addWk = (addStudy * days).toFixed(1);
    const addSem = Math.round(Number(addWk) * weeks);

    return `Hey! Protecting your sleep is 100% the right decision—cognitive retention and memory consolidation decline fast under sleep debt.

Here is an actionable strategy to **increase study time while keeping your ${sleep}h sleep untouched**:

1. **Keep Your Sleep Locked at ${sleep} Hours:**
   - Preserve your ${sleep}h sleep window completely.

2. **Reallocate 45 Minutes from Leisure/Entertainment:**
   - Your current entertainment is **${ent} hours**. Shifting just **45 minutes** to deep work still leaves you with **${Math.max(0.5, ent - 0.75).toFixed(2)}h** of pure evening relaxation.

3. **Compounded Impact:**
   - **Daily Study:** Increases from **${study}h** ➔ **${newStudy.toFixed(2)}h / day**.
   - **Weekly Deep Work:** Adds **+${addWk} hours/week** across ${days} days.
   - **Semester Total (${weeks} wks):** Produces **+${addSem} extra study hours**!

> **Actionable Tip:** Schedule this 45-minute block right after college or work using a Pomodoro sprint (45m study + 10m rest). It builds momentum before your evening wind-down!`;
  }

  if (q.includes('duplicate') || q.includes('dublicate')) {
    if (!csv || !csv.fileName) {
      return "No CSV file is currently loaded. Please upload your CSV file in the **CSV Intelligence** tab, and I'll immediately analyze all duplicates for you!";
    }
    const dups = csv.duplicateRows ?? 0;
    const total = csv.totalRows ?? 0;
    const fname = csv.fileName;
    return dups > 0
      ? `Yes! In your uploaded file **'${fname}'**, there are **${dups} duplicate row${dups > 1 ? 's' : ''}** out of **${total} total records**.\n\n- **Impact:** Duplicate entries artificially weight sums, averages, and statistics.\n- **Action:** Go to the **Cleaning Studio** tab and click **'Generate Sanitized Copy'** to remove them automatically!`
      : `Good news! In your uploaded file **'${fname}'**, there are **0 duplicate rows** across all **${total} records**. Every single row is unique!`;
  }

  if (q.includes('empty') || q.includes('missing') || q.includes('null') || q.includes('blank')) {
    if (!csv || !csv.fileName) {
      return "No CSV file is currently loaded. Please upload your CSV dataset in the **CSV Intelligence** tab, and I will check all empty rows and missing cells for you!";
    }
    const missing = csv.missingCells ?? 0;
    const pct = csv.missingPercentage ?? 0;
    const total = csv.totalRows ?? 0;
    const emptyRows = csv.emptyRows ?? 0;
    const fname = csv.fileName;
    return `Here is the data quality breakdown for **'${fname}'**:\n\n- **Entirely Empty Rows:** **${emptyRows}** ${emptyRows > 0 ? `(row${emptyRows > 1 ? 's' : ''} with no content at all)` : `(all ${total} rows have valid entries; no 100% empty rows)`}.\n- **Missing / Blank Cells:** **${missing} cells** (${pct}% of the total data matrix).\n\nYou can inspect the exact missing values in the **Data Quality Inspector** tab, or clean/impute them in the **Cleaning Studio**!`;
  }

  if (q.includes('how many row') || q.includes('how many column') || q.includes('row count') || q.includes('column count') || q.includes('size') || q.includes('shape') || q.includes('header')) {
    if (!csv || !csv.fileName) {
      return "No CSV file is currently loaded. Once you upload your dataset in the **CSV Intelligence** tab, I can report its exact row and column breakdown!";
    }
    const rows = csv.totalRows ?? 'N/A';
    const cols = csv.totalCols ?? 'N/A';
    const fname = csv.fileName;
    const colsStr = (csv.columns || []).join(', ');
    return `Your uploaded dataset **'${fname}'** contains:\n- **${rows} data rows** (excluding line 1 header)\n- **${cols} columns**: \`${colsStr}\``;
  }

  if (q.includes('save') || q.includes('money') || q.includes('food') || q.includes('rent') || q.includes('expense')) {
    const surplus = money.surplus || 0;
    const target = money.savingsTarget || 0;
    const food = money.food || 0;
    const cur = money.currency || '₹';
    const pot = Math.round(food * 0.15);
    return `Looking at your financial setup:\n- **Monthly Surplus:** **${cur}${surplus.toLocaleString()}**\n- **Savings Target:** **${cur}${target.toLocaleString()}**\n\nCutting **Food & Dining** by 15% frees up **+${cur}${pot.toLocaleString()}/mo** (+${cur}${(pot * 12).toLocaleString()}/year) without affecting fixed obligations like rent!`;
  }

  return `I'm listening! Based on your current data in **${tab.toUpperCase()}**, I can help you model different scenarios, analyze patterns, or troubleshoot challenges. What specific idea or question would you like to explore?`;
}

