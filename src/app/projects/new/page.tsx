import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ApplicationForm } from "@/components/ApplicationForm"
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
            Your saved name and contact details fill in below. Add the job, then save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm />
        </CardContent>
      </Card>
    </Page>
  )
}
