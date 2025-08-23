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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Shield, ShieldOff, Ban, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  full_name: string | null
  email: string
  is_admin: boolean
  is_banned: boolean
  banned_reason: string | null
}

interface UserActionsDropdownProps {
  user: User
}

export function UserActionsDropdown({ user }: UserActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showUnbanDialog, setShowUnbanDialog] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [showDemoteDialog, setShowDemoteDialog] = useState(false)
  const [banReason, setBanReason] = useState("")
  const router = useRouter()

  const handleAction = async (action: string, data?: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      router.refresh()
      setShowBanDialog(false)
      setShowUnbanDialog(false)
      setShowPromoteDialog(false)
      setShowDemoteDialog(false)
      setBanReason("")
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!user.is_admin ? (
            <DropdownMenuItem onClick={() => setShowPromoteDialog(true)}>
              <Shield className="h-4 w-4 mr-2" />
              Promote to Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowDemoteDialog(true)}>
              <ShieldOff className="h-4 w-4 mr-2" />
              Remove Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {!user.is_banned ? (
            <DropdownMenuItem onClick={() => setShowBanDialog(true)} className="text-destructive">
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowUnbanDialog(true)}>
              <UserCheck className="h-4 w-4 mr-2" />
              Unban User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {user.full_name || user.email}? They will be unable to access the
              application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Reason for ban</Label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for banning this user..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction("ban", { reason: banReason })}
              disabled={isLoading}
            >
              {isLoading ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban User Dialog */}
      <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {user.full_name || user.email}? They will regain access to the application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnbanDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={() => handleAction("unban")} disabled={isLoading}>
              {isLoading ? "Unbanning..." : "Unban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote to Admin Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote {user.full_name || user.email} to admin? They will have full access to
              the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoteDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={() => handleAction("promote")} disabled={isLoading}>
              {isLoading ? "Promoting..." : "Promote to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Admin Dialog */}
      <Dialog open={showDemoteDialog} onOpenChange={setShowDemoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin access from {user.full_name || user.email}? They will lose access to
              the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDemoteDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("demote")} disabled={isLoading}>
              {isLoading ? "Removing..." : "Remove Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
