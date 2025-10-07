"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Users, CheckCircle2, Clock, Edit, Trash2 } from "lucide-react"
import { useQuery, gql } from "@apollo/client"
import { ApolloProvider } from "@apollo/client"
import { createApolloClient } from "@/lib/graphql/client"
import Link from "next/link"
import { use } from "react"

const GET_ASSIGNMENT_DETAILS = gql`
  query GetAssignmentDetails($id: ID!) {
    assignment(id: $id) {
      id
      title
      description
      dueDate
      maxScore
      status
      createdAt
      course {
        id
        name
        code
      }
      submissions {
        id
        studentId
        student {
          id
          name
          email
        }
        status
        score
        submittedAt
        gradedAt
      }
      analytics {
        totalSubmissions
        gradedSubmissions
        averageScore
        onTimeSubmissions
        lateSubmissions
        notSubmitted
      }
    }
  }
`

function AssignmentDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading } = useQuery(GET_ASSIGNMENT_DETAILS, {
    variables: { id },
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading assignment...</div>
      </div>
    )
  }

  const assignment = data?.assignment
  if (!assignment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Assignment not found</div>
      </div>
    )
  }

  const statusColors = {
    DRAFT: "bg-muted text-muted-foreground",
    PUBLISHED: "bg-primary/20 text-primary",
    GRADING: "bg-chart-3/20 text-chart-3",
    COMPLETED: "bg-chart-2/20 text-chart-2",
    ARCHIVED: "bg-muted text-muted-foreground",
  }

  const submissionStatusColors = {
    NOT_SUBMITTED: "bg-muted text-muted-foreground",
    SUBMITTED: "bg-chart-3/20 text-chart-3",
    GRADED: "bg-chart-2/20 text-chart-2",
    LATE: "bg-destructive/20 text-destructive",
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/assignments">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">{assignment.title}</h1>
                  <Badge className={statusColors[assignment.status]}>{assignment.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {assignment.course.code} - {assignment.course.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-lg font-semibold text-foreground">{assignment.analytics.totalSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-chart-2/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Graded</p>
                  <p className="text-lg font-semibold text-foreground">{assignment.analytics.gradedSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-chart-3/10 p-3">
                  <Clock className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-lg font-semibold text-foreground">
                    {assignment.analytics.averageScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="submissions">Submissions ({assignment.submissions.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Assignment Description</h3>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{assignment.description}</p>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Maximum Score</p>
                      <p className="text-lg font-semibold text-foreground mt-1">{assignment.maxScore} points</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-lg font-semibold text-foreground mt-1">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <Card className="p-6">
                <div className="space-y-4">
                  {assignment.submissions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No submissions yet</p>
                  ) : (
                    assignment.submissions.map((submission: any) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {submission.student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{submission.student.name}</p>
                            <p className="text-sm text-muted-foreground">{submission.student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge className={submissionStatusColors[submission.status]}>{submission.status}</Badge>
                          {submission.score !== null && (
                            <div className="text-right">
                              <p className="text-lg font-semibold text-foreground">
                                {submission.score}/{assignment.maxScore}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {((submission.score / assignment.maxScore) * 100).toFixed(0)}%
                              </p>
                            </div>
                          )}
                          <Button size="sm" variant="outline">
                            {submission.status === "GRADED" ? "Review" : "Grade"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Submission Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">On Time</span>
                      <span className="text-sm font-semibold text-chart-2">
                        {assignment.analytics.onTimeSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Late</span>
                      <span className="text-sm font-semibold text-destructive">
                        {assignment.analytics.lateSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Not Submitted</span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {assignment.analytics.notSubmitted}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Grading Progress</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Graded</span>
                      <span className="text-sm font-semibold text-chart-2">
                        {assignment.analytics.gradedSubmissions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Pending</span>
                      <span className="text-sm font-semibold text-chart-3">
                        {assignment.analytics.totalSubmissions - assignment.analytics.gradedSubmissions}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 mt-4">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(assignment.analytics.gradedSubmissions / assignment.analytics.totalSubmissions) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Average Score</span>
                      <span className="text-sm font-semibold text-foreground">
                        {assignment.analytics.averageScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Completion Rate</span>
                      <span className="text-sm font-semibold text-foreground">
                        {(
                          (assignment.analytics.totalSubmissions /
                            (assignment.analytics.totalSubmissions + assignment.analytics.notSubmitted)) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const client = createApolloClient()

  return (
    <ApolloProvider client={client}>
      <AssignmentDetailsContent params={params} />
    </ApolloProvider>
  )
}
