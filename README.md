# 🐔 Poultry Simulator (Simulador de Avicultura)

![Banner do Jogo](https://images.unsplash.com/photo-1590082871875-064219b1b702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

Um jogo de simulação e gerenciamento focado na indústria avícola brasileira. Construa e gerencie sua própria granja de **Corte** ou **Postura**, enfrente as flutuações do mercado, lide com eventos aleatórios (como ondas de calor e apagões) e evolua seu negócio de uma pequena cabana de madeira até um império industrial!

---

## 🎮 Como Jogar

O jogo é baseado em turnos diários (manuais), dando tempo para o jogador tomar decisões estratégicas de gestão sem ser pressionado pelo relógio.

1. **Escolha sua Região:** Inicie em regiões famosas pela avicultura no Brasil (Chapecó-SC, Lucas do Rio Verde-MT, etc.), cada uma com seus bônus e custos específicos de frete e terra.
2. **Personalize sua Empresa:** Dê um nome e escolha a cor oficial da sua empresa. Toda a interface do jogo será tematizada com a sua marca!
3. **Avance os Dias:** Use os botões no cabeçalho superior para avançar **1 Dia**, **1 Semana (7 Dias)** ou **1 Mês (30 Dias)**. A cada dia passado:
   - Suas aves comem ração e ganham peso (ou botam ovos).
   - Custos diários (luz, funcionários, manutenção) são debitados do caixa.
   - O mercado flutua (preços de ração, ovos e carne mudam).
4. **Suba de Nível (XP):** A cada dia passado e a cada venda realizada, você ganha XP. Ao subir de nível, você desbloqueia **Rações Premium**, **Equipamentos de Climatização**, **Caminhões** e **Galpões Maiores**.
5. **Cumpra Contratos:** Fique de olho no Dashboard! Supermercados locais podem oferecer **Missões/Contratos** com prazos apertados pagando prêmios altíssimos.

---

## 🛠️ Funcionalidades e Mecânicas Reais

### 🏢 Infraestrutura e Upgrades
*   **Diferentes Tamanhos de Galpão:** Compre galpões Pequenos, Médios ou Industriais. Cada um com custos e capacidades distintas.
*   **Upgrades de Nível:** Gaste dinheiro para aumentar a capacidade do seu galpão atual.
*   **Integração (Aluguel):** Não tem dinheiro para comprar um galpão? Alugue um sob o regime de integração pagando diárias.
*   **Vazio Sanitário:** Após a venda ou descarte de um lote, o galpão deve obrigatoriamente ficar vazio por **15 dias** para desinfecção (sem produzir, mas gerando custo fixo diário).
*   **Fábrica de Ração e Abatedouro:** Internalize a produção! Crie sua própria ração com milho e soja para fugir do mercado externo, ou construa um abatedouro para vender a carne processada mais cara.

### 🚜 Equipamentos e Veículos (Prós e Contras)
Os equipamentos não trazem apenas vantagens mágicas, eles simulam a vida real:
*   **Placa Evaporativa e Nebulizadores:** Reduzem drasticamente a mortalidade, mas aumentam o custo diário de água/energia.
*   **Dark House:** Custo inicial altíssimo e conta de luz pesada, mas gera crescimento espetacular nas aves.
*   **Maquinários e Caminhões (Marcas Brasileiras):** Compre caminhões Scania, Volvo, e tratores John Deere. Eles reduzem passivamente o custo do frete, da manutenção e dão bônus em vendas.

### 📉 Economia Dinâmica
*   **Tipos de Ração:** Ração de engorda, postura, pré-inicial, medicada, etc. Cada uma influencia de forma diferente na conversão alimentar, mortalidade e produção de ovos.
*   **Ciclo de Vida Realista:** Galinhas de postura (ovos) começam a botar com força total, mas após 500 dias a produção despenca, obrigando o jogador a **Descartar o Lote** para iniciar um novo ciclo (respeitando o Vazio Sanitário).

### 🚨 Eventos Aleatórios e Doenças
A qualquer momento, desastres ou picos no mercado podem ocorrer:
*   **Ondas de Calor / Apagões:** Causam picos mortais caso você não tenha equipamentos adequados (como Placas Evaporativas ou Geradores Stemac).
*   **Surtos de Doenças:** Doenças respiratórias ou intestinais que reduzem a conversão de ração em carne/ovos ou causam mortes severas.
*   **Greve dos Caminhoneiros / Boom de Exportação:** Eventos econômicos que fazem o preço do saco de ração triplicar de um dia para o outro ou o valor do frango subir nas alturas.

---

## 💻 Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores e mais modernas práticas do ecossistema React:

*   **React + TypeScript:** Componentização forte e segurança de tipagem.
*   **Vite:** Build tool ultrarrápido para desenvolvimento.
*   **Zustand:** Gerenciamento de estado global poderoso, leve e sem boilerplate (ideal para o game loop e economia do jogo).
*   **Tailwind CSS:** Estilização utilitária super rápida e responsiva.
*   **Framer Motion:** Animações fluídas, modais interativos com molas (`spring`) e transições de tela (`AnimatePresence`).
*   **Recharts:** Geração de gráficos de linha e barras para o histórico financeiro da empresa.
*   **Lucide React:** Biblioteca de ícones SVG leves e elegantes.

---

## 🚀 Como Rodar Localmente

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

1. **Clone o repositório:**
```bash
git clone https://github.com/LucasAraldi-Dev/PoultrySimulator.git
cd PoultrySimulator
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

4. Abra o seu navegador e acesse: `http://localhost:5173`

---

## 📝 Próximos Passos (Roadmap)
- [ ] Implementar sistema de Empréstimos Bancários e Juros (Banco do Brasil / PRONAF).
- [ ] Adicionar funcionários (Contratação, demissão, nível de experiência do tratador).
- [ ] Incluir mercado de futuros (travar o preço da saca do milho antes da safra).

---
*Feito com ☕ e focado na simulação real da Avicultura.*