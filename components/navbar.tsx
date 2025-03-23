"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, Search, Moon, Sun, Settings, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function BottomNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const linkItems = [
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "Search", icon: Search, path: "/search" },
    { name: "Account", icon: Settings, path: "/account" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background dark:bg-background-dark border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around lg:hidden z-50">
      {linkItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <Link
            href={item.path}
            key={item.name}
            className="flex flex-col items-center justify-center h-full w-full"
          >
            <div
              className={`flex flex-col items-center justify-center ${
                isActive
                  ? "text-primary"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Icon
                className={`h-6 w-6 ${isActive ? "stroke-2" : "stroke-1"}`}
              />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </div>
          </Link>
        );
      })}

      <button
        onClick={handleThemeToggle}
        className="flex flex-col items-center justify-center h-full w-full"
        type="button"
        aria-label="Toggle theme"
      >
        <div className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          {mounted && (
            <>
              {theme === "dark" ? (
                <Moon className="h-6 w-6" />
              ) : (
                <Sun className="h-6 w-6" />
              )}
              <span className="text-xs mt-1 font-medium">Theme</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}