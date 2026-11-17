#!/usr/bin/env python3
"""Baixa os cards do Trello e gera dados.csv no mesmo formato usado pelo painel.
Segredos via variáveis de ambiente: TRELLO_KEY, TRELLO_TOKEN (obrigatórias) e TRELLO_BOARD_ID (opcional)."""
import csv, io, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request, urllib.error

BOARD_DEFAULT = "6941bd5f6a0cbffdabdd0228"   # ESTEIRA PRODUÇÃO DISCIPLINAS
OUT = os.environ.get("OUT_CSV", "dados.csv")
API = "https://api.trello.com/1"

BASE_COLS = ["Card ID","Card Name","Card URL","Card Description","Labels","Members","Due Date","Attachment Count",
 "Attachment Links","Checklist Item Total Count","Checklist Item Completed Count","Vote Count","Comment Count",
 "Last Activity Date","List ID","List Name","Board ID","Board Name","Archived","Start Date","Due Complete","Due Reminder"]
# Nomes EXATOS dos campos personalizados (inclui o "EXT O1" com letra O, como está no seu CSV atual)
CUSTOM_COLS = ["TIPO CONTEUDISTA","QTD CARACTERES","FEEDBACK QUALIDADE","DT INÍCIO QLD 01","DT FIM QLD 01","QUALIDADE 01",
 "DT INÍCIO QLD 02","DT FIM QLD 02","QUALIDADE 02","DT INÍCIO DI","DT FIM DI","DI","DT INÍCIO TESTER","DT FIM TESTER",
 "TESTER ÁREA","DT INÍCIO REV","DT FIM REV","REVISOR","DT INÍCIO ROTEIRO","DT FIM ROTEIRO","ROTEIRO REVISÃO","DT INÍCIO DG",
 "DT FIM DG","DG","DT INÍCIO LIBERAÇÃO","DT FIM LIBERAÇÃO","LIBERAÇÃO CONTEUDISTA","DT INÍCIO LIBERADO","DT FIM LIBERADO",
 "LIBERAÇÃO GRAVAÇÃO","DT INÍCIO GRAVAÇÃO","DT FIM GRAVAÇÃO","GRAVAÇÃO","DT INÍCIO EDIÇÃO","DT FIM EDIÇÃO","EDIÇÃO",
 "DT INÍCIO WEB","DT FIM WEB","WEB","DT INÍCIO TST CONTEÚDO","DT FIM TST CONTEÚDO","TESTER CONTEÚDO","DT INÍCIO EXT 01",
 "DT FIM EXT O1","EXTRA 01"]
COLS = BASE_COLS + CUSTOM_COLS

def norm_name(n):
    """Normaliza nome de campo: sem acento, maiúsculo, espaços únicos, 'O1' == '01'."""
    n = "".join(c for c in unicodedata.normalize("NFD", n or "") if unicodedata.category(c) != "Mn").upper()
    n = re.sub(r"\s+", " ", n).strip()
    return re.sub(r"\bO1\b", "01", n)

def get(path, **params):
    q = urllib.parse.urlencode({"key": os.environ["TRELLO_KEY"], "token": os.environ["TRELLO_TOKEN"], **params})
    url = f"{API}{path}?{q}"
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < 4:
                time.sleep(2 ** attempt * 2); continue
            raise SystemExit(f"Erro Trello HTTP {e.code} em {path} (verifique chave/token/ID do quadro)")
        except urllib.error.URLError:
            if attempt < 4: time.sleep(2 ** attempt * 2); continue
            raise

def fetch_all_cards(board_id):
    seen, cards, before = {}, [], None
    while True:
        p = dict(filter="all", limit=1000, customFieldItems="true", members="true", member_fields="username",
                 attachments="true", attachment_fields="url",
                 fields="id,name,url,shortUrl,desc,labels,due,dueComplete,dueReminder,start,idList,closed,dateLastActivity,badges")
        if before: p["before"] = before
        page = get(f"/boards/{board_id}/cards", **p)
        new = [c for c in page if c["id"] not in seen]
        for c in new: seen[c["id"]] = 1
        cards += new
        if not new or len(page) < 1000: break
        before = min(c["id"] for c in page)
    return cards

def custom_value(item, fdef):
    if not fdef: return ""
    if "idValue" in item:
        for o in fdef.get("options", []):
            if o["id"] == item["idValue"]: return o.get("value", {}).get("text", "")
        return ""
    v = item.get("value") or {}
    if "date" in v: return v["date"]
    if "text" in v: return v["text"]
    if "number" in v: return v["number"]
    if "checked" in v: return v["checked"]
    return ""

COLMAP = {norm_name(c): c for c in CUSTOM_COLS}

def build_rows(cards, lists, fields, board):
    lname = {l["id"]: l["name"] for l in lists}
    fdefs = {f["id"]: f for f in fields}
    rows = []
    for c in cards:
        b = c.get("badges") or {}
        row = {k: "" for k in COLS}
        row.update({
            "Card ID": c["id"], "Card Name": c["name"], "Card URL": c.get("url") or c.get("shortUrl", ""), "Card Description": c.get("desc", ""),
            "Labels": ", ".join(f"{l.get('name','')} ({l.get('color','')})" for l in c.get("labels", []) if l.get("name")),
            "Members": ", ".join(m.get("username", "") for m in c.get("members", [])),
            "Due Date": c.get("due") or "", "Attachment Count": b.get("attachments", 0),
            "Attachment Links": ", ".join(a.get("url", "") for a in c.get("attachments", [])),
            "Checklist Item Total Count": b.get("checkItems", 0), "Checklist Item Completed Count": b.get("checkItemsChecked", 0),
            "Vote Count": b.get("votes", 0), "Comment Count": b.get("comments", 0),
            "Last Activity Date": c.get("dateLastActivity") or "", "List ID": c["idList"], "List Name": lname.get(c["idList"], ""),
            "Board ID": board["id"], "Board Name": board["name"], "Archived": str(bool(c.get("closed"))).lower(),
            "Start Date": c.get("start") or "", "Due Complete": str(bool(c.get("dueComplete"))).lower(),
            "Due Reminder": c.get("dueReminder") if c.get("dueReminder") is not None else "",
        })
        for it in c.get("customFieldItems", []):
            fd = fdefs.get(it["idCustomField"])
            col = COLMAP.get(norm_name(fd["name"])) if fd else None
            if col: row[col] = custom_value(it, fd)
        rows.append(row)
    return rows

def try_csv_export(bid):
    """Tenta baixar o export CSV nativo do Trello (o mesmo de 'link do quadro + .csv').
    Devolve (colunas, linhas) ou None se não funcionar com chave/token."""
    try:
        short = get(f"/boards/{bid}", fields="shortLink")["shortLink"]
        key, tok = os.environ["TRELLO_KEY"], os.environ["TRELLO_TOKEN"]
        url = f"https://trello.com/b/{short}.csv?" + urllib.parse.urlencode({"key": key, "token": tok})
        hdr = {"Authorization": f'OAuth oauth_consumer_key="{key}", oauth_token="{tok}"', "User-Agent": "painel-producao"}
        with urllib.request.urlopen(urllib.request.Request(url, headers=hdr), timeout=120) as r:
            text = r.read().decode("utf-8-sig")
        rd = csv.DictReader(io.StringIO(text, newline=""))
        rows = list(rd)
        if rd.fieldnames and "Card ID" in rd.fieldnames and "Card Name" in rd.fieldnames and len(rows) >= 50:
            return list(rd.fieldnames), rows
        print("Export CSV respondeu, mas não parece o arquivo esperado (cabeçalho/linhas). Usando a API.")
    except Exception as e:
        print(f"Export CSV indisponível com chave/token ({type(e).__name__}: {e}). Usando a API.")
    return None

def main():
    for k in ("TRELLO_KEY", "TRELLO_TOKEN"):
        if not os.environ.get(k): sys.exit(f"Variável {k} não definida")
    bid = os.environ.get("TRELLO_BOARD_ID") or BOARD_DEFAULT
    got = try_csv_export(bid)
    if got:
        cols, rows = got
        print(f"Fonte: export CSV nativo do Trello ({len(rows)} cards)")
    else:
        board = get(f"/boards/{bid}", fields="id,name")
        lists = get(f"/boards/{bid}/lists", filter="all", fields="name")
        fields = get(f"/boards/{bid}/customFields")
        print("Campos personalizados no quadro:", [(f["name"], f.get("type")) for f in fields])
        found = {COLMAP[norm_name(f["name"])] for f in fields if norm_name(f["name"]) in COLMAP}
        missing = [c for c in CUSTOM_COLS if c not in found]
        if missing: print("Aviso: colunas sem campo correspondente no Trello:", missing)
        rows = build_rows(fetch_all_cards(bid), lists, fields, board)
        cols = COLS
        print(f"Fonte: API ({len(rows)} cards)")
    old = old_dt = 0
    dt = [c for c in cols if c.startswith("DT ")]
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8-sig", newline="") as f:
            for r in csv.DictReader(f):
                old += 1; old_dt += sum(1 for c in dt if r.get(c))
    new_dt = sum(1 for r in rows for c in dt if r.get(c))
    print(f"Cards: novo={len(rows)} atual={old} | Datas de etapas: novo={new_dt} atual={old_dt}")
    if len(rows) < 50 or (old and len(rows) < old * 0.7):
        sys.exit("Abortado: poucos cards baixados. dados.csv NÃO foi alterado.")
    if old_dt and new_dt < old_dt * 0.7:
        sys.exit("Abortado: as datas das etapas (DT ...) não vieram. dados.csv NÃO foi alterado. Envie o log para diagnóstico.")
    rows.sort(key=lambda r: r["Card ID"])
    with open(OUT, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader(); w.writerows(rows)
    print(f"OK: {len(rows)} cards gravados em {OUT}")

if __name__ == "__main__":
    main()
