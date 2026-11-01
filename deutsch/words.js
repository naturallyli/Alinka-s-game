/* =====================================================================
   DEUTSCH PARTY – liste des mots
   ---------------------------------------------------------------------
   Chaque semaine : ajouter les nouveaux mots avec  week: <numéro>.
   Les mots de la semaine la plus récente reviennent plus souvent ;
   tous les anciens mots restent en jeu.
   Après un changement, augmenter VERSION dans sw.js.

   Noms   : de, art (der/die/das), pl (pluriel, null si aucun), fr, emoji,
            loc  = "im" | "in der" | "auf dem" (règle "où ?"), null si non utilisé
            acts = verbes qui vont avec ce lieu (pour les phrases)
            frLoc = "dans la cuisine" … (pour les idées de dessin)
            poss = utilisable avec sein/ihr
            where = "stadt" | "haus" | "zimmer" (pour "es gibt")
            frf  = true si le mot français en l' est féminin
   Verbes : inf, fr, forms = [ich, du, er/sie/es, wir, ihr, sie]
   ===================================================================== */
window.DE_DATA = {
  weeks: [
    { week: 0, label: "Depuis la rentrée (Lektion 7 : Mein Haus, meine Stadt)" },
    { week: 1, label: "Semaine 1 : la semaine, les jours, l'école" }
  ],

  nouns: [
    // --- Lektion 7, page 4 : la maison
    { de: "Haus", art: "das", pl: "Häuser", fr: "la maison", emoji: "🏠", week: 0, loc: "im", acts: ["sein", "essen", "schlafen"], frLoc: "dans la maison", poss: true },
    { de: "Garten", art: "der", pl: "Gärten", fr: "le jardin", emoji: "🌳", week: 0, loc: "im", acts: ["essen", "sitzen", "lesen", "sein"], frLoc: "dans le jardin", poss: true, where: "haus" },
    { de: "Zimmer", art: "das", pl: "Zimmer", fr: "la pièce", emoji: null, week: 0, loc: "im", acts: ["sein", "lesen"], frLoc: "dans une pièce", poss: true, where: "haus" },
    { de: "Wohnzimmer", art: "das", pl: "Wohnzimmer", fr: "le salon", emoji: "🛋️", week: 0, loc: "im", acts: ["sitzen", "lesen", "sein"], frLoc: "dans le salon", poss: true, where: "haus" },
    { de: "Schlafzimmer", art: "das", pl: "Schlafzimmer", fr: "la chambre", emoji: "🛌", week: 0, loc: "im", acts: ["schlafen", "lesen", "sein"], frLoc: "dans la chambre", poss: true, where: "haus" },
    { de: "Esszimmer", art: "das", pl: "Esszimmer", fr: "la salle à manger", emoji: "🍽️", week: 0, loc: "im", acts: ["essen", "sitzen", "sein"], frLoc: "dans la salle à manger", poss: true, where: "haus" },
    { de: "Kinderzimmer", art: "das", pl: "Kinderzimmer", fr: "la chambre des enfants", emoji: "🧸", week: 0, loc: "im", acts: ["schlafen", "lesen", "sein"], frLoc: "dans la chambre des enfants", poss: true, where: "haus" },
    { de: "Küche", art: "die", pl: "Küchen", fr: "la cuisine", emoji: "🍳", week: 0, loc: "in der", acts: ["kochen", "essen", "sein"], frLoc: "dans la cuisine", poss: true, where: "haus" },
    { de: "Bad", art: "das", pl: "Bäder", fr: "la salle de bains", emoji: "🛁", week: 0, loc: "im", acts: ["duschen", "sein"], frLoc: "dans la salle de bains", poss: true, where: "haus" },
    { de: "Balkon", art: "der", pl: "Balkone", fr: "le balcon", emoji: null, week: 0, loc: "auf dem", acts: ["sitzen", "essen", "lesen", "sein"], frLoc: "sur le balcon", poss: true, where: "haus" },
    // --- page 5 : les meubles
    { de: "Tür", art: "die", pl: "Türen", fr: "la porte", emoji: "🚪", week: 0, loc: null, poss: true, where: "zimmer" },
    { de: "Fenster", art: "das", pl: "Fenster", fr: "la fenêtre", emoji: "🪟", week: 0, loc: null, poss: true, where: "zimmer" },
    { de: "Tisch", art: "der", pl: "Tische", fr: "la table", emoji: null, week: 0, loc: null, poss: true, where: "zimmer" },
    { de: "Stuhl", art: "der", pl: "Stühle", fr: "la chaise", emoji: "🪑", week: 0, loc: "auf dem", acts: ["sitzen"], frLoc: "sur une chaise", poss: true, where: "zimmer" },
    { de: "Schrank", art: "der", pl: "Schränke", fr: "le placard", emoji: null, week: 0, loc: null, poss: true, where: "zimmer" },
    { de: "Teppich", art: "der", pl: "Teppiche", fr: "le tapis", emoji: null, week: 0, loc: "auf dem", acts: ["sitzen"], frLoc: "sur un tapis", poss: true, where: "zimmer" },
    { de: "Regal", art: "das", pl: "Regale", fr: "l'étagère", frf: true, emoji: null, week: 0, loc: null, poss: true, where: "zimmer" },
    { de: "Bett", art: "das", pl: "Betten", fr: "le lit", emoji: "🛏️", week: 0, loc: "im", acts: ["schlafen", "lesen"], frLoc: "dans son lit", poss: true, where: "zimmer" },
    { de: "Bild", art: "das", pl: "Bilder", fr: "l'image, la photo", frf: true, emoji: "🖼️", week: 0, loc: null, poss: true, where: "zimmer" },
    { de: "Lampe", art: "die", pl: "Lampen", fr: "la lampe", emoji: "💡", week: 0, loc: null, poss: true, where: "zimmer" },
    { de: "Wand", art: "die", pl: "Wände", fr: "la paroi (le mur)", emoji: "🧱", week: 0, loc: null },
    // --- page 7 : la ville
    { de: "Stadt", art: "die", pl: "Städte", fr: "la ville", emoji: "🏙️", week: 0, loc: "in der", acts: ["sein"], frLoc: "en ville" },
    { de: "U-Bahn", art: "die", pl: "U-Bahnen", fr: "le métro", emoji: "🚇", week: 0, loc: "in der", acts: ["sitzen", "lesen", "sein"], frLoc: "dans le métro", where: "stadt" },
    { de: "Strassenbahn", art: "die", pl: "Strassenbahnen", fr: "le tram", emoji: "🚋", week: 0, loc: "in der", acts: ["sitzen", "lesen", "sein"], frLoc: "dans le tram", where: "stadt" },
    { de: "Wohnung", art: "die", pl: "Wohnungen", fr: "l'appartement", emoji: "🏢", week: 0, loc: "in der", acts: ["sein", "essen", "schlafen"], frLoc: "dans l'appartement", poss: true },
    { de: "Schule", art: "die", pl: "Schulen", fr: "l'école", frf: true, emoji: "🏫", week: 0, loc: "in der", acts: ["sein", "lesen", "essen"], frLoc: "à l'école", poss: true, where: "stadt" },
    { de: "Sporthalle", art: "die", pl: "Sporthallen", fr: "la salle de sport", emoji: "🤸", week: 0, loc: "in der", acts: ["sein", "duschen"], frLoc: "dans la salle de sport", where: "stadt" },
    // --- page 8 : la ville (suite)
    { de: "Strasse", art: "die", pl: "Strassen", fr: "la rue", emoji: "🛣️", week: 0, loc: null },
    { de: "Zoo", art: "der", pl: "Zoos", fr: "le zoo", emoji: "🦒", week: 0, loc: "im", acts: ["sein", "essen"], frLoc: "au zoo", where: "stadt" },
    { de: "Bahnhof", art: "der", pl: "Bahnhöfe", fr: "la gare", emoji: "🚉", week: 0, loc: null, where: "stadt" },
    { de: "Bus", art: "der", pl: "Busse", fr: "le bus", emoji: "🚌", week: 0, loc: "im", acts: ["sitzen", "lesen", "sein"], frLoc: "dans le bus" },
    { de: "Platz", art: "der", pl: "Plätze", fr: "la place", emoji: "⛲", week: 0, loc: "auf dem", acts: ["sein", "sitzen", "essen"], frLoc: "sur la place", where: "stadt" },
    { de: "Park", art: "der", pl: "Parks", fr: "le parc", emoji: "🏞️", week: 0, loc: "im", acts: ["sein", "sitzen", "lesen", "essen"], frLoc: "dans le parc", where: "stadt" },
    { de: "Hof", art: "der", pl: "Höfe", fr: "la cour", emoji: null, week: 0, loc: "auf dem", acts: ["sein", "essen", "sitzen"], frLoc: "dans la cour", where: "haus" },
    { de: "Stadion", art: "das", pl: "Stadien", fr: "le stade", emoji: "🏟️", week: 0, loc: "im", acts: ["sein", "sitzen"], frLoc: "au stade", where: "stadt" },
    { de: "Schwimmbad", art: "das", pl: "Schwimmbäder", fr: "la piscine", emoji: "🏊", week: 0, loc: "im", acts: ["sein", "duschen"], frLoc: "à la piscine", where: "stadt" },
    { de: "Wetter", art: "das", pl: null, fr: "le temps, la météo", emoji: "🌦️", week: 0, loc: null },
    // --- Semaine 1 : la semaine, les jours
    { de: "Woche", art: "die", pl: "Wochen", fr: "la semaine", emoji: "📅", week: 1, loc: null },
    { de: "Montag", art: "der", pl: null, fr: "lundi", emoji: null, week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Dienstag", art: "der", pl: null, fr: "mardi", emoji: null, week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Mittwoch", art: "der", pl: null, fr: "mercredi", emoji: null, week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Donnerstag", art: "der", pl: null, fr: "jeudi", emoji: null, week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Freitag", art: "der", pl: null, fr: "vendredi", emoji: null, week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Samstag", art: "der", pl: null, fr: "samedi", emoji: null, week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Sonntag", art: "der", pl: null, fr: "dimanche", emoji: null, week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Morgen", art: "der", pl: null, fr: "le matin", emoji: "🌅", week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Vormittag", art: "der", pl: null, fr: "la matinée", emoji: "🌤️", week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Abend", art: "der", pl: null, fr: "le soir", emoji: "🌆", week: 1, loc: null, tip: "Les jours et les moments de la journée sont <b class=\"der\">der</b>." },
    { de: "Fach", art: "das", pl: "Fächer", fr: "la matière (à l'école)", emoji: "📐", week: 1, loc: null }
  ],

  verbs: [
    { inf: "kochen",   fr: "cuisiner",           frAct: "fait la cuisine",   emoji: "🧑‍🍳", week: 0, forms: ["koche", "kochst", "kocht", "kochen", "kocht", "kochen"] },
    { inf: "schlafen", fr: "dormir",             frAct: "dort",              emoji: "😴", week: 0, forms: ["schlafe", "schläfst", "schläft", "schlafen", "schlaft", "schlafen"] },
    { inf: "duschen",  fr: "prendre une douche", frAct: "prend une douche",  emoji: "🚿", week: 0, forms: ["dusche", "duschst", "duscht", "duschen", "duscht", "duschen"] },
    { inf: "essen",    fr: "manger",             frAct: "mange un gâteau",   emoji: "🍝", week: 0, forms: ["esse", "isst", "isst", "essen", "esst", "essen"] },
    { inf: "sitzen",   fr: "être assis/e",       frAct: "est assis",  frActF: "est assise", emoji: "💺", week: 0, forms: ["sitze", "sitzt", "sitzt", "sitzen", "sitzt", "sitzen"] },
    { inf: "lesen",    fr: "lire",               frAct: "lit un livre",      emoji: "📖", week: 0, forms: ["lese", "liest", "liest", "lesen", "lest", "lesen"] },
    { inf: "gehen",    fr: "aller",              frAct: "se promène",        emoji: "🚶", week: 0, forms: ["gehe", "gehst", "geht", "gehen", "geht", "gehen"], ctx: ["zu Fuss zur Schule", "zu Fuss in den Park"] }
  ],

  // Autres mots (adjectifs, petites phrases) : seulement dans « Vocabulaire »
  words: [
    { de: "bunt", fr: "multicolore", emoji: "🌈", week: 0 },
    { de: "hell", fr: "clair/e", emoji: "🔆", week: 0 },
    { de: "dunkel", fr: "foncé/e", emoji: "🌑", week: 0 },
    { de: "süss", fr: "mignon/ne", emoji: "🥰", week: 0 },
    { de: "neu", fr: "nouveau, nouvelle", emoji: "✨", week: 0 },
    { de: "alt", fr: "vieux, vieille", emoji: "🏚️", week: 0 },
    { de: "laut", fr: "bruyant/e", emoji: "📢", week: 0 },
    { de: "lustig", fr: "drôle", emoji: "😂", week: 0 },
    { de: "toll", fr: "génial/e, formidable", emoji: "🤩", week: 0 },
    { de: "aber", fr: "mais", emoji: null, week: 0 },
    { de: "Wirklich?", fr: "Vraiment ?", emoji: "🤨", week: 0 },
    { de: "Das glaube ich nicht.", fr: "Je ne crois pas.", emoji: "🙅", week: 0 },
    { de: "zu Fuss gehen", fr: "aller à pied", emoji: "👣", week: 0 },
    { de: "es gibt", fr: "il y a", emoji: null, week: 0 },
    // --- Semaine 1
    { de: "heute", fr: "aujourd'hui", emoji: null, week: 1 },
    { de: "morgen", fr: "demain", emoji: null, week: 1 },
    { de: "Englisch", fr: "l'anglais", emoji: "🇬🇧", week: 1 },
    { de: "nach Hause gehen", fr: "rentrer à la maison", emoji: "🏡", week: 1 }
  ],

  // Règles de grammaire (le code de chaque règle est dans app.js)
  grammar: [
    { id: "poss",   week: 0, title: "sein / seine – ihr / ihre" },
    { id: "lieu",   week: 0, title: "im – in der – auf dem" },
    { id: "esgibt", week: 0, title: "es gibt …" },
    { id: "morgen", week: 1, title: "morgen (demain) ≠ der Morgen (le matin)" }
  ]
};
