"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import Particles from "@/components/ui/Particles";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useState, useEffect, useRef } from "react";
import { Pen, Camera, CheckCheckIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/left-sidebar";
import { useProfileImage } from "@/hooks/useProfileImage";
import useFetchUserPassword from "@/hooks/check-password";

export default function Account() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [handlePasswordfield, setHandlePasswordField] = useState(false);
  const [handleImagePreview, setHandleImagePreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [username, setUsername] = useState(session?.user?.name || "user");
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { imageUrl: profileImageUrl, refetchImage } = useProfileImage();
  const hasPassword = useFetchUserPassword();

  useEffect(() => {
    if (session?.user?.email) {
      handleGetImage();
    }
  }, [session?.user?.email]);
  useEffect(() => {}, [imageUrl]);

  useEffect(() => {
    async function fetchUser() {
      if (!session?.user?.email) return;

      try {
        const response = await axios.post("/api/settings/get-password", {
          email: session.user.email,
        });

        setHandlePasswordField(!!response.data?.find);
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    }

    fetchUser();
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
  }, [session?.user?.name]);

  const handleGetImage = async () => {
    try {
      const response = await axios.post("/api/s3/get", {
        email: session?.user?.email,
      });

      if (response.status === 200 && response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);
        toast({ title: "Image loaded successfully" });
      } else {
        throw new Error("Image not found");
      }
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 404) {
        console.warn("No profile image found, using default.");
        setImageUrl("/default-avatar.png");
        toast({ title: "No profile image found. Using default." });
      } else {
        console.error("Error fetching image:", error);
        toast({ title: "Error fetching image", variant: "destructive" });
      }
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", session?.user?.email ?? "");

      const response = await axios.post("/api/s3/post", formData);

      toast({
        title: response.data.message,
      });

      await refetchImage();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error uploading image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (email: string) => {
    try {
      const response = await axios.delete(`/api/s3/delete/${email}`);
      const data = await response.data;

      toast({
        title: data.message,
      });

      await refetchImage();
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const handleNameUpdate = async () => {
    if (username == session?.user?.name) {
      setIsNameEditable(false);
      return toast({ title: "Please Enter A New Name" });
    }
    try {
      await axios.post("/api/settings/change-name", {
        name: username,
        email: session?.user?.email,
      });
      await update();
      setIsNameEditable(false);
      toast({
        title: "Name updated successfully",
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error updating name",
        variant: "destructive",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    setIsPasswordEditable((e) => !e);
    if (!passwordValue) {
      setPasswordValue("");

      return;
    }

    if (passwordValue.length <= 6) {
      setPasswordValue("");
      setErrorMessage(true);
      setTimeout(() => setErrorMessage(false), 5000);
      toast({ title: "Password must be longer than 6 characters" });
      return;
    }

    try {
      const response = await axios.post("/api/settings/change-password", {
        email: session?.user?.email,
        password: passwordValue,
      });

      setPasswordValue("");
      setIsPasswordEditable(false);

      toast({
        title: response.data.message,
      });

      await update();
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error updating password",
        variant: "destructive",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      </div>
    );
  }

  return session?.user?.email && imageUrl ? (
    <div className="container mx-auto flex flex-row">
      <Sidebar />
      <div className="flex w-[83.33%] dark:border-zinc-800 border-l-2 min-h-screen p-16 space-y-4 relative flex-col">
        <div className="absolute inset-0 -z-10">
          <Particles
            particleColors={["#ffffff", "#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        <h1 className="text-3xl">Account Settings</h1>

        <div className="flex space-x-8 flex-row items-start">
          <Dialog
            open={handleImagePreview}
            onOpenChange={setHandleImagePreview}
          >
            <DialogContent
              className="p-0 bg-transparent border-none shadow-none flex justify-center items-center"
              style={{
                backgroundColor: "transparent",
              }}
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
                  className={isUploading ? "opacity-50" : "object-cover"}
                  alt="User Avatar"
                />
                <AvatarFallback className="bg-gray-100">
                  <Camera className="w-12 h-12 text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setHandleImagePreview(true)}>
                View Photo
              </DropdownMenuItem>

              {hasPassword && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      removeImage(session.user?.email || "");
                    }}
                  >
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
            <h6 className="text-lg">{session?.user?.email}</h6>
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
          <div className="flex flex-row items-center space-x-3 rounded-lg">
            <input
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!isNameEditable}
              type="text"
              value={username}
              className={`mt-1  block w-full  p-2 rounded-xl   ${
                isNameEditable
                  ? "ring-1 dark:ring-gray-400 ring-gray-700 rounded-[4px]"
                  : "outline-none"
              }`}
            />
            {isNameEditable ? (
              <CheckCheckIcon className="size-5" onClick={handleNameUpdate} />
            ) : (
              <Pen className="size-5" onClick={() => setIsNameEditable(true)} />
            )}
          </div>
        </div>

        {handlePasswordfield && (
          <div className="flex flex-col">
            <label className="block text-red-500 text-sm font-medium">
              Password
            </label>
            <div className="flex flex-row items-center space-x-3 rounded-lg">
              <input
                type="password"
                placeholder="********"
                onChange={(e) => setPasswordValue(e.target.value)}
                value={passwordValue}
                readOnly={!isPasswordEditable}
                className={`mt-1  block w-full p-2  rounded-xl ${
                  isPasswordEditable
                    ? "ring-1 dark:ring-gray-400 ring-gray-700 rounded-[4px]"
                    : "outline-none"
                }`}
              />
              {isPasswordEditable ? (
                <CheckCheckIcon
                  className="size-5"
                  onClick={handlePasswordUpdate}
                />
              ) : (
                <Pen
                  className="size-5"
                  onClick={() => setIsPasswordEditable(true)}
                />
              )}
            </div>
            {errorMessage && (
              <div className="text-red-400">
                Password Is Short : length &gt; 6
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;
}
