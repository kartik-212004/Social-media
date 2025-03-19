"use client";
import { useSession } from "next-auth/react";
import Middlebar from "@/components/middle-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Rightsidebar from "@/components/right-sidebar";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  useEffect(() => {
    if (status == "unauthenticated") {
      router.push("/signin");
    }
  });
  return status == "loading" ? (
    <div className="flex justify-center items-center w-screen h-screen">
      {" "}
      <Skeleton className="w-[100px] h-[20px] rounded-full" />
    </div>
  ) : (
    <div className="container mx-auto w-full flex flex-row ">
      <Middlebar />
      <Rightsidebar />
    </div>
  );
}
