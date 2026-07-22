# Rezept direkt in das Kochbuch eintragen

Diese Datei ist die verbindliche Arbeitsanweisung für neue Rezepte im Repository `Maycetin1205/Kochbuch`.

## Ablauf

1. `default-recipes.js` lesen und prüfen, ob das Rezept bereits vorhanden ist.
2. Das vom Benutzer gelieferte Rezept vollständig übernehmen. Keine Zutaten, Mengen, Zeiten oder Schritte erfinden.
3. Eine eindeutige ID im Format `r-<kurzer-slug>` verwenden.
4. Neues Rezept: an `DEFAULT_RECIPES` anhängen und `publishedVersion: 1` setzen.
5. Bestehendes Rezept: vorhandenen Eintrag ersetzen und `publishedVersion` erhöhen.
6. Ein hochgeladenes eigenes Foto unter `images/<slug>.jpg` oder `images/<slug>.webp` speichern und im Rezept als relativen Pfad eintragen.
7. Keine fremden Bilder herunterladen.
8. JavaScript-Syntax prüfen.
9. Direkt auf `main` committen.

## Pflichtfelder

- `id`
- `publishedVersion`
- `titel`
- `kategorie`
- `portionen` als positive Zahl
- mindestens eine Zutat
- mindestens ein Zubereitungsschritt

## Rezeptschema

```js
{
  id: "r-beispiel",
  publishedVersion: 1,
  titel: "Beispielgericht",
  kategorie: "Hauptgericht",
  schwierigkeit: "Einfach",
  portionen: 4,
  zeitGesamt: "ca. 40 Min",
  bild: "./images/beispielgericht.webp",
  einleitung: "Kurze Beschreibung.",
  quelle: "",
  quelleName: "Eigenes Rezept",
  werkzeuge: ["Topf", "Messer"],
  zutaten: [
    {
      menge: "500",
      einheit: "g",
      name: "Kartoffeln",
      hinweis: "festkochend",
      optional: false
    }
  ],
  schritte: [
    {
      titel: "Vorbereiten",
      aktion: "Kartoffeln schälen und in gleich große Stücke schneiden.",
      startwert: "ca. 10 Min",
      tipp: "Gleich große Stücke garen gleichmäßig."
    }
  ],
  tipps: ["Optionaler allgemeiner Tipp"]
}
```

## Nicht verwenden

In Zubereitungsschritten keine Felder wie diese anlegen:

- `sinne`
- `sehen`
- `hoeren`
- `riechen`
- `fuehlen`
- `schmecken`
- `warum`
- `fehler`
- `fertigWenn`

Jeder Schritt soll schlicht erklären, was zu tun ist. `tipp` ist optional und kurz zu halten.

Am Ende muss `default-recipes.js` weiterhin genau eine JavaScript-Konstante `DEFAULT_RECIPES` mit einem Array enthalten.