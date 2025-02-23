"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useProfileImage } from "@/hooks/useProfileImage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

interface PostProps {
  on: boolean;
  onOpenChange: () => void;
}

export default function Post({ on, onOpenChange }: PostProps) {
  const { data: session } = useSession();
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPosting, setIsPosting] = useState(false);
  const { imageUrl, refetchImage } = useProfileImage();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    refetchImage();
  }, []);

  const handlePost = useCallback(async () => {
    const formdata = new FormData();
    if (file) formdata.append("file", file);

    if (caption.trim() && !isPosting) {
      setIsPosting(true);
      try {
        const formData = new FormData();
        formData.append("file", file ?? "");
        formData.append("email", session?.user?.email ?? "");
        formData.append("caption", caption);

        await axios.post("/api/post", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCaption("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Post failed:", error);
      } finally {
        setIsPosting(false);
      }
    }
  }, [caption, session?.user?.email, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <Dialog open={on} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-start space-x-4">
          <div className="w-[10%]">
            <img
              src={imageUrl || "/default-avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="w-5/6 pr-7 space-y-6">
            <DialogTitle className="text-2xl"> Create a Post</DialogTitle>
            <DialogDescription>
              <textarea
                maxLength={280}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Anything new"
                className="w-full min-h-[30vh] dark:text-white text-black text-xl placeholder:text-xl bg-transparent dark:bg-background-dark focus:outline-none resize-none placeholder:text-muted-foreground"
              />
            </DialogDescription>
          </div>
        </DialogHeader>
        <Input
          ref={fileInputRef}
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
          }}
          type="file"
          className="py-2  text-blue-400  px-5 rounded-3xl font-medium "
        />
        <Button
          onClick={handlePost}
          disabled={!caption.trim() || isPosting}
          className={`flex rounded-2xl text-xl justify-center ${
            isPosting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPosting ? "Posting..." : "POST"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
