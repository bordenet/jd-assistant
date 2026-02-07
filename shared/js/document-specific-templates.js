/**
 * Document-Specific Templates for Job Description
 * Pre-filled content for common job posting use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} JDTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} jobTitle - Pre-filled job title
 * @property {string} roleLevel - Pre-filled role level
 * @property {string} responsibilities - Pre-filled responsibilities
 * @property {string} requiredQualifications - Pre-filled required qualifications
 * @property {string} techStack - Pre-filled tech stack
 */

/** @type {Record<string, JDTemplate>} */
export const DOCUMENT_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    jobTitle: '',
    roleLevel: '',
    responsibilities: '',
    requiredQualifications: '',
    techStack: ''
  },
  softwareEngineer: {
    id: 'softwareEngineer',
    name: 'Software Engineer',
    icon: '💻',
    description: 'Backend/fullstack role',
    jobTitle: 'Software Engineer',
    roleLevel: 'Senior',
    responsibilities: `Design and implement scalable backend services
Collaborate with product and design teams on feature development
Write clean, testable, and well-documented code
Participate in code reviews and mentor junior engineers
Contribute to architectural decisions and technical roadmap`,
    requiredQualifications: `5+ years of software development experience
Proficiency in [Python/Java/Go/Node.js]
Experience with relational databases and SQL
Strong understanding of distributed systems
BS/MS in Computer Science or equivalent experience`,
    techStack: 'Python, PostgreSQL, Redis, AWS, Docker, Kubernetes'
  },
  aiEngineer: {
    id: 'aiEngineer',
    name: 'AI/ML Engineer',
    icon: '🤖',
    description: 'Applied AI role',
    jobTitle: 'Applied AI Engineer',
    roleLevel: 'Senior',
    responsibilities: `Build and deploy production ML/AI systems
Fine-tune and integrate LLMs for product features
Design RAG pipelines and prompt engineering strategies
Collaborate with product teams on AI-powered experiences
Evaluate and improve model performance metrics`,
    requiredQualifications: `3+ years of ML/AI engineering experience
Hands-on experience with LLMs (GPT, Claude, Llama)
Production experience with RAG, embeddings, vector DBs
Strong Python and ML framework skills (PyTorch, HuggingFace)
Experience deploying models at scale`,
    techStack: 'Python, PyTorch, LangChain, OpenAI API, Pinecone, AWS SageMaker'
  },
  productManager: {
    id: 'productManager',
    name: 'Product Manager',
    icon: '📊',
    description: 'PM role',
    jobTitle: 'Product Manager',
    roleLevel: 'Senior',
    responsibilities: `Own product roadmap and prioritization
Define product requirements and success metrics
Collaborate with engineering, design, and stakeholders
Conduct user research and competitive analysis
Drive product launches and go-to-market strategy`,
    requiredQualifications: `5+ years of product management experience
Track record of shipping successful products
Strong analytical and data-driven decision making
Excellent communication and stakeholder management
Experience in [B2B SaaS / Consumer / Platform]`,
    techStack: ''
  },
  engineeringManager: {
    id: 'engineeringManager',
    name: 'Engineering Manager',
    icon: '👔',
    description: 'People manager role',
    jobTitle: 'Engineering Manager',
    roleLevel: 'Staff',
    responsibilities: `Lead and grow a team of 5-8 engineers
Drive technical excellence and delivery execution
Partner with product on roadmap and prioritization
Hire, mentor, and develop engineering talent
Own team processes, planning, and retrospectives`,
    requiredQualifications: `3+ years of engineering management experience
8+ years of software development experience
Track record of building high-performing teams
Strong technical judgment and systems thinking
Experience scaling teams through growth`,
    techStack: ''
  }
};

/**
 * Get a template by ID
 * @param {string} templateId - The template ID
 * @returns {JDTemplate|null} The template or null if not found
 */
export function getTemplate(templateId) {
  return DOCUMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array
 * @returns {JDTemplate[]} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(DOCUMENT_TEMPLATES);
}

