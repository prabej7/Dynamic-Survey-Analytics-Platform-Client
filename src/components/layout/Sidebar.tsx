import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ open = true, onClose }: SidebarProps) => {
  const navigation = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/dashboard",
    },
    {
      label: "Surveys",
      icon: FileText,
      to: "/surveys",
    },
    {
      label: "Create Survey",
      icon: Plus,
      to: "/surveys/create",
    },
    {
      label: "Responses",
      icon: BarChart3,
      to: "/responses",
    },
  ];

  const management = [
    {
      label: "Users",
      icon: Users,
      to: "/users",
    },
    {
      label: "Settings",
      icon: Settings,
      to: "/settings",
    },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r bg-background
          transition-transform duration-200
          md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              S
            </div>

            <span className="text-lg font-semibold">SurveyHub</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <SidebarSection
            title="Overview"
            items={navigation}
            onNavigate={onClose}
          />

          <SidebarSection
            title="Management"
            items={management}
            onNavigate={onClose}
          />
        </nav>

        <div className="border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">SurveyHub</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Survey management platform
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

interface SidebarSectionProps {
  title: string;
  items: {
    label: string;
    icon: React.ElementType;
    to: string;
  }[];
  onNavigate?: () => void;
}

const SidebarSection = ({ title, items, onNavigate }: SidebarSectionProps) => {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `
                flex items-center gap-3 rounded-lg
                px-3 py-2.5 text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
                `
              }
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
