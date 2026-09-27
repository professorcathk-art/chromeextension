import Link from "next/link"
import { ApplicationForm } from "@/components/ApplicationForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const steps = [
  {
    title: "Save your details once",
    description: "Name, phone, location, and a short summary live in one place.",
    href: "/settings",
    action: "Add your details",
  },
  {
    title: "Start each application",
    description: "Add the job title, company, and link when you find a role.",
    href: "/projects/new",
    action: "Start an application",
  },
  {
    title: "See what you've started",
    description: "Come back to the dashboard to pick up an application later.",
    href: "/dashboard",
    action: "Open your dashboard",
  },
]

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-hidden">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 md:py-24">
        <Badge variant="secondary" className="w-fit">
          For job applicants
        </Badge>
        <div className="flex max-w-2xl flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Fill job applications without typing the same answers again.
          </h1>
          <p className="text-lg text-muted-foreground">
            Save your details once. ApplyFill keeps them ready for the next
            application you start.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="min-h-11" asChild>
            <Link href="/signup">Create account</Link>
          </Button>
          <Button variant="outline" className="min-h-11" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-4 pb-10">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Start an application</CardTitle>
            <CardDescription>
              Your saved details fill the answers. Add the job, then save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationForm />
          </CardContent>
        </Card>
      </section>
      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-4 pb-20 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="min-h-11 px-0" asChild>
                <Link href={step.href}>{step.action}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
