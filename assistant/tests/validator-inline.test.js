/**
 * Tests for validator-inline.js - JD Assistant
 *
 * Comprehensive tests for all scoring functions:
 * - Problem Clarity (30 pts)
 * - Solution Quality (25 pts)
 * - Scope Discipline (25 pts)
 * - Completeness (20 pts)
 */

import {
  validateDocument,
  validateOnePager,
  getScoreColor,
  getScoreLabel,
  scoreProblemClarity,
  scoreSolutionQuality,
  scoreScopeDiscipline,
  scoreCompleteness,
  detectProblemStatement,
  detectCostOfInaction,
  detectSolution,
  detectMeasurableGoals,
  detectScope,
  detectSuccessMetrics,
  detectSections,
  detectStakeholders,
  detectTimeline
} from '../../shared/js/validator-inline.js';

// ============================================================================
// Main Validation Function Tests
// ============================================================================

describe('validateDocument', () => {
  test('should return zero scores for empty content', () => {
    const result = validateDocument('');
    expect(result.totalScore).toBe(0);
    expect(result.problemClarity.score).toBe(0);
    expect(result.solution.score).toBe(0);
    expect(result.scope.score).toBe(0);
    expect(result.completeness.score).toBe(0);
  });

  test('should return zero scores for null content', () => {
    const result = validateDocument(null);
    expect(result.totalScore).toBe(0);
  });

  test('should return low scores for short content', () => {
    const result = validateDocument('Too short');
    expect(result.totalScore).toBeLessThan(15);
  });

  test('should return all scoring categories with correct maxScores', () => {
    const content = '# Test\n' + 'Content. '.repeat(50);
    const result = validateDocument(content);
    expect(result.problemClarity).toBeDefined();
    expect(result.solution).toBeDefined();
    expect(result.scope).toBeDefined();
    expect(result.completeness).toBeDefined();
    // Verify maxScores sum to 100
    expect(result.problemClarity.maxScore).toBe(30);
    expect(result.solution.maxScore).toBe(25);
    expect(result.scope.maxScore).toBe(25);
    expect(result.completeness.maxScore).toBe(20);
  });

  test('should score a well-structured document highly', () => {
    const goodDoc = `
# Problem Statement
Our customers struggle with manual data entry, causing 500+ hours wasted per month.
The cost of inaction is $50,000 annually in lost productivity.
This impacts our business revenue and customer satisfaction.

## Solution
We will build an automated data pipeline that reduces manual effort by 80%.
Our approach delivers measurable goals including faster processing and fewer errors.

## Goals and Benefits
- Reduce processing time by 75%
- Improve data accuracy to 99%
- Save $40,000 per year

## Scope
### In Scope
- We will automate the ingestion process
- We will provide real-time monitoring

### Out of Scope
- We will not modify the legacy database
- Phase 2: Advanced analytics (future)

## Success Metrics
- Measure: 90% reduction in manual tasks
- KPI: Less than 1% error rate
- Target: Full deployment in Q2

## Stakeholders
- Product Owner: Jane Doe (responsible)
- Engineering Lead: John Smith (accountable)
- Team: Core Platform

## Timeline
- Phase 1 (Q1): Design and prototype
- Phase 2 (Q2): Development and testing
- Milestone: Production launch by end of Q2
    `;
    const result = validateDocument(goodDoc);
    expect(result.totalScore).toBeGreaterThan(60);
    expect(result.problemClarity.score).toBeGreaterThan(15);
    expect(result.solution.score).toBeGreaterThanOrEqual(10);
  });
});

// ============================================================================
// Problem Clarity Tests (30 pts)
// ============================================================================

describe('scoreProblemClarity', () => {
  test('should detect problem section', () => {
    const content = `
# Problem Statement
Users are frustrated with slow load times.
`.repeat(3);
    const result = scoreProblemClarity(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect cost of inaction', () => {
    const content = `
# Problem
The cost of not addressing this is $100,000 per year.
Without action, we risk losing 20% of customers.
The consequence of delay is significant revenue loss.
`.repeat(2);
    const result = scoreProblemClarity(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should detect quantified problems', () => {
    const content = `
# Problem
This affects 10,000 users daily.
We lose $50,000 per month due to this issue.
Processing takes 500 hours per week.
`.repeat(2);
    const result = scoreProblemClarity(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should detect business focus', () => {
    const content = `
# Problem
This impacts our business revenue significantly.
Customer satisfaction is declining.
We are losing competitive advantage in the market.
`.repeat(2);
    const result = scoreProblemClarity(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should return issues for missing problem section', () => {
    const content = `
# Solution
We will build something great.
`.repeat(3);
    const result = scoreProblemClarity(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Solution Quality Tests (25 pts)
// ============================================================================

describe('scoreSolutionQuality', () => {
  test('should detect solution section', () => {
    const content = `
# Solution
We will implement an automated workflow system.
`.repeat(3);
    const result = scoreSolutionQuality(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect measurable goals', () => {
    const content = `
# Solution
We will measure success by tracking KPIs.
Our target is to achieve 95% accuracy.
We will monitor performance metrics daily.
`.repeat(2);
    const result = scoreSolutionQuality(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should detect high-level approach', () => {
    const content = `
# Solution
This is a high-level overview of our approach.
The architecture includes three main components.
The workflow process is designed for efficiency.
`.repeat(2);
    const result = scoreSolutionQuality(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should return issues for missing solution', () => {
    const content = `
# Problem
There is a problem.
`.repeat(3);
    const result = scoreSolutionQuality(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Scope Discipline Tests (25 pts)
// ============================================================================

describe('scoreScopeDiscipline', () => {
  test('should detect in-scope items', () => {
    const content = `
# Scope
## In Scope
- We will build the core feature
- We will provide documentation
- Included: API integration
`.repeat(2);
    const result = scoreScopeDiscipline(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect out-of-scope items', () => {
    const content = `
# Scope
## Out of Scope
- We will not build mobile app
- Not included: Legacy migration
- Phase 2: Advanced features
- Future: Machine learning
`.repeat(2);
    const result = scoreScopeDiscipline(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should score higher with both in-scope and out-of-scope', () => {
    const contentBoth = `
# Scope
## In Scope
- We will build the API
- We will provide documentation

## Out of Scope
- We will not build mobile app
- Future: Advanced analytics
`.repeat(2);
    const contentInOnly = `
# Scope
## In Scope
- We will build the API
- We will provide documentation
`.repeat(3);
    const resultBoth = scoreScopeDiscipline(contentBoth);
    const resultInOnly = scoreScopeDiscipline(contentInOnly);
    expect(resultBoth.score).toBeGreaterThanOrEqual(resultInOnly.score);
  });

  test('should detect success metrics', () => {
    const content = `
# Success Metrics
- KPI: 99% uptime
- Measure: Response time < 200ms
- Target: 1000 requests per second
`.repeat(2);
    const result = scoreScopeDiscipline(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should return issues for missing scope', () => {
    const content = `
# Problem
There is a problem.
# Solution
Here is a solution.
`.repeat(3);
    const result = scoreScopeDiscipline(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Completeness Tests (20 pts)
// ============================================================================

describe('scoreCompleteness', () => {
  test('should detect required sections', () => {
    const content = `
# Problem Statement
The problem is significant.

# Solution
We will solve it.

# Goals
Improve efficiency.

# Scope
In scope: Core features.
`.repeat(2);
    const result = scoreCompleteness(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect stakeholders', () => {
    const content = `
# Stakeholders
- Product Owner: Jane Doe (responsible)
- Engineering Lead: John Smith (accountable)
- RACI: Defined for all team members
`.repeat(2);
    const result = scoreCompleteness(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect timeline', () => {
    const content = `
# Timeline
- Phase 1 (Q1): Design
- Phase 2 (Q2): Development
- Milestone: Launch in Q3
- Sprint 1: Core features
`.repeat(2);
    const result = scoreCompleteness(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should return issues for missing sections', () => {
    const content = `
# Random Content
Just some text without structure.
`.repeat(5);
    const result = scoreCompleteness(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Detection Function Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectProblemStatement', () => {
    test('should detect problem section', () => {
      const content = '# Problem\nThere is a challenge.';
      const result = detectProblemStatement(content);
      expect(result.hasProblemSection).toBe(true);
    });

    test('should detect problem language', () => {
      const content = 'Users struggle with this issue and face challenges daily.';
      const result = detectProblemStatement(content);
      expect(result.hasProblemLanguage).toBe(true);
    });
  });

  describe('detectCostOfInaction', () => {
    test('should detect cost language', () => {
      const content = 'The cost of not acting is $100,000. Without this, we risk failure.';
      const result = detectCostOfInaction(content);
      expect(result.hasCostLanguage).toBe(true);
    });

    test('should detect quantified costs', () => {
      const content = 'We lose 500 hours per month and $50,000 annually.';
      const result = detectCostOfInaction(content);
      expect(result.isQuantified).toBe(true);
    });
  });

  describe('detectSolution', () => {
    test('should detect solution section', () => {
      const content = '# Solution\nWe will implement a new system.';
      const result = detectSolution(content);
      expect(result.hasSolutionSection).toBe(true);
    });

    test('should detect solution language', () => {
      const content = 'We will build and implement a solution to deliver value.';
      const result = detectSolution(content);
      expect(result.hasSolutionLanguage).toBe(true);
    });
  });

  describe('detectScope', () => {
    test('should detect in-scope items', () => {
      const content = 'In scope: We will build the API. We will provide docs.';
      const result = detectScope(content);
      expect(result.hasInScope).toBe(true);
    });

    test('should detect out-of-scope items', () => {
      const content = 'Out of scope: Mobile app. We will not build legacy support.';
      const result = detectScope(content);
      expect(result.hasOutOfScope).toBe(true);
    });
  });

  describe('detectSuccessMetrics', () => {
    test('should detect metrics section', () => {
      const content = '# Success Metrics\n- 99% uptime';
      const result = detectSuccessMetrics(content);
      expect(result.hasMetricsSection).toBe(true);
    });

    test('should detect quantified metrics', () => {
      const content = 'Target: 95% accuracy, 200ms response time, 1000 users.';
      const result = detectSuccessMetrics(content);
      expect(result.hasQuantified).toBe(true);
    });
  });

  describe('detectStakeholders', () => {
    test('should detect stakeholder section', () => {
      const content = '# Stakeholders\n- Owner: Jane';
      const result = detectStakeholders(content);
      expect(result.hasStakeholderSection).toBe(true);
    });

    test('should detect RACI', () => {
      const content = 'Responsible: Jane. Accountable: John. RACI defined.';
      const result = detectStakeholders(content);
      expect(result.hasRoles).toBe(true);
    });
  });

  describe('detectTimeline', () => {
    test('should detect timeline section', () => {
      const content = '# Timeline\n- Phase 1: Q1';
      const result = detectTimeline(content);
      expect(result.hasTimelineSection).toBe(true);
    });

    test('should detect phases', () => {
      const content = 'Phase 1 in Q1, Phase 2 in Q2, Sprint 1 starts next week.';
      const result = detectTimeline(content);
      expect(result.hasPhasing).toBe(true);
    });
  });
});

// ============================================================================
// Score Color and Label Tests
// ============================================================================

describe('getScoreColor', () => {
  test('should return green for scores >= 70', () => {
    expect(getScoreColor(70)).toBe('green');
    expect(getScoreColor(85)).toBe('green');
    expect(getScoreColor(100)).toBe('green');
  });

  test('should return yellow for scores 50-69', () => {
    expect(getScoreColor(50)).toBe('yellow');
    expect(getScoreColor(65)).toBe('yellow');
  });

  test('should return orange for scores 30-49', () => {
    expect(getScoreColor(30)).toBe('orange');
    expect(getScoreColor(45)).toBe('orange');
  });

  test('should return red for scores < 30', () => {
    expect(getScoreColor(0)).toBe('red');
    expect(getScoreColor(29)).toBe('red');
  });
});

describe('getScoreLabel', () => {
  test('should return Excellent for scores >= 80', () => {
    expect(getScoreLabel(80)).toBe('Excellent');
    expect(getScoreLabel(100)).toBe('Excellent');
  });

  test('should return Ready for scores 70-79', () => {
    expect(getScoreLabel(70)).toBe('Ready');
    expect(getScoreLabel(79)).toBe('Ready');
  });

  test('should return Needs Work for scores 50-69', () => {
    expect(getScoreLabel(50)).toBe('Needs Work');
    expect(getScoreLabel(69)).toBe('Needs Work');
  });

  test('should return Draft for scores 30-49', () => {
    expect(getScoreLabel(30)).toBe('Draft');
    expect(getScoreLabel(49)).toBe('Draft');
  });

  test('should return Incomplete for scores < 30', () => {
    expect(getScoreLabel(0)).toBe('Incomplete');
    expect(getScoreLabel(29)).toBe('Incomplete');
  });
});
