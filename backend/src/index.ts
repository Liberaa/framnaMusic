import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import { addEmployee, findByTagId, getAllEmployees, updateSong } from "./employees";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Gör att servern kan läsa JSON i request-bodyn
app.use(express.json());

// Visar hemsidan (filerna i backend/public) på http://localhost:3000
app.use(express.static(path.join(__dirname, "..", "public")));

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

// Enkel endpoint för att kolla att servern lever
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Lista alla anställda och deras låtar
app.get("/employees", (_req, res) => {
  res.json(getAllEmployees());
});

// Länka ett NFC-kort till en anställd (det hemsidan ska göra senare)
app.post("/employees", (req, res) => {
  const { name, tagId, song } = req.body ?? {};

  if (!isText(name) || !isText(tagId) || !isText(song)) {
    res.status(400).json({ error: "name, tagId och song måste skickas med" });
    return;
  }

  if (findByTagId(tagId)) {
    res.status(409).json({ error: "Kortet är redan länkat till någon" });
    return;
  }

  res.status(201).json(addEmployee(name, tagId, song));
});

// Byt låt för en anställd
app.patch("/employees/:id", (req, res) => {
  const { song } = req.body ?? {};

  if (!isText(song)) {
    res.status(400).json({ error: "song måste skickas med" });
    return;
  }

  const employee = updateSong(Number(req.params.id), song);
  if (!employee) {
    res.status(404).json({ error: "Hittade ingen anställd med det id:t" });
    return;
  }

  res.json(employee);
});

// Incheckning: anropas när någon blippar sitt kort (av Raspberry Pi:n senare)
app.post("/checkin", (req, res) => {
  const { tagId } = req.body ?? {};

  if (!isText(tagId)) {
    res.status(400).json({ error: "tagId måste skickas med" });
    return;
  }

  const employee = findByTagId(tagId);
  if (!employee) {
    res.status(404).json({ error: "Okänt kort, länka det först via hemsidan" });
    return;
  }

  console.log(`${employee.name} checkade in, spelar: ${employee.song}`);
  res.json({ message: `Välkommen ${employee.name}!`, name: employee.name, song: employee.song });
});

// Svarar med JSON istället för en HTML-sida om bodyn inte är giltig JSON
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "Bodyn är inte giltig JSON" });
    return;
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
