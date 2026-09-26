"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>This page didn't load. You can try again.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="min-h-11" onClick={() => reset()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
