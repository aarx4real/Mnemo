let currentTabUrl = '';

// DOM Elements
const memorySection = document.getElementById('memorySection');
const settingsSection = document.getElementById('settingsSection');
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
const backBtn = document.getElementById('backBtn');

const settingSupabaseUrl = document.getElementById('settingSupabaseUrl');
const settingSupabaseKey = document.getElementById('settingSupabaseKey');
const settingGeminiKey = document.getElementById('settingGeminiKey');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const settingsStatus = document.getElementById('settingsStatus');

const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('status');

// 1. Switch Views
function showSettings() {
  memorySection.classList.add('hidden');
  settingsSection.classList.remove('hidden');
  loadSettings();
}

function showMemory() {
  settingsSection.classList.add('hidden');
  memorySection.classList.remove('hidden');
  settingsStatus.textContent = '';
}

toggleSettingsBtn.addEventListener('click', () => {
  if (settingsSection.classList.contains('hidden')) {
    showSettings();
  } else {
    showMemory();
  }
});

backBtn.addEventListener('click', showMemory);

// 2. Load & Save Settings
async function loadSettings() {
  const data = await chrome.storage.local.get(['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GEMINI_API_KEY']);
  settingSupabaseUrl.value = data.SUPABASE_URL || '';
  settingSupabaseKey.value = data.SUPABASE_ANON_KEY || '';
  settingGeminiKey.value = data.GEMINI_API_KEY || '';
}

saveSettingsBtn.addEventListener('click', async () => {
  const url = settingSupabaseUrl.value.trim().replace(/\/+$/, '');
  const anonKey = settingSupabaseKey.value.trim();
  const geminiKey = settingGeminiKey.value.trim();

  await chrome.storage.local.set({
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: anonKey,
    GEMINI_API_KEY: geminiKey
  });

  settingsStatus.textContent = 'Settings saved successfully!';
  settingsStatus.className = 'success';
  setTimeout(() => {
    showMemory();
  }, 1000);
});

// 3. Fetch Active Tab Info when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    document.getElementById('title').value = tab.title || '';
    currentTabUrl = tab.url || '';
  }

  // Preload settings in memory
  await loadSettings();
});

// 4. Handle Save Button Click
saveBtn.addEventListener('click', async () => {
  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const summary = document.getElementById('summary').value.trim();
  const rawTags = document.getElementById('tags').value;
  const isPriority = document.getElementById('isPriority').checked;

  if (!title) {
    statusEl.textContent = 'Please enter a title.';
    statusEl.className = 'error';
    return;
  }

  // Check Supabase credentials from storage
  const creds = await chrome.storage.local.get(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
  const supabaseUrl = creds.SUPABASE_URL;
  const supabaseAnonKey = creds.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    statusEl.textContent = 'Please configure Supabase in settings (⚙️) first.';
    statusEl.className = 'error';
    showSettings();
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  statusEl.textContent = '';

  // Process tags into Postgres array format
  const tagsArray = rawTags.split(',').map(t => t.trim()).filter(Boolean);

  const payload = {
    title: title,
    summary: summary || `Saved from ${currentTabUrl}`,
    category: category,
    tags: tagsArray,
    is_priority: isPriority,
    source_url: currentTabUrl,
    date: new Date().toISOString().split('T')[0],
    time_ago: 'Just now'
  };

  try {
    // Post directly to Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/memories`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server responded with ${response.status}`);
    }

    statusEl.textContent = '✨ Saved to Vault!';
    statusEl.className = 'success';
    
    setTimeout(() => window.close(), 1200);

  } catch (err) {
    console.error('Supabase save error:', err);
    statusEl.textContent = err.message || 'Failed to save memory.';
    statusEl.className = 'error';
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Memory';
  }
});