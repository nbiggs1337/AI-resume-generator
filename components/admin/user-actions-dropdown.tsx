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
import { MoreHorizontal, Shield, ShieldOff, Ban, UserCheck, Crown, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  full_name: string | null
  email: string
  is_admin: boolean
  is_banned: boolean
  banned_reason: string | null
  account_type?: "limited" | "full"
  resume_limit?: number
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
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)
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
      setShowUpgradeDialog(false)
      setShowDowngradeDialog(false)
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
          <Button variant="ghost" size="sm" className="glass-button border-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-white/20">
          {user.account_type === "limited" ? (
            <DropdownMenuItem onClick={() => setShowUpgradeDialog(true)}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Full Access
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowDowngradeDialog(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Downgrade to Limited
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
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

      {/* Upgrade to Full Access Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade to Full Access
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade {user.full_name || user.email} to full access? They will be able to
              create unlimited resumes.
            </DialogDescription>
          </DialogHeader>
          <div className="glass-card p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Full Access Benefits:</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Unlimited resume creation</li>
                  <li>• Access to premium features</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              disabled={isLoading}
              className="glass-button border-white/30"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("upgrade_account")}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Upgrading..." : "Upgrade Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade to Limited Dialog */}
      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Downgrade to Limited Access
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to downgrade {user.full_name || user.email} to limited access? They will be
              restricted to {user.resume_limit || 10} resumes.
            </DialogDescription>
          </DialogHeader>
          <div className="glass-card p-4 bg-muted/20 border-muted/30">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Limited Access Restrictions:</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Maximum {user.resume_limit || 10} resumes</li>
                  <li>• Basic templates only</li>
                  <li>• Standard support</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDowngradeDialog(false)}
              disabled={isLoading}
              className="glass-button border-white/30"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction("downgrade_account")} disabled={isLoading}>
              {isLoading ? "Downgrading..." : "Downgrade Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Ban User</DialogTitle>
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
                className="mt-1 glass border-white/30 bg-white/60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBanDialog(false)}
              disabled={isLoading}
              className="glass-button border-white/30"
            >
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
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {user.full_name || user.email}? They will regain access to the application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnbanDialog(false)}
              disabled={isLoading}
              className="glass-button border-white/30"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("unban")}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Unbanning..." : "Unban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote to Admin Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Promote to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote {user.full_name || user.email} to admin? They will have full access to
              the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPromoteDialog(false)}
              disabled={isLoading}
              className="glass-button border-white/30"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("promote")}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Promoting..." : "Promote to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Admin Dialog */}
      <Dialog open={showDemoteDialog} onOpenChange={setShowDemoteDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Remove Admin Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin access from {user.full_name || user.email}? They will lose access to
              the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDemoteDialog(false)}
              disabled={isLoading}
              className="glass-button border-white/30"
            >
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
