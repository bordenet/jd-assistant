/**
 * Views Module Tests
 */

import { renderProjectsList, renderNewProjectForm } from '../../shared/js/views.js';

describe('Views Module', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app-container"></div>';
  });

  test('should export renderProjectsList function', () => {
    expect(renderProjectsList).toBeInstanceOf(Function);
  });

  test('should export renderNewProjectForm function', () => {
    expect(renderNewProjectForm).toBeInstanceOf(Function);
  });

  test('renderProjectsList should be async', () => {
    expect(renderProjectsList.constructor.name).toBe('AsyncFunction');
  });

  describe('New Project Form - JD Fields', () => {
    beforeEach(() => {
      renderNewProjectForm();
    });

    // Section 1: Role Basics
    test('should have jobTitle field', () => {
      const field = document.getElementById('jobTitle');
      expect(field).toBeTruthy();
      expect(field.getAttribute('type')).toBe('text');
      expect(field.hasAttribute('required')).toBe(true);
    });

    test('should have companyName field', () => {
      const field = document.getElementById('companyName');
      expect(field).toBeTruthy();
      expect(field.getAttribute('type')).toBe('text');
      expect(field.hasAttribute('required')).toBe(true);
    });

    test('should have roleLevel select field', () => {
      const field = document.getElementById('roleLevel');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('SELECT');
      const options = field.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(0);
    });

    test('should have location field', () => {
      const field = document.getElementById('location');
      expect(field).toBeTruthy();
      expect(field.getAttribute('type')).toBe('text');
    });

    // Section 2: Responsibilities & Requirements
    test('should have responsibilities textarea', () => {
      const field = document.getElementById('responsibilities');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    test('should have requiredQualifications textarea', () => {
      const field = document.getElementById('requiredQualifications');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    test('should have preferredQualifications textarea', () => {
      const field = document.getElementById('preferredQualifications');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    // Section 3: Compensation & Benefits
    test('should have compensationRange field', () => {
      const field = document.getElementById('compensationRange');
      expect(field).toBeTruthy();
      expect(field.getAttribute('type')).toBe('text');
    });

    test('should have benefits textarea', () => {
      const field = document.getElementById('benefits');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    // Section 4: Optional Context
    test('should have techStack textarea', () => {
      const field = document.getElementById('techStack');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    test('should have teamSize field', () => {
      const field = document.getElementById('teamSize');
      expect(field).toBeTruthy();
      expect(field.getAttribute('type')).toBe('text');
    });

    test('should have aiSpecifics textarea', () => {
      const field = document.getElementById('aiSpecifics');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    test('should have careerLadder textarea', () => {
      const field = document.getElementById('careerLadder');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    // Section 5: Company-Mandated Content
    test('should have companyPreamble textarea', () => {
      const field = document.getElementById('companyPreamble');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    test('should have companyLegalText textarea', () => {
      const field = document.getElementById('companyLegalText');
      expect(field).toBeTruthy();
      expect(field.tagName).toBe('TEXTAREA');
    });

    // Form structure tests
    test('should have form with id new-project-form', () => {
      const form = document.getElementById('new-project-form');
      expect(form).toBeTruthy();
      expect(form.tagName).toBe('FORM');
    });

    test('should have back button', () => {
      const btn = document.getElementById('back-btn');
      expect(btn).toBeTruthy();
    });

    test('should have cancel button', () => {
      const btn = document.getElementById('cancel-btn');
      expect(btn).toBeTruthy();
    });

    test('should have submit button', () => {
      const form = document.getElementById('new-project-form');
      const submitBtn = form.querySelector('button[type="submit"]');
      expect(submitBtn).toBeTruthy();
    });
  });
});
