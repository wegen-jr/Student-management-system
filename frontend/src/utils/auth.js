export const checkAuth = async () => {

  try {

    const res = await fetch(
      "http://localhost/sms/backend/controllers/checkAuth.php",
      {
        credentials: "include"
      }
    );

    const data = await res.json();

    if (data.loggedIn) {
      return data.user;
    }

    return null;

  } catch (error) {

    console.error("Auth error:", error);
    return null;

  }

};