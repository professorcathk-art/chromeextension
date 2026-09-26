import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SetupNotice() {
  return (
    <Alert>
      <AlertTitle>Saving is not connected yet</AlertTitle>
      <AlertDescription>
        Your details stay on this screen until the database is connected. After
        that, you can create an account and keep applications here.
      </AlertDescription>
    </Alert>
  )
}
