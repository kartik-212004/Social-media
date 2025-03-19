"use client";
import { useState, useEffect } from "react";
import { useProfileImage } from "@/hooks/useProfileImage";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Globe,
  Github,
  Popcorn,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Dribbble,
  Link as LinkIcon,
} from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">(
    "dashboard"
  );
  const [bio, setBio] = useState("");
  const [urlInputs, setUrlInputs] = useState<string[]>([""]);
  const [isposting, setisposting] = useState(false);
  const [links, setLinks] = useState<
    { id: string; url: string; userId: string }[]
  >([]);

  const [fetchedBio, setfetchedBio] = useState("");
  const [isloading, setisloading] = useState(false);

  const { imageUrl: profileImageUrl, refetchImage } = useProfileImage();
  const { data: session } = useSession();

  useEffect(() => {
    refetchImage();
  }, [refetchImage]);

  const handleAddUrl = () => {
    setUrlInputs([...urlInputs, ""]);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrlInputs = [...urlInputs];
    newUrlInputs[index] = value;
    setUrlInputs(newUrlInputs);
  };

  const getLinkIcon = (url: string) => {
    const domain = url.toLowerCase();

    if (domain.includes("github.com"))
      return { icon: <Github size={16} />, name: "Github" };
    if (domain.includes("twitter.com") || domain.includes("x.com"))
      return { icon: <Twitter size={16} />, name: "Twitter" };
    if (domain.includes("linkedin.com"))
      return { icon: <Linkedin size={16} />, name: "Linkedin" };
    if (domain.includes("pornhub.com"))
      return { icon: <Popcorn size={16} />, name: "Pornhub" };
    if (domain.includes("instagram.com"))
      return { icon: <Instagram size={16} />, name: "Instagram" };
    if (domain.includes("facebook.com"))
      return { icon: <Facebook size={16} />, name: "Facebook" };
    if (domain.includes("youtube.com"))
      return { icon: <Youtube size={16} />, name: "Youtube" };
    if (domain.includes("dribbble.com"))
      return { icon: <Dribbble size={16} />, name: "Dribbble" };

    return { icon: <Globe size={16} />, name: "Link" };
  };

  // backend request
  const handleSubmit = async () => {
    setisposting(true);
    try {
      const newLinks = urlInputs.filter((url) => url.trim() !== "");

      const response = await axios.post("/api/settings/profile-update", {
        bio: bio,
        links: newLinks,
        email: session?.user?.email,
      });
      await response.data;
      setisposting(false);
      fetchData();
    } catch (error) {
      console.log(error);
      setisposting(false);
    }
  };

  // fetch from backend
  const fetchData = async () => {
    setisloading(true);
    if (!session?.user?.email) {
      setisloading(false);
      return;
    }

    try {
      const response = await axios.get(
        `/api/settings/profile-update?email=${session?.user?.email}`
      );
      const data = response.data;
      setfetchedBio(data.bio || "");
      setBio(data.bio || "");
      setLinks(data.links || []);

      setUrlInputs([""]);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setisloading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchData();
    }
  }, [session?.user?.email]);

  const Links = () => {
    return (
      <ul className="space-y-2">
        {links.map((link, id) => (
          <li className="flex items-center gap-2" key={id}>
            <a
              className="hover:underline flex flex-row items-center space-x-1"
              target="_blank"
              rel="noopener noreferrer"
              href={
                link.url.startsWith("http") ? link.url : `https://${link.url}`
              }
            >
              <span>{getLinkIcon(link.url).icon}</span>{" "}
              <span> {getLinkIcon(link.url).name}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen w-2/3 dark:border-zinc-800 border-l-2 p-6">
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
              {isloading ? (
                <Skeleton className="w-32 h-32 rounded-full" />
              ) : (
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    className="object-cover object-top"
                    src={profileImageUrl || undefined}
                  />
                  <AvatarFallback className="text-2xl">
                    {session?.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              {isloading ? (
                <div className="flex flex-col space-y-3 justify-center">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ) : (
                <div className="flex flex-col space-y-3 justify-center">
                  <h2 className="text-xl font-semibold">
                    {session?.user?.name || "username"}
                    <p className="text-lg">{session?.user?.email}</p>
                  </h2>
                </div>
              )}
            </div>

            <div className="mt-10">
              <div>
                <label htmlFor="bio" className="block mb-2">
                  Bio
                </label>
                {isloading ? (
                  <Skeleton className="w-full h-[80px]" />
                ) : (
                  <textarea
                    id="bio"
                    value={fetchedBio}
                    disabled={true}
                    className="w-full hover:cursor-not-allowed dark:bg-background border border-[#27272a] rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-600 min-h-[80px]"
                  />
                )}
              </div>
              <h3 className="text-lg font-medium mb-3 mt-6">Links</h3>
              {isloading ? <Skeleton className="h-20 w-full" /> : <Links />}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-8 rounded-lg">
            <h1 className="text-xl font-bold mb-1">Profile Settings</h1>
            <div className="space-y-8">
              <div>
                <label htmlFor="bioEdit" className="block mb-2">
                  Bio
                </label>
                {isloading ? (
                  <Skeleton className="w-full h-[80px]" />
                ) : (
                  <textarea
                    id="bioEdit"
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                    className="w-full dark:bg-black border border-[#27272a] rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-600 min-h-[80px]"
                  />
                )}
              </div>
              <div>
                <label className="block mb-2">URLs</label>
                <p className="text-sm mb-2">
                  Add links to your website, blog, or social media profiles.
                </p>

                <div className="space-y-4">
                  {isloading ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : (
                    <>
                      {links.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">
                            Your saved links:
                          </h4>
                          <ul className="space-y-2 ">
                            {links.map((link, id) => (
                              <li className="flex items-center gap-2" key={id}>
                                <a
                                  className="hover:underline flex flex-row items-center space-x-1"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={
                                    link.url.startsWith("http")
                                      ? link.url
                                      : `https://${link.url}`
                                  }
                                >
                                  <span>{getLinkIcon(link.url).icon}</span>{" "}
                                  <span> {getLinkIcon(link.url).name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {urlInputs.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-gray-500">
                            {url ? (
                              getLinkIcon(url).icon
                            ) : (
                              <LinkIcon size={16} />
                            )}
                          </span>
                          <input
                            type="text"
                            value={url}
                            onChange={(e) =>
                              handleUrlChange(index, e.target.value)
                            }
                            className="w-full dark:bg-black border border-[#27272a] rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-600"
                            placeholder="Instagram .."
                          />
                        </div>
                      ))}

                      <Button
                        type="button"
                        onClick={handleAddUrl}
                        className="text-sm rounded-xl"
                      >
                        Add URL
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isloading ? (
                <Skeleton className="h-10 w-[120px]" />
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isposting}
                  type="button"
                  className="px-4 py-2 rounded-xl"
                >
                  {isposting ? "Updating..." : "Update profile"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
