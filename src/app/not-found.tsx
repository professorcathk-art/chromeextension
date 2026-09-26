import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>We can't find that page</CardTitle>
          <CardDescription>The link may be old, or the page may have moved.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="min-h-11" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
