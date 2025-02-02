"use client";

import { PenBox } from "lucide-react";
import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import Sidebar from "@/components/left-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { CheckCheckIcon } from "lucide-react";

export default function Account() {
  const { data: session, status } = useSession();
  const [imagePreview, setImagePreview] = useState(
    session?.user?.image || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [name, setname] = useState("");
  const [handleReadOnly, setReadOnly] = useState(true);
  const fileInputRef = useRef(null);
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
      // Example API call for uploading
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/update-profile-photo', { method: 'POST', body: formData });
      // const data = await response.json();
      // if (!response.ok) throw new Error("Failed to upload");
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    setImagePreview(null);
    try {
      // Example API call for removing
      // await fetch('/api/remove-profile-photo', { method: 'DELETE' });
    } catch (error) {
      console.error("Error removing image:", error);
    }
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

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50"
              disabled={isUploading}
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />

            {imagePreview && (
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex h-40 flex-col justify-center space-y-1">
            <h1 className="text-xl ">{session?.user?.name || "Kartik"}</h1>
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
              onChange={(e) => {
                setname(e.target.value);
              }}
              readOnly={handleReadOnly}
              type="text"
              defaultValue={session?.user?.name || "Kartik"}
              className={`mt-1 outline-none block w-full rounded-md p-2 ${
                handleReadOnly
                  ? "ring-0" 
                  : "ring-2 ring-gray-700 rounded-[4px]" 
              }`}
            />
            {!handleReadOnly && <CheckCheckIcon onClick={handleName} />}
            <PenBox onClick={handleName} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-white text-gray-700 read-only:outline-none">
            Email
          </label>
          <input
            type="email"
            defaultValue={session?.user?.email || "kartik200421@gmail.com"}
            className="mt-1 block w-full outline-none cursor-not-allowed rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700   dark:text-white">
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
