#!/usr/bin/env python3
"""Baixa os cards do Trello e gera dados.csv no mesmo formato usado pelo painel.
Segredos via variáveis de ambiente: TRELLO_KEY, TRELLO_TOKEN (obrigatórias) e TRELLO_BOARD_ID (opcional)."""
import csv, json, os, sys, time, urllib.parse, urllib.request, urllib.error

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
        p = dict(filter="all", limit=1000, customFieldItems="true", members="true", member_fields="fullName",
                 attachments="true", attachment_fields="url",
                 fields="id,name,shortUrl,desc,labels,due,dueComplete,dueReminder,start,idList,closed,dateLastActivity,badges")
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

def build_rows(cards, lists, fields, board):
    lname = {l["id"]: l["name"] for l in lists}
    fdefs = {f["id"]: f for f in fields}
    rows = []
    for c in cards:
        b = c.get("badges") or {}
        row = {k: "" for k in COLS}
        row.update({
            "Card ID": c["id"], "Card Name": c["name"], "Card URL": c.get("shortUrl", ""), "Card Description": c.get("desc", ""),
            "Labels": ", ".join(f"{l.get('name','')} ({l.get('color','')})" for l in c.get("labels", []) if l.get("name")),
            "Members": ", ".join(m.get("fullName", "") for m in c.get("members", [])),
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
            if fd and fd["name"] in row: row[fd["name"]] = custom_value(it, fd)
        rows.append(row)
    return rows

def main():
    for k in ("TRELLO_KEY", "TRELLO_TOKEN"):
        if not os.environ.get(k): sys.exit(f"Variável {k} não definida")
    bid = os.environ.get("TRELLO_BOARD_ID") or BOARD_DEFAULT
    board = get(f"/boards/{bid}", fields="id,name")
    lists = get(f"/boards/{bid}/lists", filter="all", fields="name")
    fields = get(f"/boards/{bid}/customFields")
    missing = [c for c in CUSTOM_COLS if c not in {f["name"] for f in fields}]
    if missing: print("Aviso: campos personalizados não encontrados no quadro:", missing)
    rows = build_rows(fetch_all_cards(bid), lists, fields, board)
    old = 0
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8-sig", newline="") as f: old = sum(1 for _ in csv.DictReader(f))
    if len(rows) < 50 or (old and len(rows) < old * 0.7):
        sys.exit(f"Abortado: {len(rows)} cards baixados vs {old} no arquivo atual. dados.csv não foi alterado.")
    rows.sort(key=lambda r: r["Card ID"])
    with open(OUT, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(rows)
    print(f"OK: {len(rows)} cards gravados em {OUT}")

if __name__ == "__main__":
    main()
