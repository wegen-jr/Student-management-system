import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ restore session on refresh
  useEffect(() => {
    fetch("http://localhost/sms/backend/controllers/checkAuth.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setUser(data.user);
        }
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);