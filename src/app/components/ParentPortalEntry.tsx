import React, { useMemo } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { createParentPortalToken } from "../lib/parentPortal";

export const ParentPortalEntry: React.FC = () => {
  const { currentUser } = useAuth();

  const parentPortalPath = useMemo(() => {
    if (!currentUser) {
      return "";
    }

    const token = createParentPortalToken(currentUser);
    return `/parent?token=${encodeURIComponent(token)}`;
  }, [currentUser]);

  if (!currentUser || !parentPortalPath) {
    return null;
  }

  return (
    <Link
      to={parentPortalPath}
      className="inline-flex cursor-pointer rounded-full bg-white/72 px-4 py-2 text-sm font-bold text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/88 hover:text-slate-700"
    >
      家长端
    </Link>
  );
};
