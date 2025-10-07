// Core domain types for the assignment management system

export enum AssignmentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  GRADING = "GRADING",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum SubmissionStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  LATE = "LATE",
}

export enum UserRole {
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date
  maxScore: number
  status: AssignmentStatus
  teacherId: string
  courseId: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  content: string
  attachments?: string[]
  status: SubmissionStatus
  score?: number
  feedback?: string
  submittedAt?: Date
  gradedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  name: string
  code: string
  description: string
  teacherId: string
  studentIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Grade {
  id: string
  submissionId: string
  score: number
  maxScore: number
  feedback: string
  gradedBy: string
  gradedAt: Date
}

export interface Analytics {
  assignmentId: string
  totalSubmissions: number
  gradedSubmissions: number
  averageScore: number
  onTimeSubmissions: number
  lateSubmissions: number
  notSubmitted: number
}
