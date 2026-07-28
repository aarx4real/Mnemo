// 1. SET YOUR SUPABASE CREDENTIALS HERE
const SUPABASE_URL = https://YOUR_PROJECT_ID.supabase.co;
const SUPABASE_ANON_KEY = YOUR_SUPABASE_ANON_KEY;

let currentTabUrl = '';

// 2. Fetch Active Tab Info when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    document.getElementById('title').value = tab.title || '';
    currentTabUrl = tab.url || '';
  }
});

// 3. Handle Save Button Click
document.getElementById('saveBtn').addEventListener('click', async () => {
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');

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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/memories`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to save memory.');
    }

    statusEl.textContent = '✨ Saved to Vault!';
    statusEl.className = 'success';
    
    setTimeout(() => window.close(), 1200);

  } catch (err) {
    console.error('Supabase save error:', err);
    statusEl.textContent = err.message;
    statusEl.className = 'error';
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Memory';
  }
});