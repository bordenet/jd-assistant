// ============================================================
// JD Validator - Main Application
// ============================================================

import { validateDocument } from './validator.js';
import { showToast, copyToClipboard, debounce, getScoreColor, showPromptModal, createStorage } from './core/index.js';
import { generateCritiquePrompt, generateRewritePrompt, generateLLMScoringPrompt } from './prompts.js';

// ============================================================
// State
// ============================================================

let currentResult = null;
let _lastSavedContent = ''; // eslint-disable-line no-unused-vars -- reserved for future dirty-state tracking
let currentPrompt = null;
let isLLMMode = false;

// Initialize storage with factory
const storage = createStorage('jd-validator-history');

// ============================================================
// DOM Elements
// ============================================================

const editor = document.getElementById('editor');
const scoreTotal = document.getElementById('score-total');
const scoreInclusive = document.getElementById('score-inclusive');
const scoreStructure = document.getElementById('score-structure');
const scoreTransparency = document.getElementById('score-transparency');
const scoreExperience = document.getElementById('score-experience');
const aiPowerups = document.getElementById('ai-powerups');
const btnCritique = document.getElementById('btn-critique');
const btnRewrite = document.getElementById('btn-rewrite');
const btnSave = document.getElementById('btn-save');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const versionInfo = document.getElementById('version-info');
const lastSaved = document.getElementById('last-saved');
const storageInfoEl = document.getElementById('storage-info');
const toastContainer = document.getElementById('toast-container');
const btnDarkMode = document.getElementById('btn-dark-mode');
const btnAbout = document.getElementById('btn-about');
const btnOpenClaude = document.getElementById('btn-open-claude');
const btnViewPrompt = document.getElementById('btn-view-prompt');
const btnToggleMode = document.getElementById('btn-toggle-mode');
const quickScorePanel = document.getElementById('quick-score-panel');
const llmScorePanel = document.getElementById('llm-score-panel');
const modeLabelQuick = document.getElementById('mode-label-quick');
const modeLabelLLM = document.getElementById('mode-label-llm');
const btnCopyLLMPrompt = document.getElementById('btn-copy-llm-prompt');
const btnViewLLMPrompt = document.getElementById('btn-view-llm-prompt');
const btnOpenClaudeLLM = document.getElementById('btn-open-claude-llm');

// ============================================================
// Score Calculation Helpers
// ============================================================

/**
 * Calculate dimension scores from the validator result
 * Uses the SAME deductions as validator.js so categories sum to total
 */
function calculateDimensionScores(result) {
  // Max points per dimension (must sum to 100)
  const maxInclusive = 30;
  const maxStructure = 25;
  const maxTransparency = 25;
  const maxExperience = 20;

  // Start with max and deduct based on issues
  // IMPORTANT: Use the SAME deduction logic as validator.js
  let inclusive = maxInclusive;
  let structure = maxStructure;
  let transparency = maxTransparency;
  let experience = maxExperience;

  // Get warning counts
  const masculineCount = result.warnings.filter(w => w.type === 'masculine-coded').length;
  const extrovertCount = result.warnings.filter(w => w.type === 'extrovert-bias').length;
  const redFlagCount = result.warnings.filter(w => w.type === 'red-flag').length;

  // Deduct from Inclusive Language (matches validator.js lines 48-68)
  // Masculine: -5 each, max -25 (but capped at maxInclusive)
  // Extrovert: -5 each, max -20
  // Red flags: -5 each, max -25
  const masculinePenalty = Math.min(25, masculineCount * 5);
  const extrovertPenalty = Math.min(20, extrovertCount * 5);
  const redFlagPenalty = Math.min(25, redFlagCount * 5);
  inclusive -= Math.min(inclusive, masculinePenalty + extrovertPenalty);
  inclusive = Math.max(0, inclusive);

  // Deduct from Structure & Clarity based on word count (matches validator.js lines 32-46)
  if (result.wordCount < 400) {
    structure -= Math.min(15, Math.floor((400 - result.wordCount) / 20));
  } else if (result.wordCount > 700) {
    structure -= Math.min(10, Math.floor((result.wordCount - 700) / 50));
  }
  structure = Math.max(0, structure);

  // Deduct from Transparency (matches validator.js lines 81-106)
  // Compensation: -10 if missing
  // Encouragement: -5 if missing
  // Red flags: -5 each, max -25 (remaining after inclusive)
  const hasComp = result.feedback.some(f => f.includes('Compensation range'));
  const hasEncouragement = result.feedback.some(f => f.includes('encouragement'));
  if (!hasComp && !result.isInternal) transparency -= 10;
  if (!hasEncouragement) transparency -= 5;
  transparency -= Math.min(transparency, redFlagPenalty);
  transparency = Math.max(0, transparency);

  // Deduct from Candidate Experience (slop detection)
  // Slop: max -5 (matches validator.js lines 108-124)
  const slopDeduction = result.slopDetection?.deduction || 0;
  experience -= slopDeduction;
  experience = Math.max(0, experience);

  // Calculate total from categories (should match result.score)
  const calculatedTotal = inclusive + structure + transparency + experience;

  // If there's a mismatch, adjust experience to make it match
  // This handles edge cases where deductions overlap
  if (calculatedTotal !== result.score) {
    const diff = calculatedTotal - result.score;
    experience = Math.max(0, experience - diff);
  }

  return {
    inclusive: { score: inclusive, maxScore: maxInclusive },
    structure: { score: structure, maxScore: maxStructure },
    transparency: { score: transparency, maxScore: maxTransparency },
    experience: { score: experience, maxScore: maxExperience },
    total: result.score
  };
}

// ============================================================
// Score Display
// ============================================================

function updateScoreDisplay(result) {
  if (!result) return;

  const scores = calculateDimensionScores(result);

  // Update total score with color
  scoreTotal.textContent = result.score;
  scoreTotal.className = `text-4xl font-bold ${getScoreColor(result.score, 100)}`;

  // Update dimension scores
  scoreInclusive.textContent = scores.inclusive.score;
  scoreStructure.textContent = scores.structure.score;
  scoreTransparency.textContent = scores.transparency.score;
  scoreExperience.textContent = scores.experience.score;

  // Apply colors to dimension scores
  scoreInclusive.className = getScoreColor(scores.inclusive.score, scores.inclusive.maxScore);
  scoreStructure.className = getScoreColor(scores.structure.score, scores.structure.maxScore);
  scoreTransparency.className = getScoreColor(scores.transparency.score, scores.transparency.maxScore);
  scoreExperience.className = getScoreColor(scores.experience.score, scores.experience.maxScore);

  // Update progress bars
  const totalPercent = (result.score / 100) * 100;
  const inclusivePercent = (scores.inclusive.score / scores.inclusive.maxScore) * 100;
  const structurePercent = (scores.structure.score / scores.structure.maxScore) * 100;
  const transparencyPercent = (scores.transparency.score / scores.transparency.maxScore) * 100;
  const experiencePercent = (scores.experience.score / scores.experience.maxScore) * 100;

  const scoreBar = document.getElementById('score-bar');
  const inclusiveBar = document.getElementById('score-inclusive-bar');
  const structureBar = document.getElementById('score-structure-bar');
  const transparencyBar = document.getElementById('score-transparency-bar');
  const experienceBar = document.getElementById('score-experience-bar');

  if (scoreBar) scoreBar.style.width = `${totalPercent}%`;
  if (inclusiveBar) inclusiveBar.style.width = `${inclusivePercent}%`;
  if (structureBar) structureBar.style.width = `${structurePercent}%`;
  if (transparencyBar) transparencyBar.style.width = `${transparencyPercent}%`;
  if (experienceBar) experienceBar.style.width = `${experiencePercent}%`;
}


// ============================================================
// Validation
// ============================================================

function runValidation() {
  const content = editor.value || '';
  currentResult = validateDocument(content);
  updateScoreDisplay(currentResult);

  // Show/hide AI power-ups based on content length
  if (content.length > 200) {
    aiPowerups.classList.remove('hidden');
  } else {
    aiPowerups.classList.add('hidden');
  }
}

const debouncedValidation = debounce(runValidation, 300);

// ============================================================
// Version Control
// ============================================================

function updateVersionDisplay() {
  const version = storage.getCurrentVersion();
  if (version) {
    versionInfo.textContent = `Version ${version.versionNumber} of ${version.totalVersions}`;
    lastSaved.textContent = storage.getTimeSince(version.savedAt);
    btnBack.disabled = !version.canGoBack;
    btnForward.disabled = !version.canGoForward;
  } else {
    versionInfo.textContent = 'No saved versions';
    lastSaved.textContent = '';
    btnBack.disabled = true;
    btnForward.disabled = true;
  }
  updateStorageInfo();
}

async function updateStorageInfo() {
  const estimate = await storage.getStorageEstimate();
  if (estimate && storageInfoEl) {
    storageInfoEl.textContent = `Storage: ${storage.formatBytes(estimate.usage)} / ${storage.formatBytes(estimate.quota)} (${estimate.percentage}%)`;
  } else if (storageInfoEl) {
    storageInfoEl.textContent = 'Storage: Available';
  }
}

function handleSave() {
  const content = editor.value || '';
  if (!content.trim()) {
    showToast('Nothing to save', 'warning', toastContainer);
    return;
  }

  const result = storage.saveVersion(content);
  if (result.success) {
    _lastSavedContent = content;
    showToast(`Saved as version ${result.versionNumber}`, 'success', toastContainer);
    updateVersionDisplay();
  } else if (result.reason === 'no-change') {
    showToast('No changes to save', 'info', toastContainer);
  } else {
    showToast('Failed to save', 'error', toastContainer);
  }
}

function handleGoBack() {
  const version = storage.goBack();
  if (version) {
    editor.value = version.markdown;
    _lastSavedContent = version.markdown;
    runValidation();
    updateVersionDisplay();
    showToast(`Restored version ${version.versionNumber}`, 'info', toastContainer);
  }
}

function handleGoForward() {
  const version = storage.goForward();
  if (version) {
    editor.value = version.markdown;
    _lastSavedContent = version.markdown;
    runValidation();
    updateVersionDisplay();
    showToast(`Restored version ${version.versionNumber}`, 'info', toastContainer);
  }
}

// ============================================================
// AI Power-ups
// ============================================================

function enableClaudeButton() {
  if (btnOpenClaude) {
    btnOpenClaude.classList.remove('bg-slate-300', 'dark:bg-slate-600', 'text-slate-500', 'dark:text-slate-400', 'cursor-not-allowed', 'pointer-events-none');
    btnOpenClaude.classList.add('bg-orange-600', 'dark:bg-orange-500', 'hover:bg-orange-700', 'dark:hover:bg-orange-600', 'text-white');
    btnOpenClaude.removeAttribute('aria-disabled');
  }
}

function enableViewPromptButton() {
  if (btnViewPrompt) {
    btnViewPrompt.classList.remove('bg-slate-300', 'dark:bg-slate-600', 'text-slate-500', 'dark:text-slate-400', 'cursor-not-allowed');
    btnViewPrompt.classList.add('bg-teal-600', 'hover:bg-teal-700', 'text-white');
    btnViewPrompt.disabled = false;
    btnViewPrompt.removeAttribute('aria-disabled');
  }
}

function handleCritique() {
  const content = editor.value || '';
  if (!content || !currentResult) {
    showToast('Add some content first', 'warning', toastContainer);
    return;
  }

  const prompt = generateCritiquePrompt(content, currentResult);
  currentPrompt = { text: prompt, type: 'Critique' };

  enableClaudeButton();
  enableViewPromptButton();

  copyToClipboard(prompt).then(success => {
    if (success) {
      showToast('Critique prompt copied! Now open Claude.ai and paste.', 'success', toastContainer);
    } else {
      showToast('Prompt ready but copy failed. Use View Prompt to copy manually.', 'warning', toastContainer);
    }
  }).catch(() => {
    showToast('Prompt ready but copy failed. Use View Prompt to copy manually.', 'warning', toastContainer);
  });
}

function handleRewrite() {
  const content = editor.value || '';
  if (!content || !currentResult) {
    showToast('Add some content first', 'warning', toastContainer);
    return;
  }

  const prompt = generateRewritePrompt(content, currentResult);
  currentPrompt = { text: prompt, type: 'Rewrite' };

  enableClaudeButton();
  enableViewPromptButton();

  copyToClipboard(prompt).then(success => {
    if (success) {
      showToast('Rewrite prompt copied! Now open Claude.ai and paste.', 'success', toastContainer);
    } else {
      showToast('Prompt ready but copy failed. Use View Prompt to copy manually.', 'warning', toastContainer);
    }
  }).catch(() => {
    showToast('Prompt ready but copy failed. Use View Prompt to copy manually.', 'warning', toastContainer);
  });
}


// ============================================================
// Scoring Mode Toggle
// ============================================================

function toggleScoringMode() {
  isLLMMode = !isLLMMode;

  const toggleKnob = btnToggleMode.querySelector('span');
  if (isLLMMode) {
    btnToggleMode.classList.remove('bg-slate-500');
    btnToggleMode.classList.add('bg-indigo-600');
    toggleKnob.style.transform = 'translateX(24px)';
    btnToggleMode.setAttribute('aria-checked', 'true');
    modeLabelQuick.classList.remove('text-white');
    modeLabelQuick.classList.add('text-slate-400');
    modeLabelLLM.classList.remove('text-slate-400');
    modeLabelLLM.classList.add('text-white');
  } else {
    btnToggleMode.classList.remove('bg-indigo-600');
    btnToggleMode.classList.add('bg-slate-500');
    toggleKnob.style.transform = 'translateX(0)';
    btnToggleMode.setAttribute('aria-checked', 'false');
    modeLabelQuick.classList.remove('text-slate-400');
    modeLabelQuick.classList.add('text-white');
    modeLabelLLM.classList.remove('text-white');
    modeLabelLLM.classList.add('text-slate-400');
  }

  if (isLLMMode) {
    quickScorePanel.classList.add('hidden');
    llmScorePanel.classList.remove('hidden');
  } else {
    quickScorePanel.classList.remove('hidden');
    llmScorePanel.classList.add('hidden');
  }

  localStorage.setItem('jd-scoringMode', isLLMMode ? 'llm' : 'quick');
}

function initScoringMode() {
  const saved = localStorage.getItem('jd-scoringMode');
  if (saved === 'llm') {
    isLLMMode = false;
    toggleScoringMode();
  }
}

function enableViewLLMPromptButton() {
  if (btnViewLLMPrompt) {
    btnViewLLMPrompt.classList.remove('bg-slate-300', 'dark:bg-slate-600', 'text-slate-500', 'dark:text-slate-400', 'cursor-not-allowed');
    btnViewLLMPrompt.classList.add('bg-teal-600', 'hover:bg-teal-700', 'text-white');
    btnViewLLMPrompt.disabled = false;
    btnViewLLMPrompt.removeAttribute('aria-disabled');
  }
}

function enableClaudeLLMButton() {
  if (btnOpenClaudeLLM) {
    btnOpenClaudeLLM.classList.remove('bg-slate-300', 'dark:bg-slate-600', 'text-slate-500', 'dark:text-slate-400', 'cursor-not-allowed', 'pointer-events-none');
    btnOpenClaudeLLM.classList.add('bg-orange-600', 'hover:bg-orange-700', 'text-white');
    btnOpenClaudeLLM.removeAttribute('aria-disabled');
  }
}

function handleCopyLLMPrompt() {
  const content = editor.value || '';
  if (!content.trim()) {
    showToast('Add some content first', 'warning', toastContainer);
    return;
  }

  const prompt = generateLLMScoringPrompt(content);
  currentPrompt = { text: prompt, type: 'LLM Scoring' };

  enableViewLLMPromptButton();
  enableClaudeLLMButton();

  copyToClipboard(prompt).then(success => {
    if (success) {
      showToast('LLM scoring prompt copied! Paste into Claude.ai for detailed evaluation.', 'success', toastContainer);
    } else {
      showToast('Prompt ready but copy failed. Use View Prompt to copy manually.', 'warning', toastContainer);
    }
  }).catch(() => {
    showToast('Prompt ready but copy failed. Use View Prompt to copy manually.', 'warning', toastContainer);
  });
}

function handleViewLLMPrompt() {
  if (!currentPrompt || currentPrompt.type !== 'LLM Scoring') {
    showToast('Copy the scoring prompt first', 'warning', toastContainer);
    return;
  }

  showPromptModal(currentPrompt.text, 'LLM Scoring Prompt');
}

// ============================================================
// Dark Mode
// ============================================================

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('darkMode', isDark ? 'true' : 'false');
}

function initDarkMode() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

// ============================================================
// About Modal
// ============================================================

function showAbout() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
      <h2 class="text-xl font-bold mb-4 dark:text-white">JD Validator</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        A client-side tool for validating job descriptions for inclusive language and best practices.
      </p>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        <strong>Scoring Dimensions:</strong><br>
        • Inclusive Language (30 pts)<br>
        • Structure & Clarity (25 pts)<br>
        • Transparency (25 pts)<br>
        • Candidate Experience (20 pts)
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        100% client-side. Your content never leaves your browser.
      </p>
      <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded" onclick="this.closest('.fixed').remove()">
        Close
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// ============================================================
// Initialize
// ============================================================

function init() {
  initDarkMode();
  initScoringMode();

  const draft = storage.loadDraft();
  if (draft && draft.markdown) {
    editor.value = draft.markdown;
    _lastSavedContent = draft.markdown;
  }
  updateVersionDisplay();

  editor.addEventListener('input', () => {
    debouncedValidation();
  });

  btnCritique.addEventListener('click', handleCritique);
  btnRewrite.addEventListener('click', handleRewrite);
  btnSave.addEventListener('click', handleSave);
  btnBack.addEventListener('click', handleGoBack);
  btnForward.addEventListener('click', handleGoForward);
  btnDarkMode.addEventListener('click', toggleDarkMode);
  btnAbout.addEventListener('click', showAbout);

  if (btnToggleMode) {
    btnToggleMode.addEventListener('click', toggleScoringMode);
  }

  if (btnCopyLLMPrompt) {
    btnCopyLLMPrompt.addEventListener('click', handleCopyLLMPrompt);
  }
  if (btnViewLLMPrompt) {
    btnViewLLMPrompt.addEventListener('click', handleViewLLMPrompt);
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  });

  if (btnViewPrompt) {
    btnViewPrompt.addEventListener('click', () => {
      if (currentPrompt && currentPrompt.text) {
        showPromptModal(currentPrompt.text, `${currentPrompt.type} Prompt`);
      }
    });
  }

  setInterval(updateVersionDisplay, 60000);

  if (editor.value.trim()) {
    runValidation();
  }
}

document.addEventListener('DOMContentLoaded', init);