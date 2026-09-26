import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Page } from "@/components/layout/page"
import { SetupNotice } from "@/components/setup-notice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { listApplications } from "@/lib/data/applications"
import { getSession } from "@/lib/supabase/session"
import { applicationStatusLabel } from "@/types"

export const metadata: Metadata = {
  title: "Dashboard",
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>
}) {
  const session = await getSession()
  if (session.status === "signed_out") {
    redirect("/login")
  }

  const params = await searchParams
  const justCreated = params.created === "1"
  const applications =
    session.status === "signed_in" ? await listApplications(session.user.id) : null

  return (
    <Page
      title="Your applications"
      description="Jobs you've started. Open a new one when you find a role."
      action={
        <Button className="min-h-11" asChild>
          <Link href="/projects/new">New application</Link>
        </Button>
      }
    >
      {session.status === "unconfigured" ? <SetupNotice /> : null}
      {justCreated ? (
        <Alert>
          <AlertTitle>Application saved</AlertTitle>
          <AlertDescription>It's in the list below. You can add another whenever you're ready.</AlertDescription>
        </Alert>
      ) : null}
      {applications?.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load applications</AlertTitle>
          <AlertDescription>{applications.message}</AlertDescription>
        </Alert>
      ) : null}
      {applications?.status === "ok" && applications.applications.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No applications yet</CardTitle>
            <CardDescription>
              When you find a job to apply for, save the title and company here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="min-h-11" asChild>
              <Link href="/projects/new">Start an application</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {session.status === "unconfigured" ? (
        <Card>
          <CardHeader>
            <CardTitle>No applications yet</CardTitle>
            <CardDescription>
              Connect the database, create an account, then save the first job you want to apply for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="min-h-11" asChild>
              <Link href="/signup">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {applications?.status === "ok" && applications.applications.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {applications.applications.map((application) => (
            <li key={application.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{application.title}</CardTitle>
                  <CardDescription>
                    {application.company ? `${application.company} · ` : ""}
                    {formatDate(application.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-3">
                  <Badge variant="secondary">
                    {applicationStatusLabel[application.status]}
                  </Badge>
                  {application.jobUrl ? (
                    <a
                      href={application.jobUrl}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open the job link
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </Page>
  )
}
