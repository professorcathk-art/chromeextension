import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { NewApplicationForm } from "@/components/applications/new-application-form"
import { Page } from "@/components/layout/page"
import { SetupNotice } from "@/components/setup-notice"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/lib/supabase/session"

export const metadata: Metadata = {
  title: "New application",
}

export default async function NewApplicationPage() {
  const session = await getSession()
  if (session.status === "signed_out") {
    redirect("/login")
  }

  return (
    <Page
      title="New application"
      description="Save the job you want to apply for. Your saved details stay attached to your account."
    >
      {session.status === "unconfigured" ? <SetupNotice /> : null}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Job details</CardTitle>
          <CardDescription>
            Title is required. Company and link can wait if you don't have them yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewApplicationForm />
        </CardContent>
      </Card>
    </Page>
  )
}
