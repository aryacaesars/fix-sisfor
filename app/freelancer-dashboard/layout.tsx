import { Home, Briefcase, LayoutGrid, FileText, Settings, User } from "lucide-react"
import { ReactNode } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export const freelancerNavItems = [
  {
    title: "Home",
    href: "/freelancer-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Kanban Board",
    href: "/freelancer-dashboard/kanban",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/freelancer-dashboard/projects",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Form Templates",
    href: "/freelancer-dashboard/form-templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/freelancer-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Account",
    href: "/freelancer-dashboard/account",
    icon: <User className="h-5 w-5" />,
  },
]

interface FreelancerDashboardLayoutProps {
  children: ReactNode
}

export default function FreelancerDashboardLayout({ children }: FreelancerDashboardLayoutProps) {
  return (
    <DashboardLayout navItems={freelancerNavItems} role="freelancer">
      {children}
    </DashboardLayout>
  )
}