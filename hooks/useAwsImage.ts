import axios from "axios";
import { useState, useEffect } from "react";

interface UseUserImageParams {
  id?: string;
  email?: string;
}

interface UseUserImageResult {
  imageUrlAvatar: string | null;
  loading: boolean;
  error: Error | null;
}

export function useUserImage({
  id,
  email,
}: UseUserImageParams): UseUserImageResult {
  const [imageUrlAvatar, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id && !email) {
      setError(new Error("Either 'id' or 'email' must be provided"));
      return;
    }

    const fetchImageUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(`/api/search/get-avatar?id=${id}`);

        if (!response.data) {
          const errorData = await response.data;
          throw new Error(errorData.message || "Failed to fetch image URL");
        }

        const data = await response.data;
        if (data.imageUrl === null) {
          setImageUrl(data.Link);
        } else {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [id, email]);

  return { imageUrlAvatar, loading, error };
}
