"use client";
import {
  BellRing,
  HomeIcon,
  Search,
  MessageCircle,
  Pyramid,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ModeToggle } from "./dark-theme";
import { Button } from "./ui/button";
import { User } from "lucide-react";
const sidebarData = [
  { name: "Home", icon: <HomeIcon /> },
  { name: "Explore", icon: <Search /> },
  { name: "Notifications", icon: <BellRing /> },
  { name: "Messages", icon: <MessageCircle /> },
  { name: "Premium", icon: <Pyramid /> },
  { name: "Profile", icon: <User /> },
];

export default function Sidebar() {
  const { data } = useSession();

  return (
    <div className="py-6 w-1/3 flex flex-col min-h-screen justify-between items-end">
      <ul className="space-y-2 ">
        {sidebarData.map((item) => (
          <li
            key={item.name}
            className="flex hover:bg-zinc-900 items-center gap-4 px-5 py-3 rounded-full cursor-pointer transition"
          >
            {item.icon}
            <span className="text-2xl">{item.name}</span>
          </li>
        ))}
        <Button className="w-full rounded-full text-xl py-6">Post</Button>
        <ModeToggle />
      </ul>
      <div className="flex flex-row justify-center min-w-min hover:bg-zinc-900 px-3 py-3 rounded-full items-center">
        <div className="flex items-center gap-3">
          <img
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
            src={data?.user?.image || "/public/image.png"}
            alt="Profile"
          />
          <div className="flex flex-col">
            <span className="font-semibold">
              {data?.user?.name || "Set Name"}
            </span>
            <span className="text-sm">{data?.user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
