/**
 * JD Extractor Module
 * @module jd-extractor
 * 
 * Extracts structured job description fields from imported markdown text.
 * Uses heading-based extraction with pattern-based fallbacks.
 * 
 * DATA SAFETY: If extraction fails for any field, it remains empty.
 * The original markdown is always preserved in importedContent.
 */

/**
 * Common heading variations for JD sections (case-insensitive)
 */
const HEADING_PATTERNS = {
  responsibilities: [
    /^responsibilities$/i,
    /^key responsibilities$/i,
    /^duties$/i,
    /^what you'?ll do$/i,
    /^the role$/i,
    /^your role$/i,
    /^job duties$/i
  ],
  requirements: [
    /^requirements?$/i,
    /^qualifications?$/i,
    /^required qualifications?$/i,
    /^must have$/i,
    /^required skills?$/i,
    /^what we'?re looking for$/i,
    /^our ideal candidate$/i,
    /^who you are$/i
  ],
  preferred: [
    /^preferred$/i,
    /^preferred qualifications?$/i,
    /^nice to have$/i,
    /^bonus$/i,
    /^desired$/i,
    /^plus$/i,
    /^ideal$/i
  ],
  benefits: [
    /^benefits?$/i,
    /^what we offer$/i,
    /^perks$/i,
    /^compensation( & benefits)?$/i,
    /^why join us\??$/i
  ],
  about: [
    /^about( the)? (company|us)$/i,
    /^who we are$/i,
    /^company overview$/i
  ],
  roleOverview: [
    /^role overview$/i,
    /^about( the)? role$/i,
    /^position summary$/i,
    /^overview$/i
  ]
};

/**
 * Role level keywords to detect from job title
 */
const ROLE_LEVEL_KEYWORDS = [
  'principal', 'staff', 'senior', 'sr', 'lead', 'director', 
  'manager', 'head of', 'vp', 'chief', 'junior', 'jr', 
  'associate', 'entry', 'intern'
];

/**
 * Common tech stack keywords
 */
const TECH_KEYWORDS = [
  'aws', 'azure', 'gcp', 'react', 'vue', 'angular', 'node', 'nodejs',
  'python', 'java', 'javascript', 'typescript', 'go', 'golang', 'rust',
  'docker', 'kubernetes', 'k8s', 'sql', 'postgresql', 'mysql', 'mongodb',
  'redis', 'kafka', 'rabbitmq', 'graphql', 'rest', 'api',
  'tensorflow', 'pytorch', 'llm', 'gpt', 'openai', 'claude',
  'asr', 'tts', 'nlp', 'ml', 'ai', 'sip', 'webrtc', 'twilio'
];

/**
 * Extract structured fields from job description markdown
 * @param {string} markdown - The imported markdown content
 * @returns {Object} Extracted fields (empty string for fields not found)
 */
export function extractJobDescriptionFields(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return createEmptyResult();
  }

  const lines = markdown.split('\n');
  const sections = parseSections(lines);
  
  return {
    jobTitle: extractJobTitle(lines, markdown),
    companyName: extractCompanyName(markdown, sections),
    roleLevel: extractRoleLevel(lines, markdown),
    location: extractLocation(markdown),
    responsibilities: extractSectionContent(sections, 'responsibilities'),
    requiredQualifications: extractSectionContent(sections, 'requirements'),
    preferredQualifications: extractSectionContent(sections, 'preferred'),
    compensationRange: extractCompensation(markdown),
    benefits: extractSectionContent(sections, 'benefits'),
    techStack: extractTechStack(markdown),
    // Additional context fields
    roleOverview: extractSectionContent(sections, 'roleOverview'),
    aboutCompany: extractSectionContent(sections, 'about')
  };
}

/**
 * Create empty result object (data safety - never undefined)
 */
function createEmptyResult() {
  return {
    jobTitle: '',
    companyName: '',
    roleLevel: '',
    location: '',
    responsibilities: '',
    requiredQualifications: '',
    preferredQualifications: '',
    compensationRange: '',
    benefits: '',
    techStack: '',
    roleOverview: '',
    aboutCompany: ''
  };
}

/**
 * Parse markdown into sections based on headings
 * @param {string[]} lines - Array of lines
 * @returns {Object} Map of section type to content
 */
function parseSections(lines) {
  const sections = {};
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const heading = extractHeading(line);
    
    if (heading) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Determine new section type
      currentSection = matchHeadingToSection(heading);
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save final section
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * Extract heading text from a line (supports # and bold headings)
 */
function extractHeading(line) {
  const trimmed = line.trim();

  // Markdown heading: ## Heading or ### Heading
  const mdMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
  if (mdMatch) return mdMatch[1].trim();

  // Bold heading: **Heading** at start of line
  const boldMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*$/);
  if (boldMatch) return boldMatch[1].trim();

  // ALL CAPS heading (5+ chars, no lowercase)
  if (trimmed.length >= 5 && trimmed === trimmed.toUpperCase() && /^[A-Z\s\-&]+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Match heading text to a known section type
 */
function matchHeadingToSection(heading) {
  const normalized = heading.toLowerCase().trim();

  for (const [sectionType, patterns] of Object.entries(HEADING_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return sectionType;
      }
    }
  }

  return null;
}

/**
 * Extract section content by type
 */
function extractSectionContent(sections, sectionType) {
  return sections[sectionType] || '';
}

/**
 * Extract job title from markdown
 * Strategy: First line, look for em-dash pattern, H1 heading
 */
function extractJobTitle(lines, markdown) {
  // Strategy 1: H1 heading
  const h1Match = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
  if (h1Match) {
    const title = h1Match[1].replace(/^job description:\s*/i, '').trim();
    if (title && title.length <= 150) return title;
  }

  // Strategy 2: First non-empty line (often the title in pasted content)
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Skip if it looks like a heading marker only
    if (/^#{1,3}\s*$/.test(trimmed)) continue;
    // Skip horizontal rules
    if (/^[-=*]{3,}$/.test(trimmed)) continue;

    // Clean up the line
    let title = trimmed
      .replace(/^#{1,3}\s*/, '') // Remove heading markers
      .replace(/\*\*/g, '')      // Remove bold
      .trim();

    if (title && title.length >= 5 && title.length <= 150) {
      return title;
    }
  }

  return '';
}

/**
 * Extract company name from markdown
 * Strategy: "At Company" pattern, parentheses, About section
 */
function extractCompanyName(markdown, sections) {
  // Strategy 1: "At Company, we..." pattern
  const atMatch = markdown.match(/\bat\s+([A-Z][a-zA-Z\s&]{2,40})(?:[,.]|\s+we|\s+our|\s+is)/i);
  if (atMatch) {
    const company = atMatch[1].trim();
    // Avoid false positives like "At the same time"
    if (company.length >= 3 && !/^the\s/i.test(company)) {
      return company;
    }
  }

  // Strategy 2: Look in About section for company name
  if (sections.about) {
    const aboutMatch = sections.about.match(/^([A-Z][a-zA-Z\s&]{2,40})(?:\s+is|\s+was|\s+has)/);
    if (aboutMatch) return aboutMatch[1].trim();
  }

  return '';
}

/**
 * Extract role level from job title or content
 */
function extractRoleLevel(lines, markdown) {
  // Get the job title (first meaningful line)
  const title = extractJobTitle(lines, markdown).toLowerCase();

  for (const level of ROLE_LEVEL_KEYWORDS) {
    if (title.includes(level)) {
      // Capitalize first letter
      return level.charAt(0).toUpperCase() + level.slice(1);
    }
  }

  return '';
}

/**
 * Extract location from markdown
 */
function extractLocation(markdown) {
  // Pattern: "Location: X" or "Based in X"
  const locationMatch = markdown.match(/(?:location|based in|office)[:\s]+([a-zA-Z\s,]+?)(?:\n|$)/i);
  if (locationMatch) return locationMatch[1].trim();

  // Pattern: "Remote" standalone
  if (/\bremote\b/i.test(markdown)) {
    const remoteMatch = markdown.match(/\b(fully remote|remote[- ]first|remote|hybrid)\b/i);
    if (remoteMatch) return remoteMatch[1];
  }

  return '';
}

/**
 * Extract compensation range from markdown
 */
function extractCompensation(markdown) {
  // Pattern: $X - $Y or $X-$Y or $Xk-$Yk
  const compMatch = markdown.match(/\$[\d,]+[kK]?\s*[-–—to]+\s*\$[\d,]+[kK]?/);
  if (compMatch) return compMatch[0];

  // Pattern: $X,XXX - $Y,YYY
  const rangeMatch = markdown.match(/\$[\d,]+\s*[-–—to]+\s*\$[\d,]+/);
  if (rangeMatch) return rangeMatch[0];

  return '';
}

/**
 * Extract tech stack from markdown
 */
function extractTechStack(markdown) {
  const found = new Set();
  const lowerMarkdown = markdown.toLowerCase();

  for (const tech of TECH_KEYWORDS) {
    // Use word boundary to avoid partial matches
    const regex = new RegExp(`\\b${tech}\\b`, 'i');
    if (regex.test(lowerMarkdown)) {
      found.add(tech.toUpperCase() === tech ? tech : tech.charAt(0).toUpperCase() + tech.slice(1));
    }
  }

  return Array.from(found).join(', ');
}

