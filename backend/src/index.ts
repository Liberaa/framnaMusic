import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Gör att servern kan läsa JSON i request-bodyn (behövs senare för incheckningar)
app.use(express.json());

// Enkel endpoint för att kolla att servern lever
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
