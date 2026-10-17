import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCrm } from "@/lib/crm/context";
export function CrmLink({
  module,
  lead,
  children,
  className,
  onClick,
}: {
  module: string;
  lead?: string | undefined;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { mode } = useCrm();
  if (mode === "live")
    return (
      <Link
        to="/workspace/$module"
        params={{ module }}
        search={{ lead }}
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  return (
    <Link
      to={`/app/${module}` as "/app/inbox"}
      search={{ lead }}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
