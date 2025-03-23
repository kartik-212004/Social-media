"use client";
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