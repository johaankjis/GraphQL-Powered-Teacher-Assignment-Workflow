"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { StatCard } from "@/components/stat-card"
import { AssignmentCard } from "@/components/assignment-card"
import { RealTimeIndicator } from "@/components/real-time-indicator"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, CheckCircle2, Plus, TrendingUp } from "lucide-react"
import { useQuery, gql } from "@apollo/client"
import { ApolloProvider } from "@apollo/client"
import { createApolloClient } from "@/lib/graphql/client"
import type { Assignment } from "@/lib/types"

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    assignments(teacherId: "1", status: PUBLISHED) {
      id
      title
      description
      dueDate
      maxScore
      status
      teacherId
      courseId
      createdAt
      updatedAt
      submissions {
        id
        status
      }
      analytics {
        totalSubmissions
        gradedSubmissions
        averageScore
      }
    }
  }
`

function DashboardContent() {
  const { data, loading } = useQuery(GET_DASHBOARD_DATA)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const assignments: Assignment[] = data?.assignments || []
  const totalAssignments = assignments.length
  const totalSubmissions = assignments.reduce((sum, a: any) => sum + (a.analytics?.totalSubmissions || 0), 0)
  const totalGraded = assignments.reduce((sum, a: any) => sum + (a.analytics?.gradedSubmissions || 0), 0)
  const avgScore =
    assignments.reduce((sum, a: any) => sum + (a.analytics?.averageScore || 0), 0) / (assignments.length || 1)

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">Dashboard Overview</h1>
                <RealTimeIndicator />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, John. Here's what's happening with your classes.
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Assignment
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Assignments"
              value={totalAssignments}
              description="Currently published"
              icon={FileText}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Total Submissions"
              value={totalSubmissions}
              description="Across all assignments"
              icon={Users}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Graded"
              value={totalGraded}
              description={`${totalSubmissions - totalGraded} pending`}
              icon={CheckCircle2}
            />
            <StatCard
              title="Average Score"
              value={`${avgScore.toFixed(1)}%`}
              description="Class performance"
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Recent Assignments</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage and track your active assignments</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignments.slice(0, 4).map((assignment: any) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  submissionCount={assignment.analytics?.totalSubmissions || 0}
                  gradedCount={assignment.analytics?.gradedSubmissions || 0}
                />
              ))}
            </div>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground mt-1">Common tasks and shortcuts</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start h-auto py-4 bg-transparent">
                <div className="text-left">
                  <div className="font-medium">Create Assignment</div>
                  <div className="text-xs text-muted-foreground mt-1">Start a new assignment for your students</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 bg-transparent">
                <div className="text-left">
                  <div className="font-medium">Grade Submissions</div>
                  <div className="text-xs text-muted-foreground mt-1">Review and grade pending work</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 bg-transparent">
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground mt-1">Check class performance metrics</div>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const client = createApolloClient()

  return (
    <ApolloProvider client={client}>
      <DashboardContent />
    </ApolloProvider>
  )
}
