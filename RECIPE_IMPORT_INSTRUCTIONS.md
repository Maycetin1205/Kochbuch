# Rezept direkt in das Kochbuch eintragen

Diese Datei ist die verbindliche Arbeitsanweisung für einen neuen ChatGPT-Chat, der ein Rezept samt Benutzerfoto direkt in `Maycetin1205/Kochbuch` veröffentlichen soll.

## Ziel

Das Rezept wird als Standardrezept in `default-recipes.js` eingetragen. Ein mitgeliefertes Foto wird im Ordner `images/` gespeichert. Danach wird direkt auf den Branch `main` committed. Nicht nur JSON ausgeben und keine Anleitung an den Benutzer zurückgeben, sofern die GitHub-Verbindung verfügbar ist.

## Vorgehen

1. Repository `Maycetin1205/Kochbuch` lesen.
2. Diese Datei und `default-recipes.js` prüfen.
3. Das vom Benutzer gelieferte Rezept vollständig und sachlich in das untenstehende Schema übertragen. Keine Zutaten, Mengen oder Arbeitsschritte erfinden. Unklare Angaben sinnvoll kennzeichnen oder leer lassen.
4. Eine eindeutige ID im Format `r-<kurzer-slug>` verwenden.
5. Prüfen, ob bereits ein Rezept mit gleicher ID, Quelle oder gleichem Titel vorhanden ist:
   - Neues Rezept: an das Array `DEFAULT_RECIPES` anhängen und `publishedVersion: 1` setzen.
   - Bestehendes Rezept aktualisieren: genau diesen Eintrag ersetzen und `publishedVersion` um 1 erhöhen.
6. Bei einem hochgeladenen Foto:
   - in JPEG oder WebP umwandeln,
   - längste Seite maximal 1600 Pixel,
   - Metadaten möglichst entfernen,
   - unter `images/<slug>.jpg` oder `images/<slug>.webp` speichern,
   - im Rezept `bild: "./images/<dateiname>"` setzen.
7. Ohne Foto `bild: ""` setzen. Keine fremden Bilder automatisch herunterladen.
8. JavaScript-Syntax von `default-recipes.js` prüfen.
9. Direkt auf `main` committen. Commit-Nachricht: `Rezept hinzufügen: <Titel>` beziehungsweise `Rezept aktualisieren: <Titel>`.
10. Abschließend nur knapp nennen, welche Dateien geändert wurden und dass das Rezept nach Neuladen der App erscheint.

## Rezeptschema

```js
{
  id: "r-beispiel",
  publishedVersion: 1,
  kategorie: "Hauptgericht",
  titel: "Beispielgericht",
  schwierigkeit: "Einfach",
  portionen: 4,
  zeitGesamt: "ca. 40 Min",
  bild: "./images/beispielgericht.jpg",
  einleitung: "Kurze Beschreibung.",
  quelle: "",
  quelleName: "Eigenes Rezept",
  werkzeuge: ["Topf", "Messer"],
  zutaten: [
    { menge: "500", einheit: "g", name: "Zutat", hinweis: "optional" }
  ],
  schritte: [
    {
      titel: "Vorbereiten",
      aktion: "Konkrete Anweisung.",
      startwert: "ca. 5 Min",
      zutaten: ["500 g Zutat"],
      sinne: {
        sehen: "Sichtbares Merkmal",
        hoeren: "Hörbares Merkmal",
        riechen: "Geruchsmerkmal",
        fuehlen: "Tastmerkmal",
        schmecken: "Geschmacksmerkmal"
      },
      fertigWenn: "Eindeutiges Fertig-Kriterium.",
      warum: "Kurze Erklärung.",
      fehler: "Typischer Fehler und Gegenmaßnahme."
    }
  ],
  tipps: ["Optionaler Tipp"]
}
```

Nicht vorhandene Sinnesfelder dürfen weggelassen werden. Die Datei muss am Ende weiterhin genau eine JavaScript-Konstante `DEFAULT_RECIPES` mit einem Array enthalten.
