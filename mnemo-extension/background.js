// ==============================================================================
// MNEMO CHROME EXTENSION - BACKGROUND SERVICE WORKER
// ==============================================================================

// Helper: Retrieve user-configured credentials securely from chrome.storage.local
async function getStoredCredentials() {
  const data = await chrome.storage.local.get(["SUPABASE_URL", "SUPABASE_ANON_KEY", "GEMINI_API_KEY"]);
  return {
    supabaseUrl: (data.SUPABASE_URL || "").trim().replace(/\/+$/, ''),
    supabaseAnonKey: (data.SUPABASE_ANON_KEY || "").trim(),
    geminiApiKey: (data.GEMINI_API_KEY || "").trim()
  };
}

// 1. Create Context Menu on Extension Installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "remember-with-mnemo",
    title: "🧠 Remember with Mnemo",
    contexts: ["selection"]
  });
  console.log("Mnemo Extension initialized successfully.");
});

// 2. Handle Selection Right-Click Action
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "remember-with-mnemo") {
    const selectedText = info.selectionText;
    const pageUrl = tab?.url || "";

    if (!selectedText || !selectedText.trim()) return;

    // Retrieve credentials from secure extension storage
    const creds = await getStoredCredentials();
    if (!creds.supabaseUrl || !creds.supabaseAnonKey) {
      showNotification(
        "Mnemo: Configuration Required",
        "Please click the Mnemo extension icon to configure your Supabase credentials (⚙️)."
      );
      return;
    }

    // Show initial status notification
    showNotification("Mnemo AI Processing...", "Analyzing selection and detecting deadlines...");

    try {
      // Step A: Process selection with Gemini AI (or trigger fallback if AI is unconfigured or rate-limited)
      const aiResult = await processWithGemini(selectedText, creds.geminiApiKey);

      // Step B: Insert Memory into Supabase `memories` table
      const todayDate = new Date().toISOString().split("T")[0];
      const memoryRecord = await saveMemoryToSupabase({
        title: aiResult.title,
        summary: aiResult.summary,
        category: aiResult.category || "General",
        tags: aiResult.tags || ["WebClip"],
        is_priority: aiResult.isPriority || false,
        source_url: pageUrl,
        date: todayDate,
        time_ago: "Just now"
      }, creds.supabaseUrl, creds.supabaseAnonKey);

      let reminderMessage = "";

      // Step C: If AI detected a date/deadline, insert into `reminders` table
      if (aiResult.reminder && aiResult.reminder.hasReminder && memoryRecord?.id) {
        await saveReminderToSupabase({
          memory_id: memoryRecord.id,
          title: aiResult.reminder.reminderTitle || aiResult.title,
          due_date: aiResult.reminder.dueDate,
          due_time: aiResult.reminder.dueTime || "10:00 AM",
          is_urgent: aiResult.reminder.isUrgent || false
        }, creds.supabaseUrl, creds.supabaseAnonKey);
        reminderMessage = ` ⏰ Reminder added for ${aiResult.reminder.dueDate}!`;
      }

      // Step D: Show success notification
      const successTitle = aiResult.isFallback ? "Memory Saved (Raw) 🧠" : "Memory Saved! 🧠";
      showNotification(
        successTitle,
        `"${aiResult.title}" saved to database.${reminderMessage}`
      );

    } catch (error) {
      console.error("Mnemo Error:", error);
      showNotification("Failed to Save", "Could not connect to database. Check developer background log.");
    }
  }
});

// Helper: Call Google Gemini API with automatic fallback for rate-limits (429) or unconfigured key
async function processWithGemini(rawText, geminiApiKey) {
  if (!geminiApiKey) {
    console.info("Gemini API Key not set. Using local text extraction fallback.");
    return generateFallbackResult(rawText);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
  const todayDate = new Date().toISOString().split("T")[0];

  const prompt = `
    You are Mnemo AI, an intelligent second-brain knowledge assistant.
    Analyze the text captured from a web page and respond ONLY with a JSON object following this exact schema:

    Today's reference date is: ${todayDate}. Interpret relative dates (like "tomorrow", "next Monday", "by August 5th") relative to today's reference date.

    JSON Schema:
    {
      "title": "Clean, concise 5 to 8 word title capturing core point",
      "summary": "Clear 2-sentence executive summary of text",
      "category": "Engineering | AI Research | Work | Personal | General",
      "tags": ["tag1", "tag2"],
      "isPriority": false,
      "reminder": {
        "hasReminder": true/false (Set true ONLY IF the text contains a deadline, date, time, meeting, or actionable task),
        "reminderTitle": "Actionable title for the reminder task",
        "dueDate": "YYYY-MM-DD",
        "dueTime": "HH:MM AM/PM",
        "isUrgent": false
      }
    }

    Text to Analyze:
    "${rawText}"
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`Gemini API Error (${response.status}): ${errorBody}`);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.candidates[0].content.parts[0].text;
    return JSON.parse(rawContent);

  } catch (err) {
    return generateFallbackResult(rawText);
  }
}

function generateFallbackResult(rawText) {
  const cleanFirstLine = rawText.trim().split("\n")[0].substring(0, 45);
  const fallbackTitle = cleanFirstLine.length < rawText.trim().length ? `${cleanFirstLine}...` : cleanFirstLine;
  const fallbackSummary = rawText.length > 180 ? `${rawText.substring(0, 177)}...` : rawText;

  return {
    title: fallbackTitle || "Web Clip",
    summary: fallbackSummary,
    category: "General",
    tags: ["WebClip", "RawText"],
    isPriority: false,
    isFallback: true,
    reminder: {
      hasReminder: false
    }
  };
}

// Helper: Insert record into Supabase `memories` table
async function saveMemoryToSupabase(memoryData, supabaseUrl, supabaseAnonKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/memories`, {
    method: "POST",
    headers: {
      "apikey": supabaseAnonKey,
      "Authorization": `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(memoryData)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase Memory Error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result[0];
}

// Helper: Insert record into Supabase `reminders` table
async function saveReminderToSupabase(reminderData, supabaseUrl, supabaseAnonKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/reminders`, {
    method: "POST",
    headers: {
      "apikey": supabaseAnonKey,
      "Authorization": `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(reminderData)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase Reminder Error (${response.status}): ${errText}`);
  }
}

// Helper: Chrome Desktop Notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    title: title,
    message: message
  });
}