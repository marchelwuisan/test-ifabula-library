import React, { useEffect, useState } from "react";
import { firestore, auth } from "../firebase";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CardActions,
  Snackbar,
} from "@mui/material";
import {
  collection,
  getDocs,
  where,
  updateDoc,
  doc,
  getDoc,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const notify = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const user = auth.currentUser;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksSnapshot = await getDocs(
          collection(firestore, "books"),
          where("returned", "==", false)
        );

        const booksData = booksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBooks(booksData);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchBooks();
  });

  const handleReturn = async (id) => {
    try {
      if (!user) throw new Error("You must be logged in to return a book");
      const { uid } = user;

      const returnedBook = doc(firestore, "books", id);

      const bookSnapshot = await getDoc(returnedBook);

      if (bookSnapshot.data().userId !== uid) {
        throw new Error("You can only return books that you have borrowed");
      }

      await updateDoc(returnedBook, {
        userId: null,
        borrowedBy: null,
      });

      notify(`${bookSnapshot.data().title} Returned`);
    } catch (error) {
      console.error(error.message);
      notify(error.message);
    }
  };

  const handleBorrow = async (id) => {
    try {
      if (!user) throw new Error("You must be logged in to borrow a book");
      const { uid, email } = user;

      const userBooksSnapshot = await getDocs(
        query(collection(firestore, "books"), where("userId", "==", uid))
      );

      if (!userBooksSnapshot.empty) {
        throw new Error("You can only borrow one book at a time");
      }

      const borrowedBook = doc(firestore, "books", id);

      const bookSnapshot = await getDoc(borrowedBook);

      if (bookSnapshot.data().userId) {
        throw new Error("This book is already borrowed");
      }

      await updateDoc(borrowedBook, {
        userId: uid,
        borrowedBy: email,
      });

      const bookHistoryRef = collection(firestore, "books", id, "bookHistory");
      await addDoc(bookHistoryRef, {
        timestamp: serverTimestamp(),
        borrowedBy: email,
        borrowedId: uid,
      });

      notify(`${bookSnapshot.data().title} Borrowed`);
    } catch (error) {
      console.error(error.message);
      notify(error.message);
    }
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={2} style={{ marginTop: "16px" }}>
        {books.map((book) => (
          <Grid key={book.id} item xs={12} sm={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  {book.author}
                </Typography>
                <Typography variant="h5" component="div">
                  {book.title}
                </Typography>
                <Typography color="text.secondary">{book.year}</Typography>
              </CardContent>
              <CardActions>
                {book.userId ? (
                  <Button
                    variant="contained"
                    onClick={() => handleReturn(book.id)}
                  >
                    Return
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleBorrow(book.id)}
                  >
                    Borrow
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default BookManagement;

