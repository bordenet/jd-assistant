/**
 * @jest-environment jsdom
 */

import { DOCUMENT_TEMPLATES, getTemplate, getAllTemplates } from '../../shared/js/document-specific-templates.js';

describe('Document-Specific Templates', () => {
  describe('DOCUMENT_TEMPLATES', () => {
    it('should have all expected templates', () => {
      const expectedIds = ['blank', 'softwareEngineer', 'aiEngineer', 'productManager', 'engineeringManager'];
      const actualIds = Object.keys(DOCUMENT_TEMPLATES);
      expect(actualIds).toEqual(expect.arrayContaining(expectedIds));
      expect(actualIds.length).toBe(expectedIds.length);
    });

    it('should have all required properties for each template', () => {
      const requiredProps = ['id', 'name', 'icon', 'description', 'jobTitle', 'roleLevel', 'responsibilities', 'requiredQualifications', 'techStack'];
      Object.values(DOCUMENT_TEMPLATES).forEach(template => {
        requiredProps.forEach(prop => {
          expect(template).toHaveProperty(prop);
        });
      });
    });

    it('should have matching id property and key', () => {
      Object.entries(DOCUMENT_TEMPLATES).forEach(([key, template]) => {
        expect(template.id).toBe(key);
      });
    });
  });

  describe('getTemplate', () => {
    it('should return correct template for valid ID', () => {
      const template = getTemplate('softwareEngineer');
      expect(template).toBeDefined();
      expect(template.id).toBe('softwareEngineer');
      expect(template.name).toBe('Software Engineer');
    });

    it('should return null for invalid ID', () => {
      const template = getTemplate('nonexistent');
      expect(template).toBeNull();
    });

    it('should return blank template', () => {
      const template = getTemplate('blank');
      expect(template).toBeDefined();
      expect(template.jobTitle).toBe('');
      expect(template.responsibilities).toBe('');
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates as array', () => {
      const templates = getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(5);
    });

    it('should include blank template first', () => {
      const templates = getAllTemplates();
      expect(templates[0].id).toBe('blank');
    });

    it('should return template objects with all required fields', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('icon');
        expect(template).toHaveProperty('description');
      });
    });
  });

  describe('Template Content', () => {
    it('softwareEngineer should have backend-related content', () => {
      const template = getTemplate('softwareEngineer');
      expect(template.responsibilities).toContain('backend');
    });

    it('aiEngineer should have LLM-related content', () => {
      const template = getTemplate('aiEngineer');
      expect(template.responsibilities).toContain('LLM');
    });

    it('productManager should have roadmap-related content', () => {
      const template = getTemplate('productManager');
      expect(template.responsibilities).toContain('roadmap');
    });

    it('engineeringManager should have team-related content', () => {
      const template = getTemplate('engineeringManager');
      expect(template.responsibilities).toContain('team');
    });
  });
});

