/**
 * CivicLens AI Automated Test Suite
 * Tests input validation, database persistence, AI response validation, and API fallback.
 */

import { getDatabase, insertReport, getReportById, updateReportStatus, getAllReports } from '../db/database.js';
import { analyzeCivicIssue } from '../ai/service.js';
import { CivicReport, PriorityLevel, IssueCategory } from '../types.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('  CivicLens AI — Automated Test Suite');
  console.log('====================================================\n');

  // TEST SUITE 1: Input Validation
  console.log('TEST SUITE 1: Input Validation Rules');
  {
    const validateTitle = (t?: string) => typeof t === 'string' && t.trim().length >= 3 && t.length <= 200;
    const validateDesc = (d?: string) => typeof d === 'string' && d.trim().length >= 10 && d.length <= 5000;
    const validateLoc = (l?: string) => typeof l === 'string' && l.trim().length >= 2;
    const validateImage = (img?: string) => !img || (img.startsWith('data:image/') && img.length <= 8 * 1024 * 1024);

    assert(!validateTitle('ab'), 'Rejects title shorter than 3 characters');
    assert(validateTitle('Dangerous open drain on Lohia Path'), 'Accepts valid descriptive title');
    assert(!validateDesc('Help!'), 'Rejects description shorter than 10 characters');
    assert(validateDesc('The drainage cover has been broken for two weeks causing foul water overflow.'), 'Accepts detailed description');
    assert(!validateLoc(''), 'Rejects empty location');
    assert(validateLoc('Hazratganj, Ward 12'), 'Accepts valid Lucknow location');
    assert(!validateImage('data:text/plain;base64,123'), 'Rejects non-image mime type');
    assert(validateImage('data:image/jpeg;base64,abcd'), 'Accepts valid base64 image');
  }

  // TEST SUITE 2: SQLite Database Persistence & Parameterized Queries
  console.log('\nTEST SUITE 2: Database Persistence & Parameterized Queries');
  {
    const db = await getDatabase();
    assert(db !== null, 'SQLite database initialized successfully in WebAssembly');

    const testId = `TEST-${Date.now()}`;
    const testReport: CivicReport = {
      id: testId,
      title: 'Automated Test: Broken Pavement Slab',
      description: 'Pavement slab fractured causing trip hazards on pedestrian walkway.',
      location: 'Chowk Heritage Walk, Lucknow',
      category: 'Roads & Potholes',
      department: 'Lucknow Nagar Nigam (Zone 2)',
      priority: 'medium',
      priorityReason: 'Moderate trip hazard on pedestrian pathway.',
      summary: 'Broken pavement slab on Chowk pedestrian path.',
      missingInformation: ['Exact distance from historical gate'],
      recommendedSteps: ['Inspect slab bedding and replace stone paver'],
      complaintDraft: 'Formal complaint regarding broken slab at Chowk...',
      status: 'Reported',
      statusHistory: [
        {
          status: 'Reported',
          timestamp: new Date().toISOString(),
          note: 'Created during test run',
          updatedBy: 'Test Runner'
        }
      ],
      upvotes: 3,
      aiConfidence: 0.9,
      modelUsed: 'test-model',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    insertReport(db, testReport);
    const fetched = getReportById(db, testId);

    assert(fetched !== null, 'Report inserted and fetched by ID successfully');
    assert(fetched?.title === testReport.title, 'Report title persisted accurately');
    assert(fetched?.category === 'Roads & Potholes', 'Report category persisted accurately');
    assert(Array.isArray(fetched?.missingInformation) && fetched.missingInformation.length === 1, 'JSON array for missing information deserialized accurately');

    // Update status
    const updated = updateReportStatus(db, testId, 'Action In Progress', 'Assigned repair team', 'Test Admin');
    assert(updated?.status === 'Action In Progress', 'Report status successfully updated to Action In Progress');
    assert(updated?.statusHistory.length === 2, 'Status history logged new audit entry with timestamp');

    // Filtered query test (parameterized)
    const filtered = getAllReports(db, { status: 'Action In Progress' });
    const containsUpdated = filtered.some(r => r.id === testId);
    assert(containsUpdated, 'Parameterized query returns report matching status filter');
  }

  // TEST SUITE 3: AI Response Validation & Sanitization
  console.log('\nTEST SUITE 3: AI Response Validation & Normalization');
  {
    const validPriorities: PriorityLevel[] = ['low', 'medium', 'high'];
    const validCategories: IssueCategory[] = [
      'Roads & Potholes', 'Sanitation & Waste', 'Street Lighting',
      'Water & Drainage', 'Encroachment & Traffic', 'Public Health & Safety',
      'Parks & Greenery', 'Other'
    ];

    // Test heuristic classification
    const analysis = await analyzeCivicIssue({
      title: 'Water pipe leak flooding basement',
      description: 'Potable water is gushing out of a ruptured main pipe in Alambagh since yesterday.',
      location: 'Alambagh, Lucknow'
    });

    assert(validPriorities.includes(analysis.priority), `AI priority "${analysis.priority}" is within strictly allowed enum`);
    assert(validCategories.includes(analysis.category), `AI category "${analysis.category}" normalized to valid category`);
    assert(typeof analysis.summary === 'string' && analysis.summary.length > 0, 'AI generated concise summary');
    assert(typeof analysis.complaintDraft === 'string' && analysis.complaintDraft.includes('Subject:'), 'AI generated formatted complaint draft');
    assert(Array.isArray(analysis.recommendedSteps) && analysis.recommendedSteps.length > 0, 'AI recommended actionable next steps');
  }

  // TEST SUITE 4: Error Handling when Hosted AI API is Unavailable
  console.log('\nTEST SUITE 4: Graceful Degradation & Fallback Handling');
  {
    // Temporarily save and clear API key to simulate network/quota/auth failure
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const fallbackResult = await analyzeCivicIssue({
        title: 'Fallen street tree blocking lane after storm',
        description: 'Large banyan tree branch broke off and is blocking both lanes near Butler Colony.',
        location: 'Butler Colony, Lucknow'
      });

      assert(fallbackResult !== null, 'Analysis completed without throwing uncaught exception when API key is missing');
      assert(fallbackResult.category === 'Parks & Greenery', 'Fallback engine correctly recognized botanical/park civic issue');
      assert(fallbackResult.priority === 'high', 'Fallback engine recognized road obstruction as high priority');
      assert(fallbackResult.modelUsed.includes('fallback'), 'Model name accurately flags fallback execution');
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  }

  console.log('\n====================================================');
  console.log(`  Tests completed: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All test suites passed successfully!\n');
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
