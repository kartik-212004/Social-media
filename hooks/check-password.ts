import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

const useFetchUserPassword = () => {
  const { data: session } = useSession();
  const [handlePasswordField, setHandlePasswordField] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await axios.post("/api/minor/user/getpassword", {
          email: session.user.email,
        });

        if (response.data?.find) {
          setHandlePasswordField(true);
        } else {
          setHandlePasswordField(false);
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [session]);

  return handlePasswordField;
};

export default useFetchUserPassword;
