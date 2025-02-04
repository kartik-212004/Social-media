"use client";
import Sidebar from "@/components/left-sidebar";
import { useSession } from "next-auth/react";
import Middlebar from "@/components/middle-bar";
import { Skeleton } from "@/components/ui/skeleton";
import Rightsidebar from "@/components/right-sidebar";

export default function Home() {
  const { status } = useSession();
  return status == "loading" ? (
    <div className="flex justify-center items-center w-screen h-screen">
      {" "}
      <Skeleton className="w-[100px] h-[20px] rounded-full" />
    </div>
  ) : (
    <div className="container mx-auto w-full flex flex-row ">
      <Sidebar />
      <Middlebar />
      <Rightsidebar />
    </div>
  );
}
