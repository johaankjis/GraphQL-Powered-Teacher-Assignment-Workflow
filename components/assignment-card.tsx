import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import type { Assignment } from "@/lib/types"

interface AssignmentCardProps {
  assignment: Assignment
  submissionCount?: number
  gradedCount?: number
}

export function AssignmentCard({ assignment, submissionCount = 0, gradedCount = 0 }: AssignmentCardProps) {
  const statusColors = {
    DRAFT: "bg-muted text-muted-foreground",
    PUBLISHED: "bg-primary/20 text-primary",
    GRADING: "bg-chart-3/20 text-chart-3",
    COMPLETED: "bg-chart-2/20 text-chart-2",
    ARCHIVED: "bg-muted text-muted-foreground",
  }

  const dueDate = new Date(assignment.dueDate)
  const isOverdue = dueDate < new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
            <Badge className={statusColors[assignment.status]}>{assignment.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={isOverdue ? "text-destructive" : "text-foreground"}>
            {isOverdue ? "Overdue" : `${daysUntilDue}d left`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{submissionCount} submissions</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{gradedCount} graded</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{assignment.maxScore} points</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="default" size="sm" className="flex-1">
          <Link href={`/assignments/${assignment.id}`}>View Details</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
          <Link href={`/assignments/${assignment.id}/grade`}>Grade</Link>
        </Button>
      </div>
    </Card>
  )
}
