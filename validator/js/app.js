/**
 * JD Validator - Main Application
 *
 * Simple validator demonstrating the paired assistant/validator pattern.
 */

import { validateDocument, getScoreColor } from './validator.js';

/**
 * Initialize the application
 */
function init() {
  setupDarkMode();
  setupEventListeners();
}

/**
 * Setup dark mode toggle
 */
function setupDarkMode() {
  const darkModeBtn = document.getElementById('btn-dark-mode');

  // Check for saved preference or system preference
  if (localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }

  darkModeBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const validateBtn = document.getElementById('btn-validate');
  const clearBtn = document.getElementById('btn-clear');
  const documentInput = document.getElementById('document-input');

  validateBtn?.addEventListener('click', handleValidate);
  clearBtn?.addEventListener('click', handleClear);

  // Allow Ctrl+Enter to validate
  documentInput?.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleValidate();
    }
  });
}

/**
 * Handle validate button click
 */
function handleValidate() {
  const documentInput = document.getElementById('document-input');
  const resultsDiv = document.getElementById('results');
  const resultsContent = document.getElementById('results-content');

  const text = documentInput?.value?.trim();

  if (!text) {
    showResults('Please enter a document to validate.', 'error');
    return;
  }

  const result = validateDocument(text);

  const scoreColor = getScoreColor(result.score);

  const html = `
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <span class="text-2xl font-bold ${scoreColor}">${result.score}/100</span>
        <span class="text-slate-400">${result.grade}</span>
      </div>
      <div class="space-y-2">
        ${result.feedback.map(f => `<p class="text-sm">• ${f}</p>`).join('')}
      </div>
    </div>
  `;

  showResults(html);
}

/**
 * Handle clear button click
 */
function handleClear() {
  const documentInput = document.getElementById('document-input');
  const resultsDiv = document.getElementById('results');

  if (documentInput) documentInput.value = '';
  if (resultsDiv) resultsDiv.classList.add('hidden');
}

/**
 * Show results in the results div
 */
function showResults(html, type = 'success') {
  const resultsDiv = document.getElementById('results');
  const resultsContent = document.getElementById('results-content');

  if (resultsContent) {
    resultsContent.innerHTML = html;
  }
  if (resultsDiv) {
    resultsDiv.classList.remove('hidden');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { init, handleValidate, handleClear, showResults };
