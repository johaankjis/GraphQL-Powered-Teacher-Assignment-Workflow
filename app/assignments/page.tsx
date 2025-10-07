"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AssignmentCard } from "@/components/assignment-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { useQuery, gql } from "@apollo/client"
import { ApolloProvider } from "@apollo/client"
import { createApolloClient } from "@/lib/graphql/client"
import Link from "next/link"
import { useState } from "react"
import type { Assignment } from "@/lib/types"

const GET_ASSIGNMENTS = gql`
  query GetAssignments($teacherId: ID!, $status: AssignmentStatus) {
    assignments(teacherId: $teacherId, status: $status) {
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

function AssignmentsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")

  const { data, loading } = useQuery(GET_ASSIGNMENTS, {
    variables: {
      teacherId: "1",
      status: activeTab === "all" ? undefined : activeTab.toUpperCase(),
    },
  })

  const assignments: Assignment[] = data?.assignments || []
  const filteredAssignments = assignments.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Assignments</h1>
              <p className="text-sm text-muted-foreground mt-1">Create and manage your course assignments</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/assignments/new">
                <Plus className="h-4 w-4" />
                New Assignment
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="grading">Grading</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading assignments...</div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No assignments found</p>
                  <Button asChild className="mt-4 bg-transparent" variant="outline">
                    <Link href="/assignments/new">Create your first assignment</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredAssignments.map((assignment: any) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submissionCount={assignment.analytics?.totalSubmissions || 0}
                      gradedCount={assignment.analytics?.gradedSubmissions || 0}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function AssignmentsPage() {
  const client = createApolloClient()

  return (
    <ApolloProvider client={client}>
      <AssignmentsContent />
    </ApolloProvider>
  )
}
