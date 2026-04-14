exports.handler = async () => {
  const NOTION_KEY = process.env.NOTION_API_KEY;
  const DB_ID      = process.env.NOTION_NEWS_DB_ID;

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
        sorts:  [{ timestamp: "created_time", direction: "descending" }],
        page_size: 50
      })
    });

    if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
    const data = await res.json();

    const novita = data.results.map(p => {
      const pr = p.properties;
      const txt = key => pr[key]?.rich_text?.[0]?.plain_text ?? "";
      return {
        id:             p.id,
        titolo:         pr["Titolo"]?.title?.[0]?.plain_text ?? "",
        data:           pr["Data"]?.date?.start ?? "",
        categoria:      pr["Categoria"]?.select?.name ?? "",
        descrizione:    txt("Descrizione"),
        dettaglio:      txt("Dettaglio"),
        leggeCollegata: txt("Legge collegata"),
        urlRiferimento: pr["URL riferimento"]?.url ?? ""
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300"
      },
      body: JSON.stringify(novita)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
