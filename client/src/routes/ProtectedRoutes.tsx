import React, { useState, useEffect, Children } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";

interface ProtectedRoutesProps {
  children: any;
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });

      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        console.log('ari 1');
        setIsAuthorized(true);
      } else {
        console.log('ari 2');
        setIsAuthorized(false);
      }
    } catch (err) {
      console.log(err);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      console.log('ari 3');
      setIsAuthorized(false);
      return;
    }

    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      await refreshToken();
    } else {
      setIsAuthorized(true);
    }
  };

  if (isAuthorized === null) {
    console.log('ari 4');
    return <div>Loading...</div>;
  }

  console.log('ari 5');
  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoutes;
