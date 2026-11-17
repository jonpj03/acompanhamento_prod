# Painel de Produção - Cards

Ferramenta frontend estática em HTML, CSS e JavaScript. Não exige backend.

## Publicação

Mantenha estes arquivos na mesma pasta do servidor:

- `index.html`
- `styles.css`
- `app.js`
- `dados.csv`

O `index.html` carrega `dados.csv` automaticamente com `cache: no-store` e um parâmetro de atualização. Para atualizar a base, basta substituir `dados.csv` mantendo o mesmo nome e recarregar a página.

O upload manual continua disponível para testes locais.

## Regras operacionais implementadas

### Finalização

`FINALIZADOS`, `ARQUIVADOS` e qualquer lista/etapa de **TESTER** são tratados como **Finalizados** em todos os indicadores, percentuais e gráficos. Cards arquivados continuam exibindo o estado original na consulta detalhada para rastreabilidade.

### Banco de questões

Cards cujo nome contém `_BDQ_` são classificados como **Banco de questões**.

### Unidade, Vídeo e BDQ

A visão macro separa três frentes:

- Unidade (conteúdo)
- Vídeo
- Banco de questões

O painel mostra o consolidado por U1, U2, V1 etc. e também calcula entregas no nível `código da disciplina + unidade/vídeo`, permitindo responder quantas unidades foram concluídas e quantas ainda estão pendentes.

### Etapas e datas de área

Cada área é vinculada aos campos personalizados de início, fim e responsável. Exemplo:

- `WEB` / `WEB | PRODUÇÃO`
- `DT INÍCIO WEB`
- `DT FIM WEB`
- `WEB`

A mesma lógica é aplicada às demais áreas mapeadas no `STAGE_MAP` do `app.js`.

Interpretação operacional:

- lista simples da área, como `WEB`: fila da área;
- lista com `| PRODUÇÃO`: item em produção naquela área;
- `TESTER CONTEÚDO`: validação do conteúdo;
- `FINALIZADOS` e `ARQUIVADOS`: concluídos.

### Paradas e possíveis ajustes

Na visão Unidade / Vídeo / BDQ existe o campo **Considerar parado após X dias sem movimentação**. O padrão é 3 dias e pode ser alterado na tela.

A tabela de pendências mostra:

- tipo;
- unidade/vídeo;
- código da disciplina;
- quantidade pendente;
- fila/etapa atual;
- cards parados;
- dias sem movimentação;
- possíveis inconsistências de datas/responsáveis.

São sinalizados, entre outros, casos como produção/validação sem data de início, data final anterior à inicial, etapa em produção sem responsável e etapa atual em produção com data final já preenchida.

### Métrica diária por pessoa

No painel Analítico é possível selecionar várias pessoas simultaneamente e definir um período. A métrica usa os registros de término das etapas (`DT FIM ...`) e apresenta:

- etapas concluídas;
- média por dia com entrega;
- horas registradas;
- gráfico diário por pessoa;
- resumo por pessoa;
- itens atualmente em produção.

## Parâmetros de URL

Continuam suportados parâmetros como:

`?dtInicio=2026-09-18&responsaveis=VINICIUS`

Também é possível definir outro CSV:

`?csv=minha-base.csv`


## Regra de período por área/pessoa

Os filtros de Data inicial e Data final são aplicados às datas da atuação da área/pessoa selecionada, e não à última modificação genérica do card. Exemplo: ao selecionar WEB ou uma pessoa responsável pelo WEB, o recorte usa `DT INÍCIO WEB` e `DT FIM WEB`. O mesmo princípio vale para as demais áreas mapeadas.

No gráfico **Produção ao longo do tempo**, um período informado nos filtros é respeitado integralmente. Sem período informado, o gráfico exibe somente o mês atual.


## Rótulos nos gráficos

Os gráficos de linha e barras exibem rótulos numéricos diretamente sobre os pontos/barras. Valores iguais a zero são ocultados para reduzir poluição visual; os demais mostram a quantidade exata de realizações.


## Produtividade por pessoa

A versão atual possui uma área exclusiva **Produtividade**. Nela é possível selecionar uma ou mais pessoas e um período, acompanhando:

- conclusões por dia;
- média por dia ativo;
- horas registradas;
- conclusões por etapa (Web, Edição, Tester Conteúdo etc.);
- conclusões por tipo (Unidade, Vídeo, Banco de questões e outros);
- detalhamento individual de cada conclusão com data, pessoa, etapa, tipo, unidade/vídeo, código, card e horas.

Os rótulos do gráfico diário foram ampliados e recebem fundo de contraste para permanecer legíveis sem depender de passar o mouse.

## Acompanhamento Operações — Microsoft Planner

A ferramenta agora possui uma seção separada de **OPERAÇÕES** no menu lateral:

- **Acompanhamento Operações** — fila atual, demandas sem responsável, atrasos, entradas e finalizações no período, saldo da fila, buckets e carga por pessoa;
- **Produtividade Operações** — conclusões por colaborador, categoria, dia e resumo por pessoa;
- **Consultar demandas** — consulta detalhada das tarefas do Planner.

### Fonte do Planner

A fonte padrão é o arquivo `operacoes.xlsx`, exportado diretamente do Microsoft Planner. Ele deve ficar na mesma pasta do `index.html`.

Para atualizar manualmente no servidor frontend:

1. Exporte o Planner para Excel.
2. Renomeie o arquivo para `operacoes.xlsx`.
3. Substitua o arquivo antigo na pasta da ferramenta.
4. Recarregue a página.

O dashboard lê preferencialmente a aba **Dados Consolidados** e também utiliza a aba **Plano** para identificar a data da exportação.

A leitura do XLSX ocorre no navegador. A ferramenta utiliza SheetJS/XLSX via CDN, assim como já utiliza Chart.js e Papa Parse via CDN.

### Atualização automática futura

A estrutura já foi preparada para que `operacoes.xlsx` possa ser sobrescrito automaticamente por uma integração. Em uma segunda etapa, Power Automate ou Microsoft Graph pode gerar/atualizar a fonte do Planner no servidor sem alterar o frontend.

### Período em Operações

Por padrão, o período é o mês da data de exportação do Planner. O período afeta métricas de fluxo e produtividade, como **Entradas no período**, **Finalizadas no período** e gráficos diários. A fila atual continua representando o estado atual das tarefas após os demais filtros.

## Atualização - acompanhamento de demandas de Operações

- Os filtros `De` e `Até` iniciam vazios. Sem datas preenchidas, a visão considera todo o histórico disponível no Planner.
- O botão `Limpar` zera busca, categoria, demanda, status, responsável, prioridade e as duas datas.
- O campo `Demanda` é derivado automaticamente do nome da tarefa: todo texto após o primeiro caractere `|` é considerado o nome da demanda. Exemplo: `ATT | ESQUENTA` -> `ESQUENTA`.
- A tela Acompanhamento Operações inclui ranking de chamados por demanda, pendências por demanda e uma matriz resumida de quais pessoas tratam cada demanda.
- Para análises históricas de pessoas, o responsável considera tanto `Atribuído a` quanto `Concluída por`.
- Quando um período é informado, os gráficos analíticos de demanda usam tarefas criadas ou concluídas dentro daquele intervalo; a fila aberta continua representando o estado atual após os demais filtros.


### Ajuste de leitura por demanda
Na tabela **Quem está tratando cada demanda**, são exibidas apenas demandas com nome identificável. Valores formados somente por números e sublinhados, como `2657966_0` ou `85118_486687`, são ignorados nessa tabela. O bloco foi posicionado logo após **Demandas abertas**.


## Atualização v2

**Trello**
- Removidas as telas **Analítico** e **Unidade / Vídeo / BDQ** (a leitura macro continua em *Panorama da Esteira*).
- **Nível**: nome do card com `POS`/`PÓS` (ex.: `POSGP26.2`, `POSAFYA…`) = **Pós**; com `GRD` = **Graduação**; demais = Outros. Novo filtro *Nível* e selo nas tabelas.
- **Produtividade → Ver disponíveis na etapa**: escolha a etapa (e nível) e veja concluídas pelos selecionados no período × cards na fila × em produção, com link para o Trello.
- **Pessoa**: rastreio cronológico (iniciou/concluiu, minutos, cards com link, em produção agora) para várias pessoas. Atalhos Hoje / Esta semana / 7 dias / Mês (também em Produtividade e Operações).
- Todo tempo agora é exibido em **minutos** (ex.: 2,4 h → 144 min). Exportações usam a coluna *Minutos*.

**Operações**
- Filtros (busca, categoria, demanda, status, responsável, prioridade, período) fixos no topo das 3 telas.
- *Produtividade Operações* ganhou conclusões por demanda e detalhamento com link.
- **Links das demandas**: o export do Planner não traz URL; o link é montado com o ID do plano (aba *Plano*) e o ID da tarefa pelo modelo `OPS_TASK_URL` no topo do `app.js`. Se o seu tenant usar outro padrão, ajuste só essa constante.


## Atualização v3 — semestres 2026/2 e 2027/1

- **Botão de semestre** no topo (2026/2 | 2027/1). O semestre **mais recente abre sempre por padrão**; o anterior continua disponível. A lista fica em `SEMESTERS` no `app.js` (o primeiro item é o mais recente). Para o próximo semestre, basta adicionar um item no topo.
- **2027/1** junta dois quadros do Trello: `dados_2027_1_conteudo.csv` e `dados_2027_1_video.csv`, com o filtro **Quadro** (Conteúdo / Vídeo). Se um dos arquivos faltar, o painel usa o outro e avisa.
- **Regras do 2027/1**
  - `00 DEMANDA...` = **Backlog** (conta no total e nas pendências, mas não em "Em andamento").
  - `07 PUBLICADO` = Finalizado. `02 LIBERADO PARA VALIDAÇÃO` = fila (espera).
  - Ignorados: `00 MODELOS`, cards fora do padrão `GRD27.1_TIPO_U#/V#/PE_...` e **arquivados sem nenhuma etapa registrada**. Arquivados com produção contam como Finalizados. O total ignorado aparece no subtítulo.
  - Tipos: `U#` Unidade, `V#` Vídeo, `BDQ`, `PE` Plano de ensino. Formato (filtro *Produção*): Podcast (`POD`), Prática em evidência (`PEV`), Dúvida (`EDUV`), Vídeo de tema (`T#`).
  - Áreas: Qualidade 1/2, DI e Revisão = Conteúdo (inclusive no quadro Vídeo); DG, Roteiro, Gravação e Edição = Estúdio; Web = Web; Pendência e Extras = Outros. **Auditorias não entram** nas métricas. Etapas de espera não geram minutos.
- **Robô**: `scripts/trello_to_csv.py` sincroniza os 3 quadros (2026/2, 2027/1 Conteúdo e 2027/1 Vídeo). Os IDs estão no script e podem ser sobrescritos por `TRELLO_BOARD_ID_2027_CONT` e `TRELLO_BOARD_ID_2027_VIDEO`. Um quadro com problema não impede a atualização dos outros.
