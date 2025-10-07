// Simple in-memory pub/sub for subscriptions
type Listener = (data: any) => void

class PubSub {
  private listeners: Map<string, Set<Listener>> = new Map()

  subscribe(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener)
    }
  }

  publish(event: string, data: any): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((listener) => listener(data))
    }
  }
}

export const pubsub = new PubSub()

// Event types
export const EVENTS = {
  ASSIGNMENT_UPDATED: "ASSIGNMENT_UPDATED",
  SUBMISSION_CREATED: "SUBMISSION_CREATED",
  SUBMISSION_GRADED: "SUBMISSION_GRADED",
}
