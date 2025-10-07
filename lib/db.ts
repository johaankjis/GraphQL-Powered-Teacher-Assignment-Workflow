// In-memory database simulation
import {
  type User,
  type Assignment,
  type Submission,
  type Course,
  AssignmentStatus,
  SubmissionStatus,
  UserRole,
} from "./types"

// Mock data store
export const db = {
  users: new Map<string, User>(),
  assignments: new Map<string, Assignment>(),
  submissions: new Map<string, Submission>(),
  courses: new Map<string, Course>(),
}

// Seed initial data
function seedData() {
  // Create teachers
  const teacher1: User = {
    id: "1",
    email: "john.doe@school.edu",
    name: "John Doe",
    role: UserRole.TEACHER,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }

  const teacher2: User = {
    id: "2",
    email: "jane.smith@school.edu",
    name: "Jane Smith",
    role: UserRole.TEACHER,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }

  // Create students
  const students: User[] = Array.from({ length: 20 }, (_, i) => ({
    id: `student-${i + 1}`,
    email: `student${i + 1}@school.edu`,
    name: `Student ${i + 1}`,
    role: UserRole.STUDENT,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }))

  db.users.set(teacher1.id, teacher1)
  db.users.set(teacher2.id, teacher2)
  students.forEach((student) => db.users.set(student.id, student))

  // Create courses
  const course1: Course = {
    id: "course-1",
    name: "Introduction to Computer Science",
    code: "CS101",
    description: "Learn the fundamentals of programming and computer science",
    teacherId: teacher1.id,
    studentIds: students.slice(0, 10).map((s) => s.id),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }

  const course2: Course = {
    id: "course-2",
    name: "Web Development",
    code: "CS201",
    description: "Build modern web applications with React and Node.js",
    teacherId: teacher1.id,
    studentIds: students.slice(10, 20).map((s) => s.id),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }

  db.courses.set(course1.id, course1)
  db.courses.set(course2.id, course2)

  // Create assignments
  const assignment1: Assignment = {
    id: "assignment-1",
    title: "Variables and Data Types",
    description: "Complete exercises on variables, data types, and basic operations",
    dueDate: new Date("2024-12-20"),
    maxScore: 100,
    status: AssignmentStatus.PUBLISHED,
    teacherId: teacher1.id,
    courseId: course1.id,
    attachments: [],
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
  }

  const assignment2: Assignment = {
    id: "assignment-2",
    title: "Build a Todo App",
    description: "Create a full-stack todo application with CRUD operations",
    dueDate: new Date("2024-12-25"),
    maxScore: 150,
    status: AssignmentStatus.PUBLISHED,
    teacherId: teacher1.id,
    courseId: course2.id,
    attachments: [],
    createdAt: new Date("2024-12-05"),
    updatedAt: new Date("2024-12-05"),
  }

  const assignment3: Assignment = {
    id: "assignment-3",
    title: "Loops and Functions",
    description: "Practice writing loops and functions to solve problems",
    dueDate: new Date("2024-12-30"),
    maxScore: 100,
    status: AssignmentStatus.DRAFT,
    teacherId: teacher1.id,
    courseId: course1.id,
    attachments: [],
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-10"),
  }

  db.assignments.set(assignment1.id, assignment1)
  db.assignments.set(assignment2.id, assignment2)
  db.assignments.set(assignment3.id, assignment3)

  // Create submissions for assignment 1
  course1.studentIds.slice(0, 7).forEach((studentId, index) => {
    const submission: Submission = {
      id: `submission-${assignment1.id}-${studentId}`,
      assignmentId: assignment1.id,
      studentId,
      content: `This is my submission for ${assignment1.title}`,
      attachments: [],
      status: index < 4 ? SubmissionStatus.GRADED : SubmissionStatus.SUBMITTED,
      score: index < 4 ? 70 + index * 10 : undefined,
      feedback: index < 4 ? "Good work! Keep it up." : undefined,
      submittedAt: new Date("2024-12-18"),
      gradedAt: index < 4 ? new Date("2024-12-19") : undefined,
      createdAt: new Date("2024-12-18"),
      updatedAt: new Date("2024-12-19"),
    }
    db.submissions.set(submission.id, submission)
  })

  // Create submissions for assignment 2
  course2.studentIds.slice(0, 5).forEach((studentId, index) => {
    const submission: Submission = {
      id: `submission-${assignment2.id}-${studentId}`,
      assignmentId: assignment2.id,
      studentId,
      content: `Here is my todo app implementation`,
      attachments: [],
      status: index < 2 ? SubmissionStatus.GRADED : SubmissionStatus.SUBMITTED,
      score: index < 2 ? 120 + index * 15 : undefined,
      feedback: index < 2 ? "Excellent implementation!" : undefined,
      submittedAt: new Date("2024-12-23"),
      gradedAt: index < 2 ? new Date("2024-12-24") : undefined,
      createdAt: new Date("2024-12-23"),
      updatedAt: new Date("2024-12-24"),
    }
    db.submissions.set(submission.id, submission)
  })
}

// Initialize data
seedData()

// Helper functions for data access
export const getUser = (id: string) => db.users.get(id)
export const getAssignment = (id: string) => db.assignments.get(id)
export const getSubmission = (id: string) => db.submissions.get(id)
export const getCourse = (id: string) => db.courses.get(id)

export const getAssignmentsByTeacher = (teacherId: string) =>
  Array.from(db.assignments.values()).filter((a) => a.teacherId === teacherId)

export const getSubmissionsByAssignment = (assignmentId: string) =>
  Array.from(db.submissions.values()).filter((s) => s.assignmentId === assignmentId)

export const getCoursesByTeacher = (teacherId: string) =>
  Array.from(db.courses.values()).filter((c) => c.teacherId === teacherId)
