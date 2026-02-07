/**
 * Projects Module Tests
 * Tests for JD Assistant project management including export/import
 */

import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  updatePhase,
  deleteProject,
  exportProject,
  exportAllProjects,
  importProjects,
  extractTitleFromMarkdown
} from '../../shared/js/projects.js';
import storage from '../../shared/js/storage.js';

describe('Projects Module', () => {
  beforeAll(async () => {
    await storage.init();
  });

  beforeEach(async () => {
    // Clean up projects between tests
    const projects = await storage.getAllProjects();
    for (const project of projects) {
      await storage.deleteProject(project.id);
    }
  });

  describe('Module Exports', () => {
    test('should export createProject function', () => {
      expect(createProject).toBeInstanceOf(Function);
    });

    test('should export getAllProjects function', () => {
      expect(getAllProjects).toBeInstanceOf(Function);
    });

    test('should export getProject function', () => {
      expect(getProject).toBeInstanceOf(Function);
    });

    test('should export updateProject function', () => {
      expect(updateProject).toBeInstanceOf(Function);
    });

    test('should export updatePhase function', () => {
      expect(updatePhase).toBeInstanceOf(Function);
    });

    test('should export deleteProject function', () => {
      expect(deleteProject).toBeInstanceOf(Function);
    });

    test('should export exportProject function', () => {
      expect(exportProject).toBeInstanceOf(Function);
    });

    test('should export exportAllProjects function', () => {
      expect(exportAllProjects).toBeInstanceOf(Function);
    });

    test('should export importProjects function', () => {
      expect(importProjects).toBeInstanceOf(Function);
    });
  });

  describe('createProject', () => {
    test('should create a new JD project with correct structure', async () => {
      const formData = {
        jobTitle: 'Senior Software Engineer',
        companyName: 'Acme Corp',
        roleLevel: 'Senior (L5)',
        location: 'Remote',
        responsibilities: 'Build features',
        requiredQualifications: '5+ years experience',
        preferredQualifications: 'TypeScript experience',
        compensationRange: '$150k-$200k',
        benefits: 'Health, 401k',
        techStack: 'React, Node.js',
        teamSize: '8 engineers',
        aiSpecifics: 'LLM experience preferred',
        careerLadder: 'Path to Staff',
        companyPreamble: 'We are an equal opportunity employer',
        companyLegalText: 'Background check required'
      };

      const project = await createProject(formData);

      expect(project).toBeTruthy();
      expect(project.id).toBeTruthy();
      expect(project.title).toBe('JD - Senior Software Engineer at Acme Corp');
      expect(project.jobTitle).toBe('Senior Software Engineer');
      expect(project.companyName).toBe('Acme Corp');
      expect(project.roleLevel).toBe('Senior (L5)');
      expect(project.location).toBe('Remote');
      expect(project.responsibilities).toBe('Build features');
      expect(project.requiredQualifications).toBe('5+ years experience');
      expect(project.preferredQualifications).toBe('TypeScript experience');
      expect(project.compensationRange).toBe('$150k-$200k');
      expect(project.benefits).toBe('Health, 401k');
      expect(project.techStack).toBe('React, Node.js');
      expect(project.teamSize).toBe('8 engineers');
      expect(project.aiSpecifics).toBe('LLM experience preferred');
      expect(project.careerLadder).toBe('Path to Staff');
      expect(project.companyPreamble).toBe('We are an equal opportunity employer');
      expect(project.companyLegalText).toBe('Background check required');
      expect(project.phase).toBe(1);
      expect(project.createdAt).toBeTruthy();
      expect(project.updatedAt).toBeTruthy();
      expect(project.phases).toBeTruthy();
      expect(project.phases[1]).toBeTruthy();
      expect(project.phases[2]).toBeTruthy();
      expect(project.phases[3]).toBeTruthy();
    });

    test('should use custom title if provided', async () => {
      const formData = {
        title: 'Custom JD Title',
        jobTitle: 'Engineer',
        companyName: 'Test Co'
      };

      const project = await createProject(formData);
      expect(project.title).toBe('Custom JD Title');
    });
  });

  describe('getAllProjects', () => {
    test('should return empty array when no projects exist', async () => {
      const projects = await getAllProjects();
      expect(projects).toEqual([]);
    });

    test('should return all created projects', async () => {
      await createProject({ jobTitle: 'Engineer 1', companyName: 'Co 1' });
      await createProject({ jobTitle: 'Engineer 2', companyName: 'Co 2' });

      const projects = await getAllProjects();
      expect(projects.length).toBe(2);
    });
  });

  describe('getProject', () => {
    test('should return undefined for non-existent project', async () => {
      const project = await getProject('non-existent-id');
      expect(project).toBeUndefined();
    });

    test('should return project by ID', async () => {
      const created = await createProject({ jobTitle: 'Test', companyName: 'Test Co' });
      const retrieved = await getProject(created.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.jobTitle).toBe('Test');
    });
  });

  describe('updateProject', () => {
    test('should update project fields', async () => {
      const created = await createProject({ jobTitle: 'Original', companyName: 'Test Co' });

      const updated = await updateProject(created.id, { jobTitle: 'Updated Title' });

      expect(updated.jobTitle).toBe('Updated Title');
      expect(updated.companyName).toBe('Test Co'); // unchanged
    });

    test('should throw error for non-existent project', async () => {
      await expect(updateProject('non-existent', { jobTitle: 'Test' }))
        .rejects.toThrow('Project not found');
    });
  });

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const created = await createProject({ jobTitle: 'To Delete', companyName: 'Test Co' });

      await deleteProject(created.id);

      const retrieved = await getProject(created.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('importProjects', () => {
    test('should import a single project from JSON file', async () => {
      // Create a project to export
      const original = await createProject({
        jobTitle: 'Senior Engineer',
        companyName: 'Import Test Co',
        responsibilities: 'Build things'
      });

      // Create a mock File object with the project JSON
      const jsonContent = JSON.stringify(original);
      const file = new File([jsonContent], 'project.json', { type: 'application/json' });

      // Delete the original
      await deleteProject(original.id);

      // Import from file
      const importedCount = await importProjects(file);

      expect(importedCount).toBe(1);

      // Verify it was imported
      const retrieved = await getProject(original.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved.jobTitle).toBe('Senior Engineer');
      expect(retrieved.companyName).toBe('Import Test Co');
    });

    test('should import multiple projects from backup file', async () => {
      // Create multiple projects
      const project1 = await createProject({ jobTitle: 'Engineer 1', companyName: 'Co 1' });
      const project2 = await createProject({ jobTitle: 'Engineer 2', companyName: 'Co 2' });
      const project3 = await createProject({ jobTitle: 'Engineer 3', companyName: 'Co 3' });

      // Create backup format
      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectCount: 3,
        projects: [project1, project2, project3]
      };

      const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });

      // Delete all projects
      await deleteProject(project1.id);
      await deleteProject(project2.id);
      await deleteProject(project3.id);

      // Import from backup
      const importedCount = await importProjects(file);

      expect(importedCount).toBe(3);

      // Verify all were imported
      const allProjects = await getAllProjects();
      expect(allProjects.length).toBe(3);
    });

    test('should reject invalid file format', async () => {
      const invalidContent = JSON.stringify({ foo: 'bar' });
      const file = new File([invalidContent], 'invalid.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow('Invalid file format');
    });

    test('should reject non-JSON content', async () => {
      const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow();
    });

    test('should handle empty backup file', async () => {
      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectCount: 0,
        projects: []
      };

      const file = new File([JSON.stringify(backup)], 'empty-backup.json', { type: 'application/json' });

      const importedCount = await importProjects(file);
      expect(importedCount).toBe(0);
    });
  });

  describe('exportProject', () => {
    // Mock DOM APIs for export tests
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockClick;
    let capturedBlob;
    let capturedDownloadName;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      mockClick = jest.fn();

      mockCreateObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      mockRevokeObjectURL = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document.createElement to capture download filename
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === 'a') {
          Object.defineProperty(element, 'click', { value: mockClick });
          Object.defineProperty(element, 'download', {
            set: (value) => { capturedDownloadName = value; },
            get: () => capturedDownloadName
          });
        }
        return element;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should export a single project as JSON', async () => {
      const project = await createProject({
        jobTitle: 'Export Test Engineer',
        companyName: 'Export Co'
      });

      await exportProject(project.id);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(capturedBlob).toBeInstanceOf(Blob);
      expect(capturedBlob.type).toBe('application/json');
    });

    test('should throw error for non-existent project', async () => {
      await expect(exportProject('non-existent-id')).rejects.toThrow('Project not found');
    });
  });

  describe('exportAllProjects', () => {
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockClick;
    let capturedBlob;
    let capturedDownloadName;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      mockClick = jest.fn();

      mockCreateObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      mockRevokeObjectURL = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === 'a') {
          Object.defineProperty(element, 'click', { value: mockClick });
          Object.defineProperty(element, 'download', {
            set: (value) => { capturedDownloadName = value; },
            get: () => capturedDownloadName
          });
        }
        return element;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should export all projects as backup JSON', async () => {
      await createProject({ jobTitle: 'Engineer 1', companyName: 'Co 1' });
      await createProject({ jobTitle: 'Engineer 2', companyName: 'Co 2' });

      await exportAllProjects();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(capturedBlob).toBeInstanceOf(Blob);
      expect(capturedBlob.type).toBe('application/json');

      // Verify backup structure using FileReader
      const blobText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(capturedBlob);
      });
      const backup = JSON.parse(blobText);
      expect(backup.version).toBe('1.0');
      expect(backup.exportedAt).toBeTruthy();
      expect(backup.projectCount).toBe(2);
      expect(backup.projects).toHaveLength(2);
    });

    test('should export empty backup when no projects exist', async () => {
      await exportAllProjects();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(capturedBlob).toBeInstanceOf(Blob);

      // Verify backup structure using FileReader
      const blobText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(capturedBlob);
      });
      const backup = JSON.parse(blobText);
      expect(backup.projectCount).toBe(0);
      expect(backup.projects).toHaveLength(0);
    });

    test('should include correct filename with date', async () => {
      await exportAllProjects();

      expect(capturedDownloadName).toMatch(/^jd-assistant-backup-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe('updatePhase', () => {
    test('should update phase with prompt and response', async () => {
      const project = await createProject({ jobTitle: 'Test', companyName: 'Test Co' });

      const updated = await updatePhase(project.id, 1, 'Test prompt', 'Test response');

      expect(updated.phases[1].prompt).toBe('Test prompt');
      expect(updated.phases[1].response).toBe('Test response');
      expect(updated.phases[1].completed).toBe(true);
      expect(updated.phase1_output).toBe('Test response');
    });

    test('should auto-advance to next phase when response provided', async () => {
      const project = await createProject({ jobTitle: 'Test', companyName: 'Test Co' });
      expect(project.phase).toBe(1);

      const updated = await updatePhase(project.id, 1, 'Prompt', 'Response');
      expect(updated.phase).toBe(2);
    });

    test('should not auto-advance when skipAutoAdvance is true', async () => {
      const project = await createProject({ jobTitle: 'Test', companyName: 'Test Co' });

      const updated = await updatePhase(project.id, 1, 'Prompt', 'Response', { skipAutoAdvance: true });
      expect(updated.phase).toBe(1);
    });

    test('should not advance past phase 3', async () => {
      const project = await createProject({ jobTitle: 'Test', companyName: 'Test Co' });

      await updatePhase(project.id, 1, 'P1', 'R1');
      await updatePhase(project.id, 2, 'P2', 'R2');
      const final = await updatePhase(project.id, 3, 'P3', 'R3');

      expect(final.phase).toBe(3); // Should stay at 3, not advance to 4
    });
  });

  // =================================================================
  // extractTitleFromMarkdown Tests
  // =================================================================
  describe('extractTitleFromMarkdown', () => {
    test('should return empty string for null input', () => {
      expect(extractTitleFromMarkdown(null)).toBe('');
    });

    test('should return empty string for empty input', () => {
      expect(extractTitleFromMarkdown('')).toBe('');
    });

    test('should extract H1 header', () => {
      const md = '# My Document Title\n\nSome content here.';
      expect(extractTitleFromMarkdown(md)).toBe('My Document Title');
    });

    test('should skip PRESS RELEASE header', () => {
      const md = '# PRESS RELEASE\n\n**Exciting Headline Here**\n\nContent...';
      expect(extractTitleFromMarkdown(md)).toBe('Exciting Headline Here');
    });

    test('should extract bold headline after PRESS RELEASE', () => {
      const md = '# PRESS RELEASE\n**Company Announces New Feature**\n\nDetails follow.';
      expect(extractTitleFromMarkdown(md)).toBe('Company Announces New Feature');
    });

    test('should extract first bold line as fallback', () => {
      const md = 'Some text\n**This Is A Good Headline Title**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('This Is A Good Headline Title');
    });

    test('should reject too-short bold text', () => {
      const md = '**Short**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });

    test('should reject bold text ending with period (sentences)', () => {
      const md = '**This is a sentence ending with period.**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });
  });
});
