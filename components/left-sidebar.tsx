"use client";

import {
  Moon,
  Sun,
  BellRing,
  HomeIcon,
  Search,
  MessageCircle,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const sidebarData = [
  { name: "Home", icon: <HomeIcon />, Link: "/" },
  { name: "Search", icon: <Search />, Link: "/search" },
  { name: "Notifications", icon: <BellRing />, Link: "/notification" },
  { name: "Messages", icon: <MessageCircle />, Link: "/message" },
  { name: "Account", icon: <Settings />, Link: "/account" },
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

export default function Sidebar() {
  const { toast } = useToast();
  const { imageUrl, refetchImage } = useProfileImage();
  const [toggle, setToggle] = useState(false);
  const [caption, setCaption] = useState("");
  const { data } = useSession();
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

  return (
    <div className="w-1/3 hidden flex-col justify-end items-end lg:flex ">
      <div className="py-6 top-0  fixed pr-10 flex flex-col min-h-screen justify-between items-end">
        <ul className="space-y-2 ">
          {sidebarData.map((item) => (
            <Link href={item?.Link || "../public/image.png"} key={item?.name}>
              <li className="flex hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors  duration-200 items-center gap-4 px-5 py-3 rounded-full cursor-pointer ">
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
                <Avatar>
                  <AvatarImage
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-full"
                    src={imageUrl}
                    alt="Profile"
                  ></AvatarImage>
                  <AvatarFallback>KB</AvatarFallback>
                </Avatar>
                {/* <img
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover rounded-full"
                  src={imageUrl || noProfile}
                  alt="Profile"
                /> */}
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
