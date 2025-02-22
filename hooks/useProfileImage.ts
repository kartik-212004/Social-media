import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import useFetchUserPassword from "./check-password";
import { useSession } from "next-auth/react";

export const useProfileImage = () => {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasPassword = useFetchUserPassword();

  const fetchImage = async () => {
    if (!session?.user?.email || hasPassword === null) return;

    if (!hasPassword && session?.user?.image) {
      setImageUrl(session.user.image);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/s3/get", {
        email: session.user.email,
      });

      if (response.status === 200 && response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);
        return;
      }
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 404) {
        setImageUrl(session.user.image ?? "/default-avatar.png");
        return;
      } else {
        console.error("Error fetching image:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasPassword !== null) {
      fetchImage();
    }
  }, [session?.user?.email, hasPassword]);

  return {
    imageUrl,
    isLoading,
    error,
    refetchImage: fetchImage,
  };
};
