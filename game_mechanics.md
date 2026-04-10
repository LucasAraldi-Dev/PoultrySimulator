# Mecânicas, Constantes e Probabilidades - Ovos & Negócios

Este documento compila todos os valores fixos, variáveis, probabilidades e cálculos do motor do jogo, extraídos de `constants.ts` e `useGameStore.ts`.

---

## 1. Economia Base e Limites (Constantes)

Estes valores formam a base imutável da economia do jogo.

| Item / Regra | Valor Base |
| :--- | :--- |
| **Dinheiro Inicial** | R$ 15.000,00 |
| **Custo de um Pintinho (1 dia)** | R$ 2,00 |
| **Custo de uma Franga (Postura pronta)** | R$ 18,00 |
| **Preço Base de Venda do Ovo** | R$ 0,50 / un |
| **Preço Base da Carne (Frango Vivo)** | R$ 6,00 / kg |
| **Preço Base da Carne Processada (Abatedouro)** | R$ 10,00 / kg |
| **Preço de Descarte (Poedeira Velha)** | R$ 3,50 / ave |
| **Idade Máxima Produtiva (Postura)** | 600 dias |
| **Tempo de Vazio Sanitário (Pós-lote)** | 15 dias |

---

## 2. Motor Aleatório (Probabilidades diárias)

O jogo utiliza o método `Math.random()` na virada de cada dia para injetar aleatoriedade em diversos sistemas.

### Clima Dinâmico
A cada ciclo de clima (que dura entre **2 e 5 dias**), um novo clima é sorteado:
- **60% de chance:** Ensolarado (`SUNNY`)
- **20% de chance:** Chuva Forte (`RAIN`)
- **10% de chance:** Onda de Calor (`HEATWAVE`)
- **10% de chance:** Frente Fria (`COLD`)

### Eventos e Saúde
- **Eventos Globais:** **2% de chance** por dia de ocorrer um evento global (ex: Apagão, Seca, etc.).
- **Doenças (Surtos):**
  - **1% de chance base** por dia de um lote pegar uma doença.
  - Se estiver chovendo (`RAIN`), essa chance é multiplicada por **1.5x (50% maior)**.
- **Proteção (Apagão):** Se o jogador tiver um "Gerador a Diesel", há **50% de chance** do gerador salvar os equipamentos.

### Flutuação do Mercado
Os preços variam diariamente com base em um cálculo aleatório sobre o valor base:
- **Ovos:** Varia de **95% a 105%** do valor base (`0.95 + Math.random() * 0.1`).
- **Carne (Viva/Processada):** Varia de **90% a 110%** do valor base (`0.9 + Math.random() * 0.2`).
- **Custo da Ração no Mercado:** Varia violentamente de **80% a 130%** do custo base (`0.8 + Math.random() * 0.5`).

---

## 3. Modificadores e Penalidades (Multiplicadores)

### Sazonalidade (Calendário do Jogo)
O jogo possui 12 meses (30 dias cada), que afetam a demanda e a oferta:
- **Meses 5 a 7 (Safra do Milho):** Custo da ração **cai 15%** (`x 0.85`).
- **Meses 0 a 3 (Entressafra):** Custo da ração **sobe 15%** (`x 1.15`).
- **Mês 11 (Festas de Fim de Ano):** Preço da carne **sobe 20%** (`x 1.20`).
- **Meses 2 e 3 (Quaresma):** Preço do ovo **sobe 15%** (`x 1.15`).

### Nutrição e Rações
O jogo pune rigorosamente o uso incorreto de rações:
- **Tipo Incorreto:** 
  - Ração de Postura para Frango de Corte: Crescimento **cai 50%**.
  - Ração de Engorda para Galinha de Postura: Produção de ovos **cai 70%** (a ave engorda e para de botar).
- **Fase de Idade Incorreta:** 
  - Ração muito grossa para pintinhos ou ração inicial para adultos reduz a eficiência entre **20% e 60%**.
- **Fome (Silo Vazio):** Se não houver ração suficiente para o dia, **5% das aves do lote morrem instantaneamente**.

### Higiene, Saúde e Clima (Impactos Diretos)
- **Higiene do Lote:**
  - Abaixo de 70%: Apetite cai **5%**.
  - Abaixo de 40%: Apetite cai **15%**.
  - Abaixo de 50%: **Dobra** a chance de adoecer (`x 2.0`).
- **Idade da Ave (Postura):**
  - Acima de 500 dias: Postura **cai 50%**.
  - Acima de 600 dias: Postura **cai 90%**.
- **Vacinas:** Reduzem a chance de surto em **90%**. Duram 15 dias (ou 25 dias se a pesquisa "Super Vacinas" estiver liberada).
- **Penalidades Climáticas:**
  - **Onda de Calor sem Ventilador:** Mortalidade diária é **multiplicada por 3**.
  - **Frio sem Aquecedor (até 21 dias):** Mortalidade diária é **multiplicada por 2**.
  - **Frio sem Gás (Estoque):** A mortalidade diária é **multiplicada por 10** (letal).
  - **Consumo de Gás:** No frio (`COLD`), pintinhos até 14 dias gastam o **dobro** de botijões de gás.

### Tarefas Diárias (Negligência)
Ignorar tarefas acumula penalidades diárias para o lote com base na gravidade da tarefa:
- **Baixa:** Chance de Doença **+10%**, Crescimento **-3%**, Mortalidade **+15%**.
- **Média:** Chance de Doença **+30%**, Crescimento **-8%**, Mortalidade **+50%**.
- **Alta:** Chance de Doença **+60%**, Crescimento **-15%**, Mortalidade **+120%**.

### Contratos de Integração (Venda de Lote de Corte)
Quando o jogador vende um lote de um galpão alugado (Integração), ele recebe um valor fixo de **R$ 0,50 por ave viva**, modificado pela sua performance:
- **Bônus de Crescimento (FCA):** Se o peso médio for 5% acima da tabela Cobb500, ganha **+ R$ 0,30 / ave**.
- **Penalidade de Crescimento:** Se o peso médio for 10% abaixo da tabela, perde **- R$ 0,20 / ave**.
- **Penalidade de Mortalidade:** Se a mortalidade do lote ultrapassar 5%, perde **- R$ 0,15 / ave**.

### Sistema Bancário e Empréstimos
- **Juros Diários:** O empréstimo normal cobra **0.015%** ao dia sobre o saldo devedor.
- **Atraso de Parcela:** Adiciona uma multa instantânea de **2%** sobre o saldo devedor.
- **Empréstimo de Emergência (Saldo Negativo):**
  - O banco oferece automaticamente R$ 50.000,00 se o jogador ficar negativo.
  - O juros é fixo e abusivo: **20% instantâneo** (A dívida vai para R$ 60.000,00).
  - O jogador ganha **60 dias de carência** para pagar a parcela única antes de ser cobrado.