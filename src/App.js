import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Auth, BookManagement, AdminDashboard } from "./pages";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { auth } from "./firebase";
import getUserRole from "./utils/getUserRole";

const App = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const handleUserRole = async (userId) => {
    const userRole = await getUserRole(userId);
    setUserRole(userRole);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);

        handleUserRole(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const PrivateRoute = ({ element, path }) => {
    if (!user) {
      return <Navigate to="/auth" />;
    }

    if (path === "/admin-dashboard" && userRole !== "ADMIN") {
      return <Navigate to="/book-management" />;
    }

    return element;
  };

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/auth"
              style={{ textDecoration: "none", color: "white" }}
            >
              LIBRARY
            </Typography>
            <Button color="inherit" component={Link} to="/auth">
              Auth
            </Button>
            <Button color="inherit" component={Link} to="/book-management">
              Book Management
            </Button>
            {user && userRole === "ADMIN" && (
              <Button color="inherit" component={Link} to="/admin-dashboard">
                Admin Dashboard
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Container style={{ marginTop: "20px" }}>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/book-management" element={<BookManagement />} />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute
                  element={<AdminDashboard />}
                  path="/admin-dashboard"
                />
              }
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;

