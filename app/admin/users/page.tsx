import { requireAdmin } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Users, ArrowLeft, Search } from "lucide-react"
import { UserActionsDropdown } from "@/components/admin/user-actions-dropdown"

interface SearchParams {
  search?: string
  page?: string
}

export default async function UserManagement({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireAdmin()
  const params = await searchParams

  const supabase = await createClient()
  const search = params.search || ""
  const page = Number.parseInt(params.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  // Build query with search
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, created_at, is_admin, is_banned, banned_at, banned_reason")
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: users, error } = await query.range(offset, offset + limit - 1)

  // Get total count for pagination
  let countQuery = supabase.from("profiles").select("*", { count: "exact", head: true })
  if (search) {
    countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  const { count: totalUsers } = await countQuery

  const totalPages = Math.ceil((totalUsers || 0) / limit)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Management</h1>
              <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({totalUsers || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="search" placeholder="Search by name or email..." defaultValue={search} className="pl-10" />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
              {search && (
                <Button asChild variant="outline">
                  <Link href="/admin/users">Clear</Link>
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users?.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-card-foreground">{user.full_name || "No name"}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                          {user.is_banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                        {user.is_banned && user.banned_reason && (
                          <div className="text-xs text-muted-foreground mt-1">Reason: {user.banned_reason}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <UserActionsDropdown user={user} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ""}`}>Previous</Link>
                    </Button>
                  )}
                  {page < totalPages && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ""}`}>Next</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
