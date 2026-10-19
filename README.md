# Framna Music

Musikspelare för incheckning på jobbet. Man blippar sitt NFC-kort när man kommer in, och då spelas ens egen låt i högtalaren.

**Flöde:** NFC-tagg → NFC-läsare → Raspberry Pi → backend → högtalare. Kort länkas och låtar väljs via en hemsida.

## Kom igång (backend)

Kräver [Node.js](https://nodejs.org/) 22 eller senare.

```
cd backend
npm install
npm run dev
```

Servern körs på `http://localhost:3000` och startar om automatiskt när du sparar en fil.

> Just nu sparas datan i minnet. Allt du lägger till försvinner när servern startas om.

## API

| Metod | Sökväg | Body | Vad den gör |
|---|---|---|---|
| GET | `/health` | | Kollar att servern lever |
| GET | `/employees` | | Listar alla anställda och deras låtar |
| POST | `/employees` | `{ "name", "tagId", "song" }` | Länkar ett kort till en anställd |
| PATCH | `/employees/:id` | `{ "song" }` | Byter låt |
| POST | `/checkin` | `{ "tagId" }` | Incheckning när någon blippar sitt kort |

Två testkort finns från start: `04:A1:B2:C3` (Anna) och `04:D4:E5:F6` (Erik).

## Testa med Postman

1. Starta servern med `npm run dev`.
2. I Postman: **Import** → välj `postman/framna-music.postman_collection.json`.
3. Kör anropen ett och ett, eller hela samlingen med **Run collection**.

Om du kör samlingen två gånger i rad misslyckas "Länka nytt kort" eftersom kortet redan finns. Starta om servern för att nollställa datan.
