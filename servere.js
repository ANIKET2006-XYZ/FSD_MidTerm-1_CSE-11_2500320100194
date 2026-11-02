import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const books = [{
  id: 1,
  title: "java programming",
  author: "herbert schildt",
  category: "programming",
  quantity: 5,
  available: 5,
}];

let nextId = books.length + 1;

app.post("/api/books", (req, res) => {
  const { id, title, author, category, quantity, available } = req.body;

  if (!title || !author || !category || quantity == null || Number(quantity) < 0 || Number.isNaN(Number(quantity))) {
    return res.status(400).json({ message: "Invalid book details" });
  }

  const bookId = Number(id) || nextId;

  if (books.find((b) => b.id === bookId)) {
    return res.status(409).json({ message: "Book ID already exists" });
  }

  const book = {
    id: bookId,
    title,
    author,
    category,
    quantity: Number(quantity),
    available: available == null ? Number(quantity) : Number(available),
  };

  books.push(book);
  nextId = Math.max(nextId, bookId + 1);
  res.status(201).json({ message: "Book added", book });
});

app.get("/api/books", (req, res) => {
  res.json(books.length ? books : { message: "No books found", books: [] });
});

app.get("/api/books/search", (req, res) => {
  const text = (req.query.q || "").toString().toLowerCase();
  const has = (value) => value.toLowerCase().includes(text);

  res.json(books.filter((b) => has(b.title) || has(b.author) || has(b.category)));
});

app.get("/api/books/:id", (req, res) => {
  const bookId = Number(req.params.id);

  if (Number.isNaN(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.json(book);
});

app.put("/api/books/:id", (req, res) => {
  const bookId = Number(req.params.id);
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const { title, author, category, quantity, available } = req.body;

  if (title) book.title = title;
  if (author) book.author = author;
  if (category) book.category = category;
  if (quantity != null && Number(quantity) >= 0) book.quantity = Number(quantity);
  if (available != null && Number(available) >= 0) book.available = Number(available);

  res.json({ message: "Book updated", book });
});

app.delete("/api/books/:id", (req, res) => {
  const bookId = Number(req.params.id);
  const index = books.findIndex((b) => b.id === bookId);

  if (index === -1) {
    return res.status(404).json({ message: "Book not found" });
  }

  books.splice(index, 1);
  res.json({ message: "Book deleted" });
});

app.get("/api/books/search", (req, res) => {
  const text = (req.query.q || "").toString().toLowerCase();
  const has = (value) => value.toLowerCase().includes(text);

  res.json(books.filter((b) => has(b.title)));
});

app.post("/api/books/:id/issue", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.available === 0) {
    return res.status(400).json({ message: "No copies available" });
  }

  book.available -= 1;
  res.json({ message: "Book issued", book });
});
app.post("/api/books/:id/return", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.available >= book.quantity) {
    return res.status(400).json({ message: "All copies are already returned" });
  }

  book.available += 1;
  res.json({ message: "Book returned", book });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));