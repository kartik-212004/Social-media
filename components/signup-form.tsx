"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";
import { Globe } from "lucide-react";
import { signIn } from "next-auth/react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setname] = useState("");

  function errorToast(e: string) {
    toast({ title: e });
  }
  function successToast(e: string) {
    toast({ title: e });
  }

  async function loginHandler(e: React.FormEvent) {
    e.preventDefault();

    const ModifiedName = name[0].toUpperCase() + name.slice(1);
    try {
      const handle = await axios.post("/api/signup", {
        email: email,
        password: password,
        name: ModifiedName,
      });
      if (handle.status === 200) successToast(handle.data.message);
      router.push("/signin");
    } catch (error) {
      if (error instanceof AxiosError) {
        const { response } = error;
        if (response) {
          const { status, data } = response;
          if (status === 400) {
            errorToast(data.message || "Bad Request");
          } else {
            errorToast(
              data.message || "Something went wrong. Please try again."
            );
          }
        }
      }
    }
  }
  async function githubHandle(e: React.FormEvent) {
    e.preventDefault();
    await signIn("github", { callbackUrl: "/" });
  }
  async function googleHandle(e: React.FormEvent) {
    e.preventDefault();
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <form
      onSubmit={loginHandler}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-neutral-500 dark:text-neutral-400">
          Enter your email below to Create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            onChange={(e) => {
              setname(e.target.value);
            }}
            id="name"
            type="text"
            placeholder="kartik"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            id="email"
            type="email"
            placeholder="mail@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            id="password"
            type="password"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Signup
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-neutral-200 dark:after:border-neutral-800">
          <span className="relative z-10 bg-white px-2 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
            Or continue with
          </span>
        </div>
        <div className="gap-2 flex flex-row">
          <Button onClick={googleHandle} variant="outline" className="w-full">
            <Globe />
            Login with Google
          </Button>
          <Button onClick={githubHandle} variant="outline" className="w-full">
            <Github />
            Login with GitHub
          </Button>
        </div>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/signin" className="underline underline-offset-4">
          Sign In
        </a>
      </div>
    </form>
  );
}
