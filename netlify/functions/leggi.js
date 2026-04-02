exports.handler = async () => {
  const NOTION_KEY = process.env.NOTION_API_KEY;
  const DB_ID      = process.env.NOTION_DB_ID;

  if (!NOTION_KEY || !DB_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: "Variabili d'ambiente mancanti" }) };
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: { property: "Pubblicata", checkbox: { equals: true } },
        sorts:  [{ property: "Anno", direction: "descending" }],
        page_size: 100
      })
    });

    if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
    const data = await res.json();

    const leggi = data.results.map(p => {
      const pr = p.properties;
      const txt = key => pr[key]?.rich_text?.[0]?.plain_text ?? "";
      const url = key => pr[key]?.url ?? "";
      return {
        id:           p.id,
        codice:       pr["Codice"]?.title?.[0]?.plain_text ?? "",
        anno:         pr["Anno"]?.number ?? 0,
        titolo:       txt("Titolo"),
        descrizione:  txt("Descrizione"),
        area:         pr["Area"]?.select?.name ?? "",
        tags:         pr["Tags"]?.multi_select?.map(t => t.name) ?? [],
        vigenza:      pr["Vigenza"]?.select?.name ?? "",
        vigenzaNota:  txt("Vigenza nota"),
        nota:         txt("Nota operativa"),
        urlNormattiva:url("URL Normattiva"),
        urlGazzetta:  url("URL Gazzetta Ufficiale"),
        urlPdf:       url("URL PDF")
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300"
      },
      body: JSON.stringify(leggi)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
