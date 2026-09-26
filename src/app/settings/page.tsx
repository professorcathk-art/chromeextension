import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Page } from "@/components/layout/page"
import { SetupNotice } from "@/components/setup-notice"
import { ProfileForm } from "@/components/settings/profile-form"
import { SubmitButton } from "@/components/submit-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { signOut } from "@/lib/actions/auth"
import { getProfile } from "@/lib/data/profile"
import { getSession } from "@/lib/supabase/session"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const session = await getSession()
  if (session.status === "signed_out") {
    redirect("/login")
  }

  const profileResult =
    session.status === "signed_in" ? await getProfile(session.user.id) : null
  const profile = profileResult?.status === "ok" ? profileResult.profile : null
  const email = session.status === "signed_in" ? session.user.email : ""

  return (
    <Page
      title="Settings"
      description="These details are what ApplyFill can reuse on a job application."
    >
      {session.status === "unconfigured" ? <SetupNotice /> : null}
      {profileResult?.status === "error" ? (
        <Card>
          <CardHeader>
            <CardTitle>Couldn't load your details</CardTitle>
            <CardDescription>{profileResult.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            {profile
              ? "Update anything that should appear on the next application."
              : "Add the details you don't want to type again."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={profile?.email || email}
            fullName={profile?.fullName ?? ""}
            phone={profile?.phone ?? ""}
            location={profile?.location ?? ""}
            headline={profile?.headline ?? ""}
          />
        </CardContent>
      </Card>
      {session.status === "signed_in" ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Sign out on this device when you're done.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Separator />
            <form action={signOut}>
              <SubmitButton variant="outline" pendingLabel="Signing out...">
                Sign out
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </Page>
  )
}
