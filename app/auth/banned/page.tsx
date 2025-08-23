import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BannedPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Account Suspended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account has been suspended. If you believe this is an error, please contact support.
            </p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/signout">Sign Out</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
