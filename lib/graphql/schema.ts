// GraphQL schema definition
export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  enum UserRole {
    TEACHER
    STUDENT
    ADMIN
  }

  type Assignment {
    id: ID!
    title: String!
    description: String!
    dueDate: String!
    maxScore: Int!
    status: AssignmentStatus!
    teacherId: ID!
    teacher: User
    courseId: ID!
    course: Course
    attachments: [String!]
    submissions: [Submission!]
    analytics: Analytics
    createdAt: String!
    updatedAt: String!
  }

  enum AssignmentStatus {
    DRAFT
    PUBLISHED
    GRADING
    COMPLETED
    ARCHIVED
  }

  type Submission {
    id: ID!
    assignmentId: ID!
    assignment: Assignment
    studentId: ID!
    student: User
    content: String!
    attachments: [String!]
    status: SubmissionStatus!
    score: Int
    feedback: String
    submittedAt: String
    gradedAt: String
    createdAt: String!
    updatedAt: String!
  }

  enum SubmissionStatus {
    NOT_SUBMITTED
    SUBMITTED
    GRADED
    LATE
  }

  type Course {
    id: ID!
    name: String!
    code: String!
    description: String!
    teacherId: ID!
    teacher: User
    studentIds: [ID!]!
    students: [User!]
    assignments: [Assignment!]
    createdAt: String!
    updatedAt: String!
  }

  type Analytics {
    assignmentId: ID!
    totalSubmissions: Int!
    gradedSubmissions: Int!
    averageScore: Float!
    onTimeSubmissions: Int!
    lateSubmissions: Int!
    notSubmitted: Int!
  }

  type Query {
    # User queries
    user(id: ID!): User
    users(role: UserRole): [User!]!
    
    # Assignment queries
    assignment(id: ID!): Assignment
    assignments(teacherId: ID, courseId: ID, status: AssignmentStatus): [Assignment!]!
    
    # Submission queries
    submission(id: ID!): Submission
    submissions(assignmentId: ID, studentId: ID, status: SubmissionStatus): [Submission!]!
    
    # Course queries
    course(id: ID!): Course
    courses(teacherId: ID): [Course!]!
    
    # Analytics
    assignmentAnalytics(assignmentId: ID!): Analytics
  }

  type Mutation {
    # Assignment mutations
    createAssignment(input: CreateAssignmentInput!): Assignment!
    updateAssignment(id: ID!, input: UpdateAssignmentInput!): Assignment!
    deleteAssignment(id: ID!): Boolean!
    publishAssignment(id: ID!): Assignment!
    
    # Submission mutations
    createSubmission(input: CreateSubmissionInput!): Submission!
    updateSubmission(id: ID!, input: UpdateSubmissionInput!): Submission!
    gradeSubmission(id: ID!, score: Int!, feedback: String): Submission!
    
    # Course mutations
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
  }

  input CreateAssignmentInput {
    title: String!
    description: String!
    dueDate: String!
    maxScore: Int!
    teacherId: ID!
    courseId: ID!
    attachments: [String!]
  }

  input UpdateAssignmentInput {
    title: String
    description: String
    dueDate: String
    maxScore: Int
    status: AssignmentStatus
    attachments: [String!]
  }

  input CreateSubmissionInput {
    assignmentId: ID!
    studentId: ID!
    content: String!
    attachments: [String!]
  }

  input UpdateSubmissionInput {
    content: String
    attachments: [String!]
  }

  input CreateCourseInput {
    name: String!
    code: String!
    description: String!
    teacherId: ID!
    studentIds: [ID!]!
  }

  input UpdateCourseInput {
    name: String
    code: String
    description: String
    studentIds: [ID!]
  }

  type Subscription {
    assignmentUpdated(teacherId: ID!): Assignment!
    submissionCreated(assignmentId: ID!): Submission!
    submissionGraded(studentId: ID!): Submission!
  }
`
