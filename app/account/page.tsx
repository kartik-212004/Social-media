"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import Particles from "@/components/ui/Particles";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Pen, Camera, CheckCheckIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useProfileImage } from "@/hooks/useProfileImage";
import useFetchUserPassword from "@/hooks/check-password";

export default function Account() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [username, setUsername] = useState(session?.user?.name || "user");
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { imageUrl: profileImageUrl, refetchImage } = useProfileImage();
  const hasPassword = useFetchUserPassword();

  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
  }, [session?.user?.name]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !session?.user?.email) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", session.user.email);

        await axios.post("/api/s3/post", formData);
        await refetchImage();
        toast({ title: "Image uploaded successfully" });
      } catch (error) {
        console.error("Upload error:", error);
        toast({ title: "Upload failed", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    },
    [session, refetchImage, toast]
  );

  const removeImage = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      await axios.delete(`/api/s3/delete/?email=${session.user.email}`);
      await refetchImage();
      toast({ title: "Image removed successfully" });
    } catch (error) {
      console.error("Deletion error:", error);
      toast({ title: "Removal failed", variant: "destructive" });
    }
  }, [session, refetchImage, toast]);

  const handleNameUpdate = useCallback(async () => {
    if (!username || username === session?.user?.name) {
      setIsNameEditable(false);
      return toast({ title: "Please enter a new name" });
    }
    const modifiedName = username[0].toUpperCase() + username.slice(1);
    try {
      await axios.patch("/api/settings/change-name", {
        name: modifiedName,
        email: session?.user?.email,
      });
      await update();
      setIsNameEditable(false);
      toast({ title: "Name updated successfully" });
    } catch (error) {
      console.error("Update error:", error);
      toast({ title: "Update failed", variant: "destructive" });
    }
  }, [username, session, update, toast]);

  const handlePasswordUpdate = useCallback(async () => {
    if (!passwordValue) return;

    if (passwordValue.length <= 6) {
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 5000);
      return toast({ title: "Password must be longer than 6 characters" });
    }

    try {
      await axios.post("/api/settings/change-password", {
        email: session?.user?.email,
        password: passwordValue,
      });

      setPasswordValue("");
      setIsPasswordEditable(false);
      toast({ title: "Password updated successfully" });
      await update();
    } catch (error) {
      console.error("Password error:", error);
      toast({ title: "Password update failed", variant: "destructive" });
    }
  }, [passwordValue, session, update, toast]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      </div>
    );
  }

  if (!session?.user?.email) return null;

  return (
    <div className="container mx-auto flex flex-row">
      <div className="flex w-5/6 dark:border-zinc-800 border-l-2 min-h-screen p-16 space-y-4 relative flex-col">
        <div className="absolute inset-0 -z-10">
          <Particles
            particleColors={["#ffffff", "#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        <h1 className="text-3xl pb-4">Account Settings</h1>

        <div className="flex space-x-8 flex-row items-start">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent
              style={{
                backgroundColor: "transparent",
              }}
              className="p-0 bg-transparent border-none shadow-none flex justify-center items-center"
            >
              <div className="w-60 h-60 overflow-hidden rounded-full">
                <img
                  src={profileImageUrl}
                  className="w-full h-full object-cover"
                  alt="User Avatar"
                />
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="w-40 h-40">
                <AvatarImage
                  src={profileImageUrl}
                  className={
                    isUploading ? "opacity-50" : "object-cover object-top"
                  }
                  alt="User Avatar"
                />
                <AvatarFallback className="bg-gray-100">
                  <Camera className="w-12 h-12 text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
                View Photo
              </DropdownMenuItem>
              {hasPassword && (
                <>
                  <DropdownMenuItem onClick={removeImage}>
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <label htmlFor="fileInput" className="cursor-pointer">
                      Change Photo
                    </label>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileInputRef}
            type="file"
            id="fileInput"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />

          <div className="flex h-40 flex-col justify-center space-y-1">
            <h1 className="text-xl">{username}</h1>
            <h6 className="text-lg">{session.user.email}</h6>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Email
          </label>
          <div className="flex flex-row items-center space-x-3 rounded-lg">
            <input
              type="email"
              value={session?.user?.email}
              className="mt-1 block w-full outline-none cursor-not-allowed rounded-xl p-2"
              readOnly
            />{" "}
            <div className="size-5"></div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Name
          </label>
          <div className="flex items-center gap-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!isNameEditable}
              className={`mt-1 block w-full p-2 rounded-xl ${
                isNameEditable ? "ring-1 dark:ring-gray-400 ring-gray-700" : ""
              }`}
            />
            {isNameEditable ? (
              <CheckCheckIcon
                className="size-5 cursor-pointer"
                onClick={handleNameUpdate}
              />
            ) : (
              <HoverCard>
                <HoverCardTrigger>
                  {" "}
                  <Pen
                    className="size-5 cursor-pointer"
                    onClick={() => setIsNameEditable(true)}
                  />
                </HoverCardTrigger>
                <HoverCardContent className="rounded-xl py-2 w-fit h-fit">
                  Edit Name
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </div>

        {hasPassword && (
          <div className="flex flex-col">
            <label className="block text-red-500 text-sm font-medium">
              Password
            </label>
            <div className="flex items-center gap-3">
              <input
                type="password"
                placeholder="********"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                readOnly={!isPasswordEditable}
                className={`mt-1 block w-full p-2 rounded-xl ${
                  isPasswordEditable
                    ? "ring-1 dark:ring-gray-400 ring-gray-700"
                    : ""
                }`}
              />
              {isPasswordEditable ? (
                <CheckCheckIcon
                  className="size-5 cursor-pointer"
                  onClick={handlePasswordUpdate}
                />
              ) : (
                <HoverCard>
                  <HoverCardTrigger>
                    <Pen
                      className="size-5 cursor-pointer"
                      onClick={() => setIsPasswordEditable(true)}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent className="rounded-xl py-2 w-fit h-fit">
                    Edit Password
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            {errorMessage && (
              <div className="text-red-400">
                Password must be longer than 6 characters
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
