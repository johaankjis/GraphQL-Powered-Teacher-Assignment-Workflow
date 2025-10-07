import {
  db,
  getUser,
  getAssignment,
  getSubmission,
  getCourse,
  getSubmissionsByAssignment,
  getCoursesByTeacher,
} from "../db"
import { type Assignment, type Submission, type Course, AssignmentStatus, SubmissionStatus } from "../types"
import { pubsub, EVENTS } from "./pubsub"

export const resolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }) => getUser(id),
    users: (_: unknown, { role }: { role?: string }) => {
      const users = Array.from(db.users.values())
      return role ? users.filter((u) => u.role === role) : users
    },

    assignment: (_: unknown, { id }: { id: string }) => getAssignment(id),
    assignments: (
      _: unknown,
      { teacherId, courseId, status }: { teacherId?: string; courseId?: string; status?: AssignmentStatus },
    ) => {
      let assignments = Array.from(db.assignments.values())
      if (teacherId) assignments = assignments.filter((a) => a.teacherId === teacherId)
      if (courseId) assignments = assignments.filter((a) => a.courseId === courseId)
      if (status) assignments = assignments.filter((a) => a.status === status)
      return assignments
    },

    submission: (_: unknown, { id }: { id: string }) => getSubmission(id),
    submissions: (
      _: unknown,
      { assignmentId, studentId, status }: { assignmentId?: string; studentId?: string; status?: SubmissionStatus },
    ) => {
      let submissions = Array.from(db.submissions.values())
      if (assignmentId) submissions = submissions.filter((s) => s.assignmentId === assignmentId)
      if (studentId) submissions = submissions.filter((s) => s.studentId === studentId)
      if (status) submissions = submissions.filter((s) => s.status === status)
      return submissions
    },

    course: (_: unknown, { id }: { id: string }) => getCourse(id),
    courses: (_: unknown, { teacherId }: { teacherId?: string }) => {
      return teacherId ? getCoursesByTeacher(teacherId) : Array.from(db.courses.values())
    },

    assignmentAnalytics: (_: unknown, { assignmentId }: { assignmentId: string }) => {
      const assignment = getAssignment(assignmentId)
      if (!assignment) return null

      const submissions = getSubmissionsByAssignment(assignmentId)
      const course = getCourse(assignment.courseId)
      const totalStudents = course?.studentIds.length || 0

      const gradedSubmissions = submissions.filter((s) => s.status === SubmissionStatus.GRADED)
      const onTimeSubmissions = submissions.filter(
        (s) => s.submittedAt && new Date(s.submittedAt) <= new Date(assignment.dueDate),
      )
      const lateSubmissions = submissions.filter(
        (s) => s.submittedAt && new Date(s.submittedAt) > new Date(assignment.dueDate),
      )

      const averageScore =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
          : 0

      return {
        assignmentId,
        totalSubmissions: submissions.length,
        gradedSubmissions: gradedSubmissions.length,
        averageScore,
        onTimeSubmissions: onTimeSubmissions.length,
        lateSubmissions: lateSubmissions.length,
        notSubmitted: totalStudents - submissions.length,
      }
    },
  },

  Mutation: {
    createAssignment: (_: unknown, { input }: { input: any }) => {
      const id = `assignment-${Date.now()}`
      const assignment: Assignment = {
        id,
        ...input,
        status: AssignmentStatus.DRAFT,
        dueDate: new Date(input.dueDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      db.assignments.set(id, assignment)

      pubsub.publish(EVENTS.ASSIGNMENT_UPDATED, { assignmentUpdated: assignment })

      return assignment
    },

    updateAssignment: (_: unknown, { id, input }: { id: string; input: any }) => {
      const assignment = getAssignment(id)
      if (!assignment) throw new Error("Assignment not found")

      const updated = {
        ...assignment,
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : assignment.dueDate,
        updatedAt: new Date(),
      }
      db.assignments.set(id, updated)

      pubsub.publish(EVENTS.ASSIGNMENT_UPDATED, { assignmentUpdated: updated })

      return updated
    },

    deleteAssignment: (_: unknown, { id }: { id: string }) => {
      const deleted = db.assignments.delete(id)
      const submissions = getSubmissionsByAssignment(id)
      submissions.forEach((s) => db.submissions.delete(s.id))
      return deleted
    },

    publishAssignment: (_: unknown, { id }: { id: string }) => {
      const assignment = getAssignment(id)
      if (!assignment) throw new Error("Assignment not found")

      const updated = {
        ...assignment,
        status: AssignmentStatus.PUBLISHED,
        updatedAt: new Date(),
      }
      db.assignments.set(id, updated)

      pubsub.publish(EVENTS.ASSIGNMENT_UPDATED, { assignmentUpdated: updated })

      return updated
    },

    createSubmission: (_: unknown, { input }: { input: any }) => {
      const id = `submission-${Date.now()}`
      const submission: Submission = {
        id,
        ...input,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      db.submissions.set(id, submission)

      pubsub.publish(EVENTS.SUBMISSION_CREATED, { submissionCreated: submission })

      return submission
    },

    updateSubmission: (_: unknown, { id, input }: { id: string; input: any }) => {
      const submission = getSubmission(id)
      if (!submission) throw new Error("Submission not found")

      const updated = {
        ...submission,
        ...input,
        updatedAt: new Date(),
      }
      db.submissions.set(id, updated)
      return updated
    },

    gradeSubmission: (_: unknown, { id, score, feedback }: { id: string; score: number; feedback?: string }) => {
      const submission = getSubmission(id)
      if (!submission) throw new Error("Submission not found")

      const updated = {
        ...submission,
        score,
        feedback,
        status: SubmissionStatus.GRADED,
        gradedAt: new Date(),
        updatedAt: new Date(),
      }
      db.submissions.set(id, updated)

      pubsub.publish(EVENTS.SUBMISSION_GRADED, { submissionGraded: updated })

      return updated
    },

    createCourse: (_: unknown, { input }: { input: any }) => {
      const id = `course-${Date.now()}`
      const course: Course = {
        id,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      db.courses.set(id, course)
      return course
    },

    updateCourse: (_: unknown, { id, input }: { id: string; input: any }) => {
      const course = getCourse(id)
      if (!course) throw new Error("Course not found")

      const updated = {
        ...course,
        ...input,
        updatedAt: new Date(),
      }
      db.courses.set(id, updated)
      return updated
    },
  },

  Subscription: {
    assignmentUpdated: {
      subscribe: (_: unknown, { teacherId }: { teacherId: string }) => {
        return {
          [Symbol.asyncIterator]: async function* () {
            const queue: any[] = []
            let resolve: ((value: any) => void) | null = null

            const unsubscribe = pubsub.subscribe(EVENTS.ASSIGNMENT_UPDATED, (data) => {
              const assignment = data.assignmentUpdated
              if (assignment.teacherId === teacherId) {
                if (resolve) {
                  resolve({ value: data, done: false })
                  resolve = null
                } else {
                  queue.push(data)
                }
              }
            })

            try {
              while (true) {
                if (queue.length > 0) {
                  yield queue.shift()
                } else {
                  await new Promise((r) => {
                    resolve = r
                  })
                }
              }
            } finally {
              unsubscribe()
            }
          },
        }
      },
    },
    submissionCreated: {
      subscribe: (_: unknown, { assignmentId }: { assignmentId: string }) => {
        return {
          [Symbol.asyncIterator]: async function* () {
            const queue: any[] = []
            let resolve: ((value: any) => void) | null = null

            const unsubscribe = pubsub.subscribe(EVENTS.SUBMISSION_CREATED, (data) => {
              const submission = data.submissionCreated
              if (submission.assignmentId === assignmentId) {
                if (resolve) {
                  resolve({ value: data, done: false })
                  resolve = null
                } else {
                  queue.push(data)
                }
              }
            })

            try {
              while (true) {
                if (queue.length > 0) {
                  yield queue.shift()
                } else {
                  await new Promise((r) => {
                    resolve = r
                  })
                }
              }
            } finally {
              unsubscribe()
            }
          },
        }
      },
    },
    submissionGraded: {
      subscribe: (_: unknown, { studentId }: { studentId: string }) => {
        return {
          [Symbol.asyncIterator]: async function* () {
            const queue: any[] = []
            let resolve: ((value: any) => void) | null = null

            const unsubscribe = pubsub.subscribe(EVENTS.SUBMISSION_GRADED, (data) => {
              const submission = data.submissionGraded
              if (submission.studentId === studentId) {
                if (resolve) {
                  resolve({ value: data, done: false })
                  resolve = null
                } else {
                  queue.push(data)
                }
              }
            })

            try {
              while (true) {
                if (queue.length > 0) {
                  yield queue.shift()
                } else {
                  await new Promise((r) => {
                    resolve = r
                  })
                }
              }
            } finally {
              unsubscribe()
            }
          },
        }
      },
    },
  },

  // Field resolvers
  Assignment: {
    teacher: (parent: Assignment) => getUser(parent.teacherId),
    course: (parent: Assignment) => getCourse(parent.courseId),
    submissions: (parent: Assignment) => getSubmissionsByAssignment(parent.id),
    analytics: (parent: Assignment) => {
      return resolvers.Query.assignmentAnalytics(null, { assignmentId: parent.id })
    },
  },

  Submission: {
    assignment: (parent: Submission) => getAssignment(parent.assignmentId),
    student: (parent: Submission) => getUser(parent.studentId),
  },

  Course: {
    teacher: (parent: Course) => getUser(parent.teacherId),
    students: (parent: Course) => parent.studentIds.map((id) => getUser(id)).filter(Boolean),
    assignments: (parent: Course) => Array.from(db.assignments.values()).filter((a) => a.courseId === parent.id),
  },
}
