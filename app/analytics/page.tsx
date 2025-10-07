"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Users, FileText, Clock, Award } from "lucide-react"
import { useQuery, gql } from "@apollo/client"
import { ApolloProvider } from "@apollo/client"
import { createApolloClient } from "@/lib/graphql/client"
import { useState } from "react"

const GET_ANALYTICS_DATA = gql`
  query GetAnalyticsData($teacherId: ID!) {
    assignments(teacherId: $teacherId) {
      id
      title
      status
      dueDate
      maxScore
      course {
        name
        code
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
    courses(teacherId: $teacherId) {
      id
      name
      code
      studentIds
      assignments {
        id
        status
      }
    }
  }
`

const COLORS = [
  "oklch(0.65 0.19 252)",
  "oklch(0.75 0.15 160)",
  "oklch(0.7 0.18 85)",
  "oklch(0.6 0.2 310)",
  "oklch(0.68 0.17 35)",
]

function AnalyticsContent() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("30d")

  const { data, loading } = useQuery(GET_ANALYTICS_DATA, {
    variables: { teacherId: "1" },
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  const assignments = data?.assignments || []
  const courses = data?.courses || []

  // Filter assignments by course
  const filteredAssignments =
    selectedCourse === "all" ? assignments : assignments.filter((a: any) => a.course.code === selectedCourse)

  // Calculate overall metrics
  const totalAssignments = filteredAssignments.length
  const totalStudents = courses.reduce((sum: number, c: any) => sum + c.studentIds.length, 0)
  const totalSubmissions = filteredAssignments.reduce((sum: number, a: any) => sum + a.analytics.totalSubmissions, 0)
  const totalGraded = filteredAssignments.reduce((sum: number, a: any) => sum + a.analytics.gradedSubmissions, 0)
  const avgScore =
    filteredAssignments.reduce((sum: number, a: any) => sum + a.analytics.averageScore, 0) /
    (filteredAssignments.length || 1)

  // Submission status data
  const submissionStatusData = [
    {
      name: "On Time",
      value: filteredAssignments.reduce((sum: number, a: any) => sum + a.analytics.onTimeSubmissions, 0),
    },
    { name: "Late", value: filteredAssignments.reduce((sum: number, a: any) => sum + a.analytics.lateSubmissions, 0) },
    {
      name: "Not Submitted",
      value: filteredAssignments.reduce((sum: number, a: any) => sum + a.analytics.notSubmitted, 0),
    },
  ]

  // Assignment performance data
  const performanceData = filteredAssignments.slice(0, 10).map((a: any) => ({
    name: a.title.length > 20 ? a.title.substring(0, 20) + "..." : a.title,
    score: a.analytics.averageScore,
    submissions: a.analytics.totalSubmissions,
  }))

  // Course comparison data
  const courseData = courses.map((c: any) => {
    const courseAssignments = assignments.filter((a: any) => a.course.code === c.code)
    const avgCourseScore =
      courseAssignments.reduce((sum: number, a: any) => sum + a.analytics.averageScore, 0) /
      (courseAssignments.length || 1)
    return {
      name: c.code,
      score: avgCourseScore,
      assignments: courseAssignments.length,
    }
  })

  // Grading progress data
  const gradingData = filteredAssignments.map((a: any) => ({
    name: a.title.length > 15 ? a.title.substring(0, 15) + "..." : a.title,
    graded: a.analytics.gradedSubmissions,
    pending: a.analytics.totalSubmissions - a.analytics.gradedSubmissions,
  }))

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics & Insights</h1>
              <p className="text-sm text-muted-foreground mt-1">Track performance and monitor student progress</p>
            </div>
            <div className="flex gap-3">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.code}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">{totalAssignments}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-sm text-chart-2">+12%</span>
                  </div>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">{totalStudents}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-sm text-chart-2">+5%</span>
                  </div>
                </div>
                <div className="rounded-lg bg-chart-2/10 p-3">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">
                    {((totalSubmissions / (totalAssignments * totalStudents)) * 100).toFixed(0)}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">-3%</span>
                  </div>
                </div>
                <div className="rounded-lg bg-chart-3/10 p-3">
                  <Clock className="h-6 w-6 text-chart-3" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">{avgScore.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-sm text-chart-2">+8%</span>
                  </div>
                </div>
                <div className="rounded-lg bg-chart-4/10 p-3">
                  <Award className="h-6 w-6 text-chart-4" />
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="grading">Grading</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Assignment Performance</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0 0)" />
                    <XAxis dataKey="name" stroke="oklch(0.55 0 0)" />
                    <YAxis stroke="oklch(0.55 0 0)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0 0)",
                        border: "1px solid oklch(0.24 0 0)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0 0)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="score" fill="oklch(0.65 0.19 252)" name="Average Score (%)" />
                    <Bar dataKey="submissions" fill="oklch(0.75 0.15 160)" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Submission Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={submissionStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {submissionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.16 0 0)",
                          border: "1px solid oklch(0.24 0 0)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0 0)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Submission Breakdown</h3>
                  <div className="space-y-4">
                    {submissionStatusData.map((item, index) => (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-foreground">{item.name}</span>
                          <span className="text-sm font-semibold text-foreground">{item.value}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${(item.value / submissionStatusData.reduce((sum, d) => sum + d.value, 0)) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Course Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0 0)" />
                    <XAxis dataKey="name" stroke="oklch(0.55 0 0)" />
                    <YAxis stroke="oklch(0.55 0 0)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0 0)",
                        border: "1px solid oklch(0.24 0 0)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0 0)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="oklch(0.65 0.19 252)"
                      strokeWidth={2}
                      name="Average Score (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="assignments"
                      stroke="oklch(0.75 0.15 160)"
                      strokeWidth={2}
                      name="Assignments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="grading" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Grading Progress</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={gradingData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0 0)" />
                    <XAxis type="number" stroke="oklch(0.55 0 0)" />
                    <YAxis dataKey="name" type="category" stroke="oklch(0.55 0 0)" width={150} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0 0)",
                        border: "1px solid oklch(0.24 0 0)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0 0)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="graded" stackId="a" fill="oklch(0.75 0.15 160)" name="Graded" />
                    <Bar dataKey="pending" stackId="a" fill="oklch(0.7 0.18 85)" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Top Performing Assignments</h4>
              <div className="space-y-3">
                {filteredAssignments
                  .sort((a: any, b: any) => b.analytics.averageScore - a.analytics.averageScore)
                  .slice(0, 5)
                  .map((assignment: any, index: number) => (
                    <div key={assignment.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-sm text-foreground truncate">{assignment.title}</span>
                      </div>
                      <span className="text-sm font-semibold text-chart-2">
                        {assignment.analytics.averageScore.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Needs Attention</h4>
              <div className="space-y-3">
                {filteredAssignments
                  .filter((a: any) => a.analytics.totalSubmissions - a.analytics.gradedSubmissions > 0)
                  .sort(
                    (a: any, b: any) =>
                      b.analytics.totalSubmissions -
                      b.analytics.gradedSubmissions -
                      (a.analytics.totalSubmissions - a.analytics.gradedSubmissions),
                  )
                  .slice(0, 5)
                  .map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center justify-between">
                      <span className="text-sm text-foreground truncate">{assignment.title}</span>
                      <span className="text-sm font-semibold text-chart-3">
                        {assignment.analytics.totalSubmissions - assignment.analytics.gradedSubmissions} pending
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-chart-2" />
                  <span className="text-foreground">{totalGraded} submissions graded</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-foreground">{totalSubmissions} total submissions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-chart-3" />
                  <span className="text-foreground">{totalSubmissions - totalGraded} pending review</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-chart-4" />
                  <span className="text-foreground">{totalAssignments} active assignments</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AnalyticsPage() {
  const client = createApolloClient()

  return (
    <ApolloProvider client={client}>
      <AnalyticsContent />
    </ApolloProvider>
  )
}
