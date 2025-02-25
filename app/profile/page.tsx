"use client";

import { useState, useEffect } from "react";
import { useProfileImage } from "@/hooks/useProfileImage";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">(
    "dashboard"
  );
  const [bio, setBio] = useState("I own a computer.");
  const [urls, setUrls] = useState([
    "https://shadcn.com",
    "http://twitter.com/shadcn",
  ]);

  const { imageUrl: profileImageUrl, refetchImage } = useProfileImage();
  const { data: session } = useSession();

  useEffect(() => {
    refetchImage();
  }, [refetchImage]);

  const handleAddUrl = () => {
    setUrls([...urls, ""]);
  };

  const handleUrlChange = (index: number, value: string) => {
    const updatedUrls = [...urls];
    updatedUrls[index] = value;
    setUrls(updatedUrls);
  };

  return (
    <div className="min-h-screen w-2/3  p-6">
      <div className="w-full mb-8">
        <div className="flex">
          <button
            className={`py-3 px-6 font-medium text-center flex-1 `}
            onClick={() => setActiveTab("dashboard")}
          >
            <span
              className={`pb-3 ${
                activeTab === "dashboard"
                  ? "border-b-2 border-black dark:border-white"
                  : "border-b-2 border-transparent"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Profile Dashboard
            </span>
          </button>
          <button
            className={`py-3 px-6 font-medium text-center flex-1 `}
            onClick={() => setActiveTab("settings")}
          >
            <span
              className={` pb-3 ${
                activeTab === "settings"
                  ? "border-b-2 border-black dark:border-white"
                  : "border-b-2 border-transparent"
              }`}
            >
              Profile Settings
            </span>
          </button>
        </div>
      </div>

      <div className="w-full">
        {activeTab === "dashboard" && (
          <div className="p-8 rounded-lg">
            <h1 className="text-3xl pb-8">Profile Dashboard</h1>
            <div className="flex flex-row space-x-8">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  className="object-cover"
                  src={profileImageUrl || undefined}
                />
                <AvatarFallback className="text-2xl">Dawg</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-3 justify-center">
                <h2 className="text-2xl font-semibold">
                  {session?.user?.name || "username"}
                  <p className="text-lg">{session?.user?.email}</p>
                </h2>
                <div className="mt-4">
                  <h3 className="text-lg font-medium ">Bio</h3>
                  <p>{bio}</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-medium mb-3">Links</h3>
              <ul className="space-y-2">
                {urls.map((url, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Profile Settings Content */}
        {activeTab === "settings" && (
          <div className="p-8 rounded-lg">
            <h1 className="text-xl font-bold mb-1">Profile Settings</h1>
            <p className=" text-sm mb-6">
              This is how others will see you on the site.
            </p>

            <hr className="border-[#27272a] my-4" />

            <div className="space-y-8">
              <div>
                <label htmlFor="bio" className="block  mb-2">
                  Bio
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full dark:bg-black border border-[#27272a] rounded p-2  focus:outline-none focus:ring-1 focus:ring-gray-600 min-h-[80px]"
                  />
                </div>
              </div>
              <div>
                <label className="block  mb-2">URLs</label>
                <p className=" text-sm mb-2">
                  Add links to your website, blog, or social media profiles.
                </p>

                <div className="space-y-2">
                  {urls.map((url, index) => (
                    <input
                      key={index}
                      type="text"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="w-full dark:bg-black border border-[#27272a] rounded p-2  focus:outline-none focus:ring-1 focus:ring-gray-600"
                    />
                  ))}

                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="mt-2 px-3 py-1 text-sm dark:bg-black border border-gray-700 rounded hover:bg-gray-900 focus:outline-none"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <Button type="button" className="px-4 py-2 rounded-xl">
                Update profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
