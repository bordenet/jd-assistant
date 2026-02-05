/**
 * Views Module
 * Handles rendering different views for JD Assistant
 * @module views
 */

import { getAllProjects, createProject, updateProject, getProject, deleteProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { getFinalMarkdown, getExportFilename } from './workflow.js';
import {
  ATTACHMENT_CONFIG,
  validateFile,
  validateFiles,
  formatFileSize,
  handleFiles,
  resetAttachmentTracking,
  getAttachmentStats
} from './attachments.js';

// Re-export attachment functions for backwards compatibility
export {
  ATTACHMENT_CONFIG,
  validateFile,
  validateFiles,
  formatFileSize,
  handleFiles,
  resetAttachmentTracking,
  getAttachmentStats
};

/**
 * Render the projects list view
 * @returns {Promise<void>}
 */
export async function renderProjectsList() {
  const projects = await getAllProjects();

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My Job Descriptions
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New JD
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">📝</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No job descriptions yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first inclusive job description
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First JD
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map(project => {
    // Check if all phases are complete
    const isComplete = project.phases &&
                        project.phases[1]?.completed &&
                        project.phases[2]?.completed &&
                        project.phases[3]?.completed;
    return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.jobTitle || project.title)}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${isComplete ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ''}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                ${escapeHtml(project.companyName || '')} ${project.roleLevel ? `• ${escapeHtml(project.roleLevel)}` : ''}
                            </p>

                            <div class="mb-4">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${Math.min(project.phase, 3)}/3</span>
                                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${Math.min((project.phase / 3) * 100, 100)}%"></div>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    ${[1, 2, 3].map(phase => `
                                        <div class="flex-1 h-1 rounded ${project.phases && project.phases[phase] && project.phases[phase].completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Updated ${formatDate(project.updatedAt)}</span>
                                <span class="px-2 py-1 rounded ${project.currentVendor ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}">
                                    ${project.currentVendor ? `vs ${escapeHtml(project.currentVendor)}` : 'New'}
                                </span>
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
        `}
    `;

  // Event listeners
  const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
  newProjectBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo('new-project'));
  });

  const projectCards = container.querySelectorAll('[data-project-id]');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        navigateTo('project', card.dataset.projectId);
      }
    });
  });

  // Preview buttons (for completed projects)
  const previewBtns = container.querySelectorAll('.preview-project-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, 'Your Job Description is Ready', getExportFilename(project));
        } else {
          showToast('No content to preview', 'warning');
        }
      }
    });
  });

  const deleteBtns = container.querySelectorAll('.delete-project-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);

      if (await confirm(`Are you sure you want to delete the job description for "${project.jobTitle || project.title}"?`, 'Delete Job Description')) {
        await deleteProject(projectId);
        showToast('Job description deleted', 'success');
        renderProjectsList();
      }
    });
  });
}

/**
 * Render the new project form view
 * @returns {void}
 */
export function renderNewProjectForm() {
  const container = document.getElementById('app-container');
  if (!container) return;
  container.innerHTML = getNewProjectFormHTML();
  setupNewProjectFormListeners();
}

/**
 * Generate HTML for the new project form
 * @returns {string} HTML string
 */
function getNewProjectFormHTML() {
  return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Job Descriptions
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Create New Job Description
                </h2>

                <form id="new-project-form" class="space-y-8">
                    <!-- Section 1: Role Basics -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            💼 Role Basics
                        </h3>

                        <!-- Posting Type Toggle -->
                        <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Posting Type</label>
                            <div class="flex items-center space-x-6">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="postingType" value="external" checked class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
                                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">External</span>
                                </label>
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="postingType" value="internal" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
                                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Internal</span>
                                </label>
                            </div>
                            <p id="posting-type-hint" class="text-xs text-gray-500 dark:text-gray-400 mt-2 hidden">Internal postings don't require compensation or benefits information.</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="jobTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title <span class="text-red-500">*</span></label>
                                <input type="text" id="jobTitle" name="jobTitle" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Senior Software Engineer">
                            </div>
                            <div>
                                <label for="companyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name <span class="text-red-500">*</span></label>
                                <input type="text" id="companyName" name="companyName" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Acme Corp">
                            </div>
                            <div>
                                <label for="roleLevel" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role Level</label>
                                <select id="roleLevel" name="roleLevel" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                                    <option value="">Select a level...</option>
                                    <option value="Junior">Junior</option>
                                    <option value="Mid">Mid</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Principal">Principal</option>
                                </select>
                            </div>
                            <div>
                                <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input type="text" id="location" name="location" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Remote / San Francisco, CA">
                            </div>
                        </div>
                    </section>

                    <!-- Section 2: Responsibilities & Requirements -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📋 Responsibilities & Requirements
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="responsibilities" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Responsibilities</label>
                                <textarea id="responsibilities" name="responsibilities" rows="5" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List 5-8 key responsibilities (one per line)..."></textarea>
                            </div>
                            <div>
                                <label for="requiredQualifications" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Qualifications</label>
                                <textarea id="requiredQualifications" name="requiredQualifications" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List 3-6 required qualifications (one per line)..."></textarea>
                            </div>
                            <div>
                                <label for="preferredQualifications" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Qualifications</label>
                                <textarea id="preferredQualifications" name="preferredQualifications" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List 4-8 preferred qualifications (one per line)..."></textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Section 3: Compensation & Benefits -->
                    <section id="comp-benefits-section">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            💰 Compensation & Benefits <span id="comp-optional-note" class="text-sm font-normal text-gray-500 dark:text-gray-400 hidden">(Optional for internal postings)</span>
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="compensationRange" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compensation Range</label>
                                <input type="text" id="compensationRange" name="compensationRange" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., $170,000 - $220,000">
                            </div>
                            <div>
                                <label for="benefits" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Benefits Highlights</label>
                                <textarea id="benefits" name="benefits" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List key benefits (health insurance, 401k, PTO, etc.)..."></textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Section 4: Optional Context -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            🔧 Optional Context
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="techStack" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tech Stack</label>
                                <textarea id="techStack" name="techStack" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Python, React, PostgreSQL, AWS..."></textarea>
                            </div>
                            <div>
                                <label for="teamSize" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Size / Structure</label>
                                <input type="text" id="teamSize" name="teamSize" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., 8-person team, reporting to VP Engineering">
                            </div>
                            <div>
                                <label for="aiSpecifics" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applied AI Specifics (for AI roles)</label>
                                <textarea id="aiSpecifics" name="aiSpecifics" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., LLMs, RAG, fine-tuning, prompt engineering..."></textarea>
                            </div>
                            <div>
                                <label for="careerLadder" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Career Ladder (Optional)</label>
                                <textarea id="careerLadder" name="careerLadder" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Company career ladder for accurate leveling..."></textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Relaxed validation - helps with accurate role leveling</p>
                            </div>
                        </div>
                    </section>

                    <!-- Section 5: Company-Mandated Content -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ⚖️ Company-Mandated Content
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="companyPreamble" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Preamble</label>
                                <textarea id="companyPreamble" name="companyPreamble" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="EEO statements, diversity commitments (appears at start of JD)..."></textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Relaxed validation - company-required content</p>
                            </div>
                            <div>
                                <label for="companyLegalText" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Legal Text</label>
                                <textarea id="companyLegalText" name="companyLegalText" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Disclaimers, legal notices (appears at end of JD)..."></textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Relaxed validation - company-required content</p>
                            </div>
                        </div>
                    </section>

                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Create Job Description
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Set up event listeners for the new project form
 * @returns {void}
 */
function setupNewProjectFormListeners() {
  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('cancel-btn')?.addEventListener('click', () => navigateTo('home'));

  // Posting type toggle - show/hide hints when switching between internal/external
  const postingTypeRadios = document.querySelectorAll('input[name="postingType"]');
  postingTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isInternal = /** @type {HTMLInputElement} */ (e.target).value === 'internal';
      const hint = document.getElementById('posting-type-hint');
      const optionalNote = document.getElementById('comp-optional-note');
      if (hint) hint.classList.toggle('hidden', !isInternal);
      if (optionalNote) optionalNote.classList.toggle('hidden', !isInternal);
    });
  });

  // Form submission
  const form = document.getElementById('new-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = /** @type {HTMLFormElement} */ (e.target);
    const formData = Object.fromEntries(new FormData(target));
    const project = await createProject(/** @type {import('./types.js').ProjectFormData} */ (formData));
    showToast('Job description created successfully!', 'success');
    navigateTo('project', project.id);
  });
}

/**
 * Render the edit project form
 * @param {string} projectId - ID of the project to edit
 * @returns {Promise<void>}
 */
export async function renderEditProjectForm(projectId) {
  const project = await getProject(projectId);
  if (!project) {
    showToast('Job description not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  if (!container) return;
  container.innerHTML = getEditProjectFormHTML(project);
  setupEditProjectFormListeners(project);
}

/**
 * Generate HTML for the edit project form
 * @param {import('./types.js').Project} project - Project to edit
 * @returns {string} HTML string
 */
function getEditProjectFormHTML(project) {
  return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Job Description
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Edit Job Description Details
                </h2>

                <form id="edit-project-form" class="space-y-8">
                    <!-- Section 1: Role Basics -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            💼 Role Basics
                        </h3>

                        <!-- Posting Type Toggle -->
                        <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Posting Type</label>
                            <div class="flex items-center space-x-6">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="postingType" value="external" ${project.postingType !== 'internal' ? 'checked' : ''} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
                                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">External</span>
                                </label>
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="postingType" value="internal" ${project.postingType === 'internal' ? 'checked' : ''} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
                                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Internal</span>
                                </label>
                            </div>
                            <p id="posting-type-hint" class="text-xs text-gray-500 dark:text-gray-400 mt-2 ${project.postingType === 'internal' ? '' : 'hidden'}">Internal postings don't require compensation or benefits information.</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="jobTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title <span class="text-red-500">*</span></label>
                                <input type="text" id="jobTitle" name="jobTitle" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Senior Software Engineer" value="${escapeHtml(project.jobTitle || '')}">
                            </div>
                            <div>
                                <label for="companyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name <span class="text-red-500">*</span></label>
                                <input type="text" id="companyName" name="companyName" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Acme Corp" value="${escapeHtml(project.companyName || '')}">
                            </div>
                            <div>
                                <label for="roleLevel" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role Level</label>
                                <select id="roleLevel" name="roleLevel" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                                    <option value="">Select a level...</option>
                                    <option value="Junior" ${project.roleLevel === 'Junior' ? 'selected' : ''}>Junior</option>
                                    <option value="Mid" ${project.roleLevel === 'Mid' ? 'selected' : ''}>Mid</option>
                                    <option value="Senior" ${project.roleLevel === 'Senior' ? 'selected' : ''}>Senior</option>
                                    <option value="Staff" ${project.roleLevel === 'Staff' ? 'selected' : ''}>Staff</option>
                                    <option value="Principal" ${project.roleLevel === 'Principal' ? 'selected' : ''}>Principal</option>
                                </select>
                            </div>
                            <div>
                                <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input type="text" id="location" name="location" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Remote / San Francisco, CA" value="${escapeHtml(project.location || '')}">
                            </div>
                        </div>
                    </section>

                    <!-- Section 2: Responsibilities & Requirements -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📋 Responsibilities & Requirements
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="responsibilities" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Responsibilities</label>
                                <textarea id="responsibilities" name="responsibilities" rows="5" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List 5-8 key responsibilities (one per line)...">${escapeHtml(project.responsibilities || '')}</textarea>
                            </div>
                            <div>
                                <label for="requiredQualifications" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Qualifications</label>
                                <textarea id="requiredQualifications" name="requiredQualifications" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List 3-6 required qualifications (one per line)...">${escapeHtml(project.requiredQualifications || '')}</textarea>
                            </div>
                            <div>
                                <label for="preferredQualifications" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Qualifications</label>
                                <textarea id="preferredQualifications" name="preferredQualifications" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List 4-8 preferred qualifications (one per line)...">${escapeHtml(project.preferredQualifications || '')}</textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Section 3: Compensation & Benefits -->
                    <section id="comp-benefits-section">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            💰 Compensation & Benefits <span id="comp-optional-note" class="text-sm font-normal text-gray-500 dark:text-gray-400 ${project.postingType === 'internal' ? '' : 'hidden'}">(Optional for internal postings)</span>
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="compensationRange" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compensation Range</label>
                                <input type="text" id="compensationRange" name="compensationRange" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., $170,000 - $220,000" value="${escapeHtml(project.compensationRange || '')}">
                            </div>
                            <div>
                                <label for="benefits" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Benefits Highlights</label>
                                <textarea id="benefits" name="benefits" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="List key benefits (health insurance, 401k, PTO, etc.)...">${escapeHtml(project.benefits || '')}</textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Section 4: Optional Context -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            🔧 Optional Context
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="techStack" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tech Stack</label>
                                <textarea id="techStack" name="techStack" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., Python, React, PostgreSQL, AWS...">${escapeHtml(project.techStack || '')}</textarea>
                            </div>
                            <div>
                                <label for="teamSize" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Size / Structure</label>
                                <input type="text" id="teamSize" name="teamSize" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., 8-person team, reporting to VP Engineering" value="${escapeHtml(project.teamSize || '')}">
                            </div>
                            <div>
                                <label for="aiSpecifics" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applied AI Specifics (for AI roles)</label>
                                <textarea id="aiSpecifics" name="aiSpecifics" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="e.g., LLMs, RAG, fine-tuning, prompt engineering...">${escapeHtml(project.aiSpecifics || '')}</textarea>
                            </div>
                            <div>
                                <label for="careerLadder" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Career Ladder (Optional)</label>
                                <textarea id="careerLadder" name="careerLadder" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Company career ladder for accurate leveling...">${escapeHtml(project.careerLadder || '')}</textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Relaxed validation - helps with accurate role leveling</p>
                            </div>
                        </div>
                    </section>

                    <!-- Section 5: Company-Mandated Content -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ⚖️ Company-Mandated Content
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="companyPreamble" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Preamble</label>
                                <textarea id="companyPreamble" name="companyPreamble" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="EEO statements, diversity commitments (appears at start of JD)...">${escapeHtml(project.companyPreamble || '')}</textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Relaxed validation - company-required content</p>
                            </div>
                            <div>
                                <label for="companyLegalText" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Legal Text</label>
                                <textarea id="companyLegalText" name="companyLegalText" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Disclaimers, legal notices (appears at end of JD)...">${escapeHtml(project.companyLegalText || '')}</textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Relaxed validation - company-required content</p>
                            </div>
                        </div>
                    </section>

                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Set up event listeners for the edit project form
 * @param {import('./types.js').Project} project - Project being edited
 * @returns {void}
 */
function setupEditProjectFormListeners(project) {
  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('project', project.id));
  document.getElementById('cancel-btn')?.addEventListener('click', () => navigateTo('project', project.id));

  // Posting type toggle - show/hide hints when switching between internal/external
  const postingTypeRadios = document.querySelectorAll('input[name="postingType"]');
  postingTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isInternal = /** @type {HTMLInputElement} */ (e.target).value === 'internal';
      const hint = document.getElementById('posting-type-hint');
      const optionalNote = document.getElementById('comp-optional-note');
      if (hint) hint.classList.toggle('hidden', !isInternal);
      if (optionalNote) optionalNote.classList.toggle('hidden', !isInternal);
    });
  });

  // Form submission
  const form = document.getElementById('edit-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = /** @type {HTMLFormElement} */ (e.target);
    const formData = Object.fromEntries(new FormData(target));
    // Update title based on job title and company name
    formData.title = `JD - ${formData.jobTitle} at ${formData.companyName}`;
    await updateProject(project.id, formData);
    showToast('Job description updated successfully!', 'success');
    navigateTo('project', project.id);
  });
}
