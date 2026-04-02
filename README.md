# LexAbilis — Istruzioni di deploy

## Struttura del progetto

```
lexabilis/
├── public/
│   ├── index.html      # Pagina principale
│   ├── style.css       # Stili
│   └── app.js          # Logica frontend
├── netlify/
│   └── functions/
│       └── leggi.js    # Funzione serverless → Notion API
├── netlify.toml        # Configurazione Netlify
└── README.md
```

## Deploy su Netlify (passo per passo)

### 1. Carica su GitHub
- Vai su github.com → New repository → "lexabilis"
- Carica tutti i file mantenendo la struttura delle cartelle

### 2. Crea sito su Netlify
- Vai su app.netlify.com
- "Add new site" → "Import an existing project" → scegli il repo GitHub

### 3. Configura le variabili d'ambiente
In Netlify → Site configuration → Environment variables, aggiungi:

| Variabile         | Valore                                      |
|-------------------|---------------------------------------------|
| NOTION_API_KEY    | La tua chiave Integration (ntn_...)         |
| NOTION_DB_ID      | ff92d81811e1418d869952bd9d33da95            |

> Il NOTION_DB_ID è l'ID del database già creato nel tuo workspace.

### 4. Collega il dominio lexabilis.it
In Netlify → Domain management → Add custom domain → inserisci "lexabilis.it"

Netlify ti mostrerà dei nameserver (tipo):
- dns1.p01.nsone.net
- dns2.p01.nsone.net

### 5. Aggiorna i DNS su Hostinger
- Vai su Hostinger → DNS Zone del dominio lexabilis.it
- Sostituisci i nameserver con quelli di Netlify
- Oppure aggiungi record CNAME: @ → [il tuo sito].netlify.app

La propagazione DNS richiede da 10 minuti a 24 ore.

## Aggiornare le leggi (uso quotidiano)

Per aggiungere o modificare una legge basta aprire il database Notion
"LexAbilis — Leggi sulla Disabilità" e modificare la riga.

Il sito si aggiorna automaticamente entro 5 minuti (cache Netlify).

Per forzare l'aggiornamento immediato: Netlify → Deploys → Trigger deploy.

## ID database Notion
ff92d81811e1418d869952bd9d33da95
