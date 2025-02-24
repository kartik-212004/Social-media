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
      <div className="p-7">
       
        <div className="w-2/3 flex flex-row justify-center">
          <Avatar className="size-52">
            <AvatarImage
              className="object-cover"
              src={profileImageUrl || undefined}
            ></AvatarImage>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  );
}
