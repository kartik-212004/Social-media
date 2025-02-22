"use client";

import {
  Moon,
  Sun,
  BellRing,
  HomeIcon,
  Search,
  MessageCircle,
  Pyramid,
  LogOut,
  User,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const sidebarData = [
  { name: "Home", icon: <HomeIcon />, Link: "/" },
  { name: "Explore", icon: <Search />, Link: "/explore" },
  { name: "Notifications", icon: <BellRing />, Link: "/notification" },
  { name: "Messages", icon: <MessageCircle />, Link: "/message" },
  { name: "Premium", icon: <Pyramid />, Link: "/premium" },
  { name: "Profile", icon: <User />, Link: "/profile" },
  ,
];

import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./post";
import { Skeleton } from "./ui/skeleton";

export default function Sidebar() {
  const { toast } = useToast();
  const { imageUrl, refetchImage } = useProfileImage();
  const [toggle, setToggle] = useState(false);
  const [caption, setCaption] = useState("");
  const { data, status } = useSession();
  const [isPosting, setIsPosting] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    refetchImage();
  }, []);

  function handleOnclick() {
    handlePost();
    setToggle((prevToggle) => !prevToggle);
  }

  async function handlePost() {
    if (caption.trim() && !isPosting) {
      setIsPosting(true);
      try {
        await axios.post("/api/post", {
          caption: caption.trim(),
          email: data?.user?.email,
        });
        setCaption("");
      } catch (error) {
        console.error("Post failed:", error);
      } finally {
        setIsPosting(false);
      }
    }
  }

  return status == "loading" ? (
    <div className="flex justify-center items-center w-screen h-screen">
      {" "}
      <Skeleton className="w-[100px] h-[20px] rounded-full" />
    </div>
  ) : (
    <div className="w-1/3 flex flex-col justify-end items-end">
      <div className="py-6 top-0  fixed pr-10 flex flex-col min-h-screen justify-between items-end">
        <ul className="space-y-2 ">
          {sidebarData.map((item) => (
            <Link href={item?.Link || "../public/image.png"} key={item?.name}>
              <li className="flex hover:bg-zinc-100 dark:hover:bg-zinc-900 items-center gap-4 px-5 py-3 rounded-full cursor-pointer transition">
                {item?.icon}
                <span className="text-2xl">{item?.name}</span>
              </li>
            </Link>
          ))}
          <li
            onClick={() => {
              setTheme(theme == "dark" ? "light" : "dark");
            }}
            className="flex hover:bg-zinc-100 dark:hover:bg-zinc-900 items-center gap-4 px-5 py-3 rounded-full cursor-pointer transition"
          >
            {theme == "dark" ? <Moon /> : <Sun />}
            <span className="text-2xl">Theme</span>
          </li>
          <Button
            onClick={() => handleOnclick()}
            className="w-full rounded-full text-xl py-6"
          >
            Post
          </Button>
        </ul>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex flex-row justify-center min-w-min hover:bg-zinc-100 dark:hover:bg-zinc-900 px-3 py-3 rounded-full items-center">
              <div className="flex items-center gap-3">
                <img
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  src={imageUrl || "/public/image.png"}
                  alt="Profile"
                />
                <div className="flex flex-col items-start ">
                  <span className="font-semibold">{data?.user?.name}</span>
                  <span className="text-sm">{data?.user?.email}</span>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-transparent dark:bg-background-dark">
            <Link href={"/account"}>
              <DropdownMenuItem className="flex flex-row ">
                <User />
                Account
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => {
                signOut({ callbackUrl: "/signin" });
                toast({ title: "Logged Out" });
              }}
              className="flex text-red-600  flex-row"
            >
              <LogOut />
              Signout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Post onOpenChange={() => setToggle((prev) => !prev)} on={toggle} />
      </div>
    </div>
  );
}
