"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/left-sidebar";
import BottomNavbar from "@/components/navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/not-found";

  useEffect(() => {
    const originalTitle = document.title;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "Please Cum back! 💦";
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 ${!isAuthPage ? "pb-16 lg:pb-0" : ""}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNavbar />}
    </div>
  );
}
