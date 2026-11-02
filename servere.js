import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

// in-memory array
let books = [];


//Task 2

app.post("/api/books", (req, res) => {
  const { id, title, author, category, quantity, available } = req.body;

  // check required fields
  if (!id || !title || !author || !category || quantity === undefined) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // check quantity
  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({ message: "Quantity must be a positive number" });
  }

  // check duplicate id
  const exists = books.find((b) => b.id == id);
  if (exists) {
    return res.status(400).json({ message: "Book ID already exists" });
  }

  const newBook = {
    id,
    title,
    author,
    category,
    quantity,
    available: available !== undefined ? available : quantity,
  };

  books.push(newBook);
  res.status(201).json({ message: "Book added successfully", book: newBook });
});

// Task 3

// get all books
app.get("/api/books", (req, res) => {
  if (books.length === 0) {
    return res.status(200).json({ message: "No books found", books: [] });
  }
  res.status(200).json(books);
});

// get one book by id
app.get("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id == req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(200).json(book);
});


// Task 4 update book details

app.put("/api/books/:id", (req, res) => {
  // 1. find the book using the id in the URL
  const book = books.find((b) => b.id == req.params.id);

  // 2. handle book that does not exist
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // 3. do not allow book id to be changed
  if (req.body.id && req.body.id != book.id) {
    return res.status(400).json({ message: "Book ID cannot be changed" });
  }

  // 4. update permitted details using the request body
  const { title, author, category, quantity, available } = req.body;

  if (title) book.title = title;
  if (author) book.author = author;
  if (category) book.category = category;
  if (quantity !== undefined) book.quantity = quantity;
  if (available !== undefined) book.available = available;

  res.status(200).json({ message: "Book updated successfully", book });
});


// Task 5 delete book

app.delete("/api/books/:id", (req, res) => {
  // 1. find the specified book
  const index = books.findIndex((b) => b.id == req.params.id);

  // book does not exist
  if (index === -1) {
    return res.status(404).json({ message: "Book not found" });
  }

  const book = books[index];

  // 2. do not delete if some copies are issued (available < quantity)
  if (book.available < book.quantity) {
    return res.status(400).json({
      message: "Cannot delete book. Some copies are currently issued",
    });
  }

  // 3. delete the book and return success response
  books.splice(index, 1);
  res.status(200).json({ message: "Book deleted successfully" });
});

// Task 6 search books 

// IMPORTANT: place this ABOVE the GET /api/books/:id route
app.get("/api/books/search", (req, res) => {
  // 1. get the title from the query parameter
  const title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Please provide a title to search" });
  }

  // 2. case-insensitive search, return all matching books
  const result = books.filter((b) =>
    b.title.toLowerCase().includes(title.toLowerCase())
  );

  // 3. handle case when no books match
  if (result.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }

  res.status(200).json(result);
});

// Task 7 issue and return books
// ISSUE a book
app.post("/api/books/:id/issue", (req, res) => {
  // 1. check the book exists
  const book = books.find((b) => b.id == req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // 2. reject if no copy is available
  if (book.available <= 0) {
    return res.status(400).json({ message: "No copies available to issue" });
  }

  // 3. decrease availability by one
  book.available--;

  res.status(200).json({ message: "Book issued successfully", book });
});

// RETURN a book
app.post("/api/books/:id/return", (req, res) => {
  // 1. check the book exists
  const book = books.find((b) => b.id == req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // 2. at least one copy must be issued (availability must not exceed quantity)
  if (book.available >= book.quantity) {
    return res.status(400).json({ message: "No issued copies to return" });
 }

  // 3. increase availability by one
  book.available++;

  res.status(200).json({ message: "Book returned successfully", book });
});