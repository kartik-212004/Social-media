"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import React, { useState, useEffect, useRef } from "react";
import { Pen, Camera, CheckCheckIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/left-sidebar";

export default function Account() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const [handlePasswordfield, setHandlePasswordField] = useState(false);
  const [handleImagePreview, sethandleImagePreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [Passwordvalue, setPasswordValue] = useState("");
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [errorMessage, seterrorMessage] = useState(false);
  const [username, setUsername] = useState(session?.user?.name || "user");
  const [isPasswordEditable, setisPasswordEditable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState(
    session?.user?.image || null
  );

  useEffect(() => {
    async function fetchUser() {
      if (!session?.user?.email) return;

      try {
        const response = await axios.post("/api/minor/user/getpassword", {
          email: session.user.email,
        });

        if (response.data?.find) {
          setHandlePasswordField(true);
          console.log(handlePasswordfield);
        } else {
          setHandlePasswordField(false);
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    }

    fetchUser();
  }, [session?.user?.email]);

  function both() {
    toggleNameEdit();
    RequesttoUpdateName();
  }
  function both2() {
    UpdatePassword();
    togglePasswordEdit();
  }

  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
  }, [session?.user?.name]);

  async function RequesttoUpdateName() {
    await axios.post("/api/userdata", {
      name: username,
      email: session?.user?.email,
    });
    await update();
  }
  async function UpdatePassword() {
    if (Passwordvalue.length <= 0) {
      setPasswordValue("");
      return;
    }
    if (Passwordvalue.length <= 6) {
      setPasswordValue("");
      seterrorMessage(true);
      setTimeout(() => {
        seterrorMessage((value) => !value);
      }, 5000);
      return toast({ title: "Short Password Length" });
    }
    try {
      const response = await axios.post("/api/minor/user/changepassword", {
        email: session?.user?.email,
        password: Passwordvalue,
      });
      const UpdatedPassword = await response.data;
      setPasswordValue("");
      if (UpdatedPassword.status) {
        toast({
          title: UpdatedPassword.message,
        });
      } else
        toast({
          title: UpdatedPassword.message,
        });
    } catch (error) {
      console.log(error);
    }
    await update();
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = async () => setImagePreview(reader.result as string);
    const formData = new FormData();
    formData.append("file", file);
    console.log(imagePreview, "photo");
    reader.readAsDataURL(file);

    try {
      const response = await axios.post("/api/s3/post", formData);
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    // Implement image removal API call
  };

  const toggleNameEdit = () => {
    setIsNameEditable(!isNameEditable);
  };
  const togglePasswordEdit = () => {
    setisPasswordEditable(!isPasswordEditable);
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      </div>
    );
  }

  return session?.user?.email ? (
    <div className="container mx-auto flex flex-row">
      <Sidebar />
      <div className="flex w-[83.33%] dark:border-zinc-800 border-l-2 min-h-screen p-16 space-y-4 relative flex-col">
        <h1 className="text-3xl">Account Settings</h1>

        <div className="flex space-x-8 flex-row items-start">
          <Dialog
            open={handleImagePreview}
            onOpenChange={sethandleImagePreview}
          >
            <DialogContent
              className="p-0 bg-transparent border-none shadow-none flex justify-center items-center"
              style={{
                backgroundColor: "transparent",
              }}
            >
              <div className="w-60 h-60 overflow-hidden rounded-full">
                <img
                  src={imagePreview ?? session?.user?.image ?? undefined}
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
                  src={imagePreview ?? session?.user?.image ?? undefined}
                  className={isUploading ? "opacity-50" : "object-cover"}
                  alt="User Avatar"
                />

                <AvatarFallback className="bg-gray-100">
                  <Camera className="w-12 h-12 text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => sethandleImagePreview((prev) => !prev)}
              >
                View Photo
              </DropdownMenuItem>

              {handlePasswordfield && (
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
            <h1 className="text-xl">{session?.user?.name || "User"}</h1>
            <h6 className="text-lg">{session?.user?.email}</h6>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Email
          </label>
          <input
            type="email"
            value={session?.user?.email}
            className="mt-1 block w-full outline-none cursor-not-allowed rounded-md p-2"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Name
          </label>
          <div className="flex flex-row items-center space-x-3">
            <input
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!isNameEditable}
              type="text"
              value={username}
              className={`mt-1 block w-full p-2 ${
                isNameEditable
                  ? "ring-1 dark:ring-gray-400 ring-gray-700 rounded-[4px]"
                  : "outline-none"
              }`}
            />
            {isNameEditable ? (
              <CheckCheckIcon className="size-5" onClick={both} />
            ) : (
              <Pen className="size-5" onClick={toggleNameEdit} />
            )}
          </div>
        </div>

        {handlePasswordfield && (
          <div className="flex flex-col">
            <label className="block text-red-500 text-sm font-medium ">
              Password
            </label>
            <div className="flex flex-row items-center space-x-3">
              <input
                type="password"
                placeholder="********"
                onChange={(e) => {
                  setPasswordValue(e.target.value);
                }}
                value={Passwordvalue}
                readOnly={!isPasswordEditable}
                className={`mt-1 block w-full p-2 ${
                  isPasswordEditable
                    ? "ring-1 dark:ring-gray-400 ring-gray-700 rounded-[4px]"
                    : "outline-none"
                }`}
              />
              {isPasswordEditable ? (
                <CheckCheckIcon className="size-5" onClick={both2} />
              ) : (
                <Pen className="size-5" onClick={togglePasswordEdit} />
              )}
            </div>
            {errorMessage && (
              <div className="text-red-400 ">
                Password Is Short : length &gt; 6
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;
}
