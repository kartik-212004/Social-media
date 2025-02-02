"use client";

import { Pen } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera} from "lucide-react";
import Sidebar from "@/components/left-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { CheckCheckIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Account() {
  const { data: session, status } = useSession();
  const [imagePreview, setImagePreview] = useState(
    session?.user?.image || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState(session?.user?.name); // Set fallback value
  const [handleReadOnly, setReadOnly] = useState(true);
  const fileInputRef = useRef(null);

  // Update name state when session changes
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleName = () => {
    setReadOnly((read) => !read);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    try {
      // Handle API call for uploading image (if required)
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    // Handle API call to remove image (if required)
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      </div>
    );
  }

  return (
    <div className="container flex flex-row">
      <Sidebar />
      <div className="flex w-2/3 p-16 space-y-2 flex-col">
        <h1 className="text-3xl ">Account Settings</h1>
        <div className="flex space-x-8 flex-row items-start">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-40 h-40">
                  <AvatarImage
                    src={imagePreview || session?.user?.image}
                    className={isUploading ? "opacity-50" : ""}
                    alt="User Avatar"
                  />
                  <AvatarFallback className="bg-gray-100">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>View Photo</DropdownMenuItem>
                <DropdownMenuItem onClick={removeImage}>
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <label htmlFor="fileInput" className="cursor-pointer">
                    Change Photo
                  </label>
                </DropdownMenuItem>
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
          </div>

          <div className="flex h-40 flex-col justify-center space-y-1">
            <h1 className="text-xl ">{name || "Kartik"}</h1>
            <h6 className="text-lg">
              {session?.user?.email || "kartik200421@gmail.com"}
            </h6>
          </div>
        </div>

        <div>
          <label className="block dark:text-white text-sm font-medium text-gray-700 read-only:outline-none">
            Name
          </label>
          <div className="flex flex-row items-center space-x-3 border-gray-300 shadow-sm">
            <input
              onChange={(e) => setName(e.target.value)}
              readOnly={handleReadOnly}
              type="text"
              value={name}
              className={`mt-1 outline-none block w-full  p-2 ${
                handleReadOnly
                  ? "ring-0"
                  : "ring-1 dark:ring-gray-400 ring-gray-700 rounded-[4px]"
              }`}
            />
            {!handleReadOnly && <CheckCheckIcon onClick={handleName} />}
            {handleReadOnly && <Pen onClick={handleName} />}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white text-gray-700 read-only:outline-none">
            Email
          </label>
          <input
            type="email"
            value={session?.user?.email || "kartik200421@gmail.com"}
            className="mt-1 block w-full outline-none cursor-not-allowed rounded-md p-2"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 p-2"
          />
        </div>
      </div>
    </div>
  );
}
