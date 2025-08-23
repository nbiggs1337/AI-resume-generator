"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Eye, Trash2, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Resume {
  id: string
  title: string
  profiles?: {
    id: string
    full_name: string | null
    email: string
  } | null
}

interface ResumeActionsDropdownProps {
  resume: Resume
}

export function ResumeActionsDropdown({ resume }: ResumeActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/resumes/${resume.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete resume")
      }

      router.refresh()
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting resume:", error)
      alert("Failed to delete resume. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="glass-button border-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-white/20">
          <DropdownMenuItem asChild>
            <Link href={`/resume/${resume.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Resume
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/resume/${resume.id}`} target="_blank">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Resume
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{resume.title}"? This action cannot be undone and will permanently remove
              the resume from {resume.profiles?.full_name || resume.profiles?.email}'s account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
              className="glass-button border-white/30"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
