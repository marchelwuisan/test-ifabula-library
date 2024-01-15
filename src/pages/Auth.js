import React, { useState, useEffect } from "react";
import { auth, firestore } from "../firebase";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
} from "@mui/material";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import * as Yup from "yup";

const passwordSchema = Yup.object().shape({
  password: Yup.string()
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-zA-Z0-9]/, "Password must be alphanumeric")
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required"),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const notify = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const isPasswordValid = async () => {
    try {
      await passwordSchema.validate({ password });
      return true;
    } catch (error) {
      notify(error.errors[0]);
      return false;
    }
  };

  const createUserDocument = async (userId, email, role) => {
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, { email, role });
  };

  const handleRegister = async () => {
    try {
      if (!(await isPasswordValid())) {
        return;
      }
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUserDocument(user.uid, email, "user");
      notify("Registration successful!");
    } catch (error) {
      console.error(error.message);
      notify(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      notify("Login successful!");
    } catch (error) {
      console.error(error.message);
      notify(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      notify("Logout successful!");
    } catch (error) {
      console.error(error.message);
      notify(error.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" gutterBottom>
        Authentication
      </Typography>
      {user ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogout}
          fullWidth
          style={{ marginTop: "16px" }}
        >
          Logout
        </Button>
      ) : (
        <>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegister}
            fullWidth
            style={{ marginTop: "16px" }}
          >
            Register
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
            style={{ marginTop: "8px" }}
          >
            Login
          </Button>
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Auth;

