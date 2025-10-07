"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, FileText, Plus } from "lucide-react"
import { useQuery, gql } from "@apollo/client"
import { ApolloProvider } from "@apollo/client"
import { createApolloClient } from "@/lib/graphql/client"
import Link from "next/link"

const GET_COURSES = gql`
  query GetCourses($teacherId: ID!) {
    courses(teacherId: $teacherId) {
      id
      name
      code
      description
      studentIds
      assignments {
        id
        status
      }
    }
  }
`

function CoursesContent() {
  const { data, loading } = useQuery(GET_COURSES, {
    variables: { teacherId: "1" },
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    )
  }

  const courses = data?.courses || []

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your courses and students</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => {
              const activeAssignments = course.assignments.filter((a: any) => a.status === "PUBLISHED").length

              return (
                <Card key={course.id} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline">{course.code}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{course.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{course.studentIds.length} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{activeAssignments} active</span>
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href={`/courses/${course.id}`}>View Course</Link>
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CoursesPage() {
  const client = createApolloClient()

  return (
    <ApolloProvider client={client}>
      <CoursesContent />
    </ApolloProvider>
  )
}
