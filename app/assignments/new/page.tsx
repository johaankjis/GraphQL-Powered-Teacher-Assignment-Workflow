"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Send } from "lucide-react"
import { useMutation, useQuery, gql } from "@apollo/client"
import { ApolloProvider } from "@apollo/client"
import { createApolloClient } from "@/lib/graphql/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const GET_COURSES = gql`
  query GetCourses($teacherId: ID!) {
    courses(teacherId: $teacherId) {
      id
      name
      code
    }
  }
`

const CREATE_ASSIGNMENT = gql`
  mutation CreateAssignment($input: CreateAssignmentInput!) {
    createAssignment(input: $input) {
      id
      title
      status
    }
  }
`

const PUBLISH_ASSIGNMENT = gql`
  mutation PublishAssignment($id: ID!) {
    publishAssignment(id: $id) {
      id
      status
    }
  }
`

function NewAssignmentContent() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: "100",
    courseId: "",
  })

  const { data: coursesData } = useQuery(GET_COURSES, {
    variables: { teacherId: "1" },
  })

  const [createAssignment, { loading: creating }] = useMutation(CREATE_ASSIGNMENT)
  const [publishAssignment] = useMutation(PUBLISH_ASSIGNMENT)

  const handleSubmit = async (publish: boolean) => {
    try {
      const result = await createAssignment({
        variables: {
          input: {
            ...formData,
            maxScore: Number.parseInt(formData.maxScore),
            teacherId: "1",
          },
        },
      })

      if (publish && result.data?.createAssignment?.id) {
        await publishAssignment({
          variables: { id: result.data.createAssignment.id },
        })
      }

      router.push("/assignments")
    } catch (error) {
      console.error("[v0] Error creating assignment:", error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card">
          <div className="flex items-center gap-4 px-8 py-6">
            <Button asChild variant="ghost" size="icon">
              <Link href="/assignments">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Create New Assignment</h1>
              <p className="text-sm text-muted-foreground mt-1">Fill in the details for your new assignment</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-4xl">
          <Card className="p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(false)
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Variables"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed instructions for the assignment..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  >
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesData?.courses?.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore">Maximum Score</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="outline" disabled={creating} className="gap-2 bg-transparent">
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
                <Button type="button" onClick={() => handleSubmit(true)} disabled={creating} className="gap-2">
                  <Send className="h-4 w-4" />
                  Publish Assignment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function NewAssignmentPage() {
  const client = createApolloClient()

  return (
    <ApolloProvider client={client}>
      <NewAssignmentContent />
    </ApolloProvider>
  )
}
