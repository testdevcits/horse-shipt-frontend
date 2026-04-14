import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageLoader from "../../components/common/PageLoader";

const RedirectIfAuth = ({ children, redirectPath }) => {
  const { user, token, loading } = useAuth();
  if (loading) {
    return (
      <PageLoader
        text="Checking authentication..."
        fullScreen={false}
        size={28}
        color="#BF9B53"
      />
    );
  }

  if (user && token) {
    const path = redirectPath || `/${user.role}/dashboard`;
    return <Navigate to={path} replace />;
  }

  return children;
};

export default RedirectIfAuth;
