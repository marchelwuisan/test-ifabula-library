import React, { useEffect, useState } from "react";
import { firestore } from "../firebase";
import {
  Container,
  Typography,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useFormik } from "formik";
import * as yup from "yup";

const validationSchema = yup.object({
  title: yup.string().required("Title is required"),
  author: yup.string().required("Author is required"),
  year: yup
    .number()
    .required("Year is required")
    .integer("Year must be an integer"),
});

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const notify = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const [selectedBookHistory, setSelectedBookHistory] = useState(null);

  const handleHistoryClick = (bookId, title, history) => {
    setSelectedBookHistory({ bookId, title, history });
  };

  const handleCloseHistory = () => {
    setSelectedBookHistory(null);
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      author: "",
      year: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        addDoc(collection(firestore, "books"), {
          title: values.title,
          author: values.author,
          year: values.year,
          isBorrowed: false,
          userId: null,
        });

        notify("Book added successfully!");
        resetForm();
      } catch (error) {
        console.error(error.message);
        notify(error.message);
      }
    },
  });

  const handleDelete = async (bookId) => {
    try {
      await deleteDoc(doc(firestore, "books", bookId));

      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));

      notify("Book deleted successfully!");
    } catch (error) {
      console.error(error.message);
      notify(error.message);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksCollectionRef = collection(firestore, "books");
        const booksQuery = query(booksCollectionRef);

        const booksSnapshot = await getDocs(booksQuery);

        const booksData = await Promise.all(
          booksSnapshot.docs.map(async (bookDoc) => {
            const bookData = {
              id: bookDoc.id,
              ...bookDoc.data(),
              bookHistory: [],
            };

            const bookHistoryCollectionRef = collection(
              firestore,
              "books",
              bookDoc.id,
              "bookHistory"
            );
            const bookHistoryQuery = query(
              bookHistoryCollectionRef,
              orderBy("timestamp", "desc")
            );

            const bookHistorySnapshot = await getDocs(bookHistoryQuery);
            bookData.bookHistory = bookHistorySnapshot.docs.map(
              (historyDoc) => ({
                id: historyDoc.id,
                ...historyDoc.data(),
              })
            );

            return bookData;
          })
        );

        setBooks(booksData);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchBooks();
  }, [snackbarOpen]);

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Add New Book
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Author"
          name="author"
          value={formik.values.author}
          onChange={formik.handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Year"
          name="year"
          type="number"
          value={formik.values.year}
          onChange={formik.handleChange}
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "16px" }}
        >
          Add Book
        </Button>
      </form>
      <Grid container spacing={2} style={{ marginTop: "16px" }}>
        {books.map((book) => (
          <Grid key={book.id} item xs={12} sm={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {book.title}
                </Typography>
                <Typography color="text.secondary">
                  {book.author}, {book.year}
                </Typography>
                <Typography
                  sx={{ fontSize: 12 }}
                  paddingY={1}
                  color="text.secondary"
                >
                  Borrowed By: {book.borrowedBy}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  onClick={() => handleDelete(book.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    handleHistoryClick(book.id, book.title, book.bookHistory)
                  }
                >
                  History
                </Button>
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

      <Dialog open={selectedBookHistory !== null} onClose={handleCloseHistory}>
        <DialogTitle>
          History: {selectedBookHistory?.title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseHistory}
            aria-label="close"
          ></IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedBookHistory?.history.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`Timestamp: ${new Date(
                      entry.timestamp.toDate()
                    ).toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary={`Borrowed By: ${entry.borrowedBy}`} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;

