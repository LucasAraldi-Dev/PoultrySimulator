# Documentação Completa: Ovos & Negócios

Este documento contém todas as funcionalidades, configurações de dificuldade, probabilidades e a mecânica detalhada do funcionamento do jogo **Ovos & Negócios** (simulador de avicultura).

---

## 1. Visão Geral e Funcionalidades Principais

O jogo é um simulador de gestão avícola onde o jogador administra uma granja, lidando com a produção de ovos (postura) e/ou frangos de corte.

### Funcionalidades do Jogador
*   **Gestão de Galpões:** Construção e gerenciamento de galpões de diferentes tamanhos (Pequeno, Médio, Industrial) para Postura ou Corte.
*   **Alojamento de Lotes:** Compra de pintinhos de corte (1 dia) ou frangas de postura prontas para botar.
*   **Nutrição e Estoque:** Compra de rações específicas para cada fase da ave, armazenadas em silos por galpão.
*   **Economia Dinâmica:** Venda de ovos e carne de frango baseada em cotações diárias do mercado que flutuam aleatoriamente.
*   **Manejo e Tarefas Diárias:** Execução de tarefas obrigatórias (limpar bebedouros, checar climatização, biosseguridade, remover aves mortas).
*   **Tecnologia e Equipamentos:** Compra de ventiladores, aquecedores a gás, nebulizadores, comedouros automáticos, sistema Dark House, etc.
*   **Maquinário e Logística:** Aquisição de tratores (reduzem custo diário) e caminhões (reduzem frete de compra de ração e aumentam preço de venda de animais vivos ou carne processada).
*   **Árvore de Pesquisas:** Investimento em melhorias genéticas, nutrição, infraestrutura e saúde para otimizar o ganho a longo prazo.
*   **Sistema de Regiões:** Escolha do local da granja no Brasil (ex: MT tem ração barata mas frete caro; SP tem venda cara mas terra cara).

---

## 2. Mecânica do Funcionamento do Jogo

O motor do jogo avança em ciclos diários. A cada clique de "Avançar Dia", o sistema calcula o consumo, crescimento, produção, saúde e mortalidade de cada lote.

### 2.1 Ciclo de Vida: Poedeiras (Postura)
*   **Alojamento:** O jogador compra frangas (R$ 18,00/ave) prontas para postura.
*   **Produção de Ovos:** A taxa base é de 85% do lote botando ovos diariamente.
*   **Idade Máxima:** Aves produzem bem até 600 dias. Acima de 500 dias a postura cai 50%; acima de 600 dias cai 90%.
*   **Descarte:** Aves velhas são vendidas como descarte (R$ 3,50/ave).

### 2.2 Ciclo de Vida: Frangos (Corte)
*   **Alojamento:** Pintinhos de 1 dia (R$ 2,00/ave).
*   **Crescimento:** O ganho de peso segue a **Tabela Cobb500**, chegando a aproximadamente 3,9kg aos 42 dias. O consumo diário de ração aumenta proporcionalmente.
*   **Abate / Venda:** O jogador pode vender o lote vivo ou processado (caso possua abatedouro).
*   **Contratos de Integração:** Venda de lotes de galpões alugados paga um valor fixo (R$ 0,50/ave) com bônus se o ganho de peso superar a tabela em 5% (+R$ 0,30) ou penalidades se houver alta mortalidade (-R$ 0,15) ou baixo peso (-R$ 0,20).

### 2.3 Sistema de Alimentação e Fome
*   **Tipos de Ração:** Ração de Corte (Pré-inicial, Crescimento, Terminação) e de Postura (Cria/Recria, Postura Fase 1).
*   **Penalidade por Erro:** Dar ração de postura para corte reduz crescimento em 50%. Dar ração de engorda para postura reduz ovos em 70%. Usar granulometria errada para a idade reduz eficiência em 20% a 60%.
*   **Fome:** Se o silo esvaziar, o lote come apenas a fração disponível. Ficar sem ração faz a produção de ovos cair na mesma proporção, reduz a saúde (até -10 pontos/dia) e **5% das aves morrem instantaneamente**.

### 2.4 Saúde, Higiene e Vazio Sanitário
*   **Higiene:** A higiene do lote cai diariamente e sobe com tarefas (Manejo de cama, Limpeza). Higiene < 70% reduz apetite em 5%; < 40% reduz apetite em 15%; < 50% dobra a chance de doenças.
*   **Vazio Sanitário:** Após a saída de um lote, o galpão deve obrigatoriamente ficar vazio por **15 dias** para desinfecção.

### 2.5 Sistema Bancário e Empréstimos
*   **Juros Padrão:** 0.015% ao dia sobre saldo devedor. Atrasos geram multa instantânea de 2%.
*   **Empréstimo de Emergência:** Se o caixa ficar negativo, o banco injeta R$ 50.000 automaticamente, mas cobra juros abusivos imediatos de 20% (dívida vai a R$ 60.000) com 60 dias de carência.

---

## 3. Configurações de Dificuldade e Probabilidades

A aleatoriedade e os multiplicadores dinâmicos representam a verdadeira dificuldade do jogo.

### 3.1 Flutuação de Mercado Diária
*   **Ovos:** Varia de 95% a 105% do valor base (R$ 0,50/unidade).
*   **Carne (Frango Vivo):** Varia de 90% a 110% do valor base (R$ 6,00/kg).
*   **Ração:** Varia violentamente de 80% a 130% do custo base.

### 3.2 Sazonalidade (Calendário Anual)
O ano tem 12 meses de 30 dias.
*   **Meses 5 a 7 (Safra do Milho):** Ração fica 15% mais barata.
*   **Meses 0 a 3 (Entressafra):** Ração fica 15% mais cara.
*   **Mês 11 (Fim de Ano):** Preço da carne sobe 20%.
*   **Meses 2 e 3 (Quaresma):** Preço do ovo sobe 15%.

### 3.3 Clima Dinâmico e Probabilidades
Um novo ciclo climático é sorteado a cada 2 a 5 dias:
*   **Ensolarado (60%):** Clima padrão.
*   **Chuva Forte (20%):** Aumenta o risco de doenças em 50% (multiplicador 1.5x).
*   **Onda de Calor (10%):** Mortalidade multiplicada por 3 se não houver ventilação/nebulização.
*   **Frente Fria (10%):** Mortalidade multiplicada por 2 sem aquecimento. Mortalidade multiplicada por 10 (letal) se faltar gás no aquecedor. Pintinhos até 14 dias gastam o dobro de gás.

### 3.4 Doenças e Surtos
*   **Chance Base:** 1% ao dia por lote de ocorrer uma doença.
*   **Vacinas:** Reduzem a chance de surto em 90%. Duram 15 dias (ou 25 com pesquisa "Super Vacinas").
*   **Tipos de Doença:**
    *   *Gripe Aviária Leve:* Mortalidade 5x, crescimento -20%, postura -50% (dura 7 dias).
    *   *Bronquite Infecciosa:* Mortalidade 2x, crescimento -10%, postura -70% (dura 14 dias).
    *   *Newcastle:* Mortalidade 10x, crescimento -50%, postura -90% (dura 5 dias).

### 3.5 Eventos Globais Aleatórios
Há **2% de chance** diária de ocorrer um evento de impacto sistêmico:
*   **Crise do Petróleo:** Fretes disparam absurdamente.
*   **Quebra de Safra Histórica:** O preço da ração no mercado atinge picos enormes.
*   **Onda de Calor Extrema (El Niño):** Mortalidade dispara em galpões sem climatização.
*   **Infestação de Roedores:** O jogador perde instantaneamente 10% do seu estoque de ração.
*   **Apagão Nacional:** Falta de energia desliga equipamentos.
    *   *Proteção:* Se possuir Gerador a Diesel básico, há **50% de chance** de salvar os equipamentos. Se possuir Gerador Cabinado Automático (Premium), a salvação é 100% garantida.
*   **Alerta de Gripe Aviária:** O risco global de adoecimento dos lotes é severamente aumentado.

### 3.6 Penalidades por Negligência de Tarefas
Ignorar as tarefas geradas diariamente acumula severas punições para o lote afetado, divididas por gravidade da tarefa:
*   **Baixa (ex: pesar aves):** Doença +10%, Crescimento -3%, Mortalidade +15%.
*   **Média (ex: limpar bebedouros):** Doença +30%, Crescimento -8%, Mortalidade +50%.
*   **Alta (ex: retirar aves mortas, checar ração):** Doença +60%, Crescimento -15%, Mortalidade +120%.

---

*Esta documentação reflete o estado atual do motor (baseado no `useGameStore`, `game_logic` e constantes do sistema).*
