import { AssessmentQuestion } from '@/types/careerCompass';

export const DEMO_ASSESSMENT_TOPICS = [
  { id: 'sql', title: 'SQL & Relational Databases', questionCount: 10, timeMinutes: 15, level: 'Intermediate' },
  { id: 'python', title: 'Python Core & Data Structures', questionCount: 10, timeMinutes: 15, level: 'Intermediate' },
  { id: 'ml', title: 'Machine Learning Fundamentals', questionCount: 10, timeMinutes: 20, level: 'Advanced' },
  { id: 'git', title: 'Git & Version Control Workflows', questionCount: 8, timeMinutes: 12, level: 'Beginner' }
];

export const DEMO_SQL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'sql-q1',
    questionNumber: 1,
    topic: 'Window Functions',
    difficulty: 'Intermediate',
    stem: 'Which SQL window function assigns consecutive ranks without skipping values when duplicates are encountered?',
    options: [
      { id: 'a', text: 'RANK()' },
      { id: 'b', text: 'DENSE_RANK()' },
      { id: 'c', text: 'ROW_NUMBER()' },
      { id: 'd', text: 'NTILE(4)' }
    ],
    correctOptionId: 'b',
    explanation: 'DENSE_RANK() computes the rank of each row without gaps in ranking values when tied values occur.'
  },
  {
    id: 'sql-q2',
    questionNumber: 2,
    topic: 'Aggregations & Filtering',
    difficulty: 'Beginner',
    stem: 'Which clause is used to filter aggregated group results produced by a GROUP BY clause?',
    options: [
      { id: 'a', text: 'WHERE' },
      { id: 'b', text: 'HAVING' },
      { id: 'c', text: 'QUALIFY' },
      { id: 'd', text: 'LIMIT' }
    ],
    correctOptionId: 'b',
    explanation: 'HAVING filters rows after GROUP BY aggregations, whereas WHERE filters individual rows prior to grouping.'
  },
  {
    id: 'sql-q3',
    questionNumber: 3,
    topic: 'Joins & Set Theory',
    difficulty: 'Intermediate',
    stem: 'What is the key difference between UNION and UNION ALL?',
    options: [
      { id: 'a', text: 'UNION ALL removes duplicates, while UNION retains them' },
      { id: 'b', text: 'UNION removes duplicate rows via an implicit sort/hash, whereas UNION ALL preserves all rows' },
      { id: 'c', text: 'UNION can only be used on indexed tables' },
      { id: 'd', text: 'UNION ALL requires columns to have identical names' }
    ],
    correctOptionId: 'b',
    explanation: 'UNION performs deduplication, which introduces computational overhead; UNION ALL directly concatenates record sets.'
  },
  {
    id: 'sql-q4',
    questionNumber: 4,
    topic: 'Common Table Expressions',
    difficulty: 'Intermediate',
    stem: 'Which SQL keyword initiates a Common Table Expression (CTE)?',
    options: [
      { id: 'a', text: 'VIEW' },
      { id: 'b', text: 'WITH' },
      { id: 'c', text: 'AS TEMPORARY' },
      { id: 'd', text: 'SUBQUERY' }
    ],
    correctOptionId: 'b',
    explanation: 'CTEs are defined using the WITH clause, providing modular, readable query breakdown.'
  },
  {
    id: 'sql-q5',
    questionNumber: 5,
    topic: 'Indexes & Query Plans',
    difficulty: 'Advanced',
    stem: 'When executing a query with WHERE department_id = 10 AND salary > 50000, which B-tree index structure provides optimal selectivity?',
    options: [
      { id: 'a', text: 'Single-column index on salary only' },
      { id: 'b', text: 'Composite index on (department_id, salary)' },
      { id: 'c', text: 'Composite index on (salary, department_id)' },
      { id: 'd', text: 'Clustered hash index on salary' }
    ],
    correctOptionId: 'b',
    explanation: 'Composite indexes perform best when equality conditions (department_id) precede range conditions (salary).'
  },
  {
    id: 'sql-q6',
    questionNumber: 6,
    topic: 'Null Handling',
    difficulty: 'Beginner',
    stem: 'What is the result of SELECT COUNT(*) vs SELECT COUNT(column_name) when column_name contains NULL values?',
    options: [
      { id: 'a', text: 'Both return identical counts' },
      { id: 'b', text: 'COUNT(*) counts all rows; COUNT(column_name) excludes NULL values' },
      { id: 'c', text: 'COUNT(*) throws an exception if NULLs exist' },
      { id: 'd', text: 'COUNT(column_name) replaces NULLs with zero' }
    ],
    correctOptionId: 'b',
    explanation: 'COUNT(*) tallies all qualifying rows regardless of nullability, while COUNT(col) excludes NULL records.'
  },
  {
    id: 'sql-q7',
    questionNumber: 7,
    topic: 'Subqueries',
    difficulty: 'Intermediate',
    stem: 'What distinguishes a correlated subquery from a standard independent subquery?',
    options: [
      { id: 'a', text: 'A correlated subquery executes once for the entire query execution' },
      { id: 'b', text: 'A correlated subquery references columns from the outer query and re-evaluates per outer row' },
      { id: 'c', text: 'A correlated subquery cannot use comparison operators' },
      { id: 'd', text: 'A correlated subquery must always return multiple columns' }
    ],
    correctOptionId: 'b',
    explanation: 'Correlated subqueries depend on outer query column context and evaluate once for each row processed by the parent query.'
  },
  {
    id: 'sql-q8',
    questionNumber: 8,
    topic: 'Transaction Isolation',
    difficulty: 'Advanced',
    stem: 'Which ANSI SQL transaction isolation level guarantees prevention of Dirty Reads, Non-Repeatable Reads, and Phantom Reads?',
    options: [
      { id: 'a', text: 'Read Committed' },
      { id: 'b', text: 'Repeatable Read' },
      { id: 'c', text: 'Serializable' },
      { id: 'd', text: 'Read Uncommitted' }
    ],
    correctOptionId: 'c',
    explanation: 'Serializable is the highest isolation level, completely isolating concurrent transactions from race conditions.'
  },
  {
    id: 'sql-q9',
    questionNumber: 9,
    topic: 'Partitioning & Performance',
    difficulty: 'Intermediate',
    stem: 'In analytical querying, what is the main benefit of Table Partitioning?',
    options: [
      { id: 'a', text: 'It enforces primary key uniqueness across tables' },
      { id: 'b', text: 'It enables partition pruning, allowing the query engine to skip scanning irrelevant data segments' },
      { id: 'c', text: 'It automatically compresses string columns into integers' },
      { id: 'd', text: 'It eliminates the need for WHERE clauses' }
    ],
    correctOptionId: 'b',
    explanation: 'Partition pruning drastically curtails I/O by only reading disk segments matching partition key filter values.'
  },
  {
    id: 'sql-q10',
    questionNumber: 10,
    topic: 'Window Frame Specification',
    difficulty: 'Advanced',
    stem: 'In the window specification ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, how many rows are included in the rolling window for calculation?',
    options: [
      { id: 'a', text: 'Up to 2 rows' },
      { id: 'b', text: 'Up to 3 rows (2 preceding plus current)' },
      { id: 'c', text: 'All rows in the partition' },
      { id: 'd', text: 'Only the preceding row' }
    ],
    correctOptionId: 'b',
    explanation: 'The frame encompasses the two rows immediately preceding plus the current row, totaling up to three rows.'
  }
];
