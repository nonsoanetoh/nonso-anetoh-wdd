"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // Skip on first render
    if (prevPathnameRef.current === pathname) return;

    // Start view transition if supported
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        prevPathnameRef.current = pathname;
      });
    } else {
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  return <div className="page-content-wrapper">{children}</div>;
};

export default PageTransition;
