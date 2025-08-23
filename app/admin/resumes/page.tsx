import { requireAdmin } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { FileText, ArrowLeft, Search } from "lucide-react"
import { ResumeActionsDropdown } from "@/components/admin/resume-actions-dropdown"

interface SearchParams {
  search?: string
  page?: string
}

export default async function ResumeManagement({
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

  // Get total count for pagination
  let countQuery = supabase.from("resumes").select("*", { count: "exact", head: true })
  if (search) {
    countQuery = countQuery.or(`title.ilike.%${search}%`)
  }
  const { count: totalResumes } = await countQuery

  // Build query with search and user info - manual join since no FK relationship exists
  let query = supabase
    .from("resumes")
    .select(`
      id, 
      title, 
      created_at, 
      updated_at, 
      is_default,
      template_style,
      user_id
    `)
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%`)
  }

  const { data: resumesData, error: resumesError } = await query.range(offset, offset + limit - 1)

  let resumes = null
  let error = resumesError

  if (resumesData && !resumesError) {
    const userIds = resumesData.map((resume) => resume.user_id).filter(Boolean)

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)

      if (profilesError) {
        error = profilesError
      } else {
        // Merge profiles with resumes
        resumes = resumesData.map((resume) => ({
          ...resume,
          profiles: profiles?.find((profile) => profile.id === resume.user_id) || null,
        }))
      }
    } else {
      resumes = resumesData.map((resume) => ({ ...resume, profiles: null }))
    }
  }

  console.log("[v0] Admin resumes query result:", { resumes, error, totalResumes })
  console.log("[v0] Resumes count:", resumes?.length || 0)

  const totalPages = Math.ceil((totalResumes || 0) / limit)

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
              <h1 className="text-2xl font-bold text-foreground">Resume Management</h1>
              <p className="text-sm text-muted-foreground">Manage user resumes and content</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumes ({totalResumes || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="search" placeholder="Search by title or user..." defaultValue={search} className="pl-10" />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
              {search && (
                <Button asChild variant="outline">
                  <Link href="/admin/resumes">Clear</Link>
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Resumes Table */}
        <Card>
          <CardContent className="p-0">
            {error && (
              <div className="p-6 text-center">
                <div className="text-red-600 font-medium">Error loading resumes</div>
                <div className="text-sm text-muted-foreground mt-1">{error.message}</div>
              </div>
            )}

            {!error && (!resumes || resumes.length === 0) && (
              <div className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg font-medium text-muted-foreground">No resumes found</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {search ? "Try adjusting your search criteria" : "No resumes have been created yet"}
                </div>
              </div>
            )}

            {!error && resumes && resumes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Resume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {resumes?.map((resume, index) => (
                      <tr key={resume.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-card-foreground">{resume.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Template: {resume.template_style || "Default"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-card-foreground">
                              {resume.profiles?.full_name || "No name"}
                            </div>
                            <div className="text-sm text-muted-foreground">{resume.profiles?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {resume.is_default && <Badge variant="secondary">Default</Badge>}
                            <Badge variant="outline">Active</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">
                            <div>{new Date(resume.created_at).toLocaleDateString()}</div>
                            {resume.updated_at !== resume.created_at && (
                              <div className="text-xs">Updated: {new Date(resume.updated_at).toLocaleDateString()}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ResumeActionsDropdown resume={resume} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/resumes?page=${page - 1}${search ? `&search=${search}` : ""}`}>Previous</Link>
                    </Button>
                  )}
                  {page < totalPages && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/resumes?page=${page + 1}${search ? `&search=${search}` : ""}`}>Next</Link>
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
