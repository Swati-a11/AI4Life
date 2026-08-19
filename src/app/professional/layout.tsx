"use client";

import { usePathname } from "next/navigation";
import { ProfessionalShell } from "@/components/professional/ProfessionalShell";
import { ProfessionalTab } from "@/lib/types/professional-types";

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let activeTab: ProfessionalTab = "dashboard";
  if (pathname.includes("/copilot")) activeTab = "copilot";
  else if (pathname.includes("/documents")) activeTab = "documents";
  else if (pathname.includes("/meetings")) activeTab = "meetings";
  else if (pathname.includes("/tasks")) activeTab = "tasks";
  else if (pathname.includes("/research")) activeTab = "research";
  else if (pathname.includes("/insights")) activeTab = "insights";
  else if (pathname.includes("/memory")) activeTab = "memory";

  return (
    <ProfessionalShell currentTab={activeTab}>
      {children}
    </ProfessionalShell>
  );
}
