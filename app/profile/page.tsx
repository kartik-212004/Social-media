"use client";

import { useProfileImage } from "@/hooks/useProfileImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Profile() {
  useEffect(() => {
    refetchImage();
  });

  const { imageUrl: profileImageUrl, refetchImage } = useProfileImage();

  const { data: session } = useSession();
  return (
    <>
      <div className="p-16 dark:border-zinc-800 min-h-screen border-l-2">
        <h1 className="text-3xl pb-8">Profile Dashboard</h1>
        <div>
          <Avatar className="size-52">
            <AvatarImage
              className="object-cover"
              src={profileImageUrl || undefined}
            ></AvatarImage>
            <AvatarFallback>DAWG</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  );
}
