# 🐔 Poultry Simulator - Code Wiki

Bem-vindo à documentação oficial (Wiki) do projeto **Poultry Simulator**. Este documento fornece uma visão técnica detalhada sobre a arquitetura do projeto, os principais módulos, classes, funções e guias de execução.

---

## 🏗️ 1. Visão Geral e Arquitetura do Projeto

O **Poultry Simulator** é um jogo de simulação de avicultura baseado em turnos diários, focado na gestão de granjas de **Corte** ou **Postura**. O jogador precisa lidar com a compra de animais, infraestrutura, alimentação, saúde do lote e flutuações do mercado econômico e climático.

### Padrão Arquitetural
O projeto adota uma arquitetura **Cliente-Servidor** (Client-Server) dividida em:
*   **Frontend (SPA):** Construído em React com Vite. Utiliza **Zustand** para gerenciamento de estado global e persistência local (Offline-First). O jogo pode rodar as lógicas de turno e decisões inteiramente no navegador do usuário e, em seguida, sincronizar com o backend.
*   **Backend (API REST):** Construído em Python com **Django e Django REST Framework (DRF)**. É o responsável por persistir o progresso do jogador na nuvem (banco de dados SQLite local), validar compras e processar a passagem de turnos (`advance_day`) com as devidas regras de negócio de consumo, ganho de peso e mortalidade.

---

## 🧩 2. Responsabilidades dos Principais Módulos

### 🖥️ Frontend (`/src`)
O Frontend é focado na experiência interativa do usuário, regras do loop de jogo (Game Loop) e gráficos financeiros.

*   **`src/store/useGameStore.ts`**: Coração da simulação no frontend. Utiliza Zustand (`create` e `persist`) para manter o estado local. Contém funções como `setAuth`, `fetchGameState` e gerencia todo o modelo de dados em tempo real (Dinheiro, Dia atual, Galpões, Animais).
*   **`src/lib/api.ts`**: Instância do Axios pré-configurada para apontar para `http://localhost:8000/api`. Implementa interceptors para adicionar o JWT Token (`access_token`) nas requisições e realizar o tratamento de erros (ex: 401 Unauthorized).
*   **`src/store/constants.ts` & `types.ts`**: Guardam todas as constantes vitais do jogo e probabilidades, como Custo Base de Ração, Preço do Ovo, Fatores Climáticos (Sol, Chuva, Onda de Calor), Probabilidade de Doenças e interfaces de TypeScript (`GameState`, `Barn`, `Batch`).
*   **`src/pages/` e `src/components/`**: Camada de visualização (React). Possui telas para Dashboards Financeiros, Mercado, Galpões, Compras, etc. Componentes como modais (`Modal.tsx`) e layouts são animados usando **Framer Motion**.

### ⚙️ Backend (`/backend/core`)
O Backend atua como fonte de verdade dos dados do jogador, autenticação e regras avançadas de economia.

*   **`core/models.py`**: Define o esquema do banco de dados (SQLite3) contendo modelos como `Player`, `Barn`, `Batch`, `InventoryItem` e `Products`.
*   **`core/views.py`**: Controladores das rotas REST, incluindo sistema de Registro de Usuários, Busca do Estado Inicial (`get_game_state`) e uma rota robusta de Sincronização Unidirecional (`sync_game_state`).
*   **`core/game_logic.py`**: Contém a lógica complexa do motor do jogo (ex: `advance_day`), que calcula as penalidades de fome, consumo diário de ração e penalidade de mortalidade baseada na saúde e clima.
*   **`core/economy.py`**: Contém lógicas relacionadas à compra de insumos, galpões e novos lotes.
*   **`farm_game/`**: Módulo central de configurações do Django (`settings.py`, `urls.py`).

---

## 🧬 3. Classes e Funções Principais

### Backend (Python/Django)
*   **Classe `Player` (`models.py`)**: Entidade principal que estende o usuário do Django. Armazena o saldo em dinheiro, dias avançados, infraestruturas globais (Fábrica de Ração, Abatedouro) e lucros totais.
*   **Classe `Barn` e `Batch` (`models.py`)**: `Barn` representa o galpão (Postura/Corte, Capacidade, Estoque de Silo). `Batch` (Lote) fica associado a um galpão e gerencia a Idade, Mortalidade, Peso e Saúde (Health) das aves.
*   **Função `advance_day(request)` (`game_logic.py`)**: Executada na rota `/api/game/advance-day/`.
    *   Itera pelos galpões e processa dias de vazio sanitário.
    *   Calcula o consumo de ração com base na finalidade (Corte vs Postura).
    *   Deduz o volume de ração do `silo_balance`. Se faltar ração, calcula penalidades severas (aumenta mortalidade e deduz saúde).
    *   Adiciona a produção diária de ovos e deduz custos fixos de manutenção.
*   **Função `sync_game_state(request)` (`views.py`)**: Sobrescreve o backend com os dados salvos localmente pelo frontend. Permite que o jogador avance várias semanas offline e sincronize de uma vez, atualizando as métricas do jogador, inventário, galpões e produtos.

### Frontend (TypeScript/Zustand)
*   **Hook `useGameStore` (`useGameStore.ts`)**: Estado global que guarda propriedades como `hasHydrated`, `isAuthenticated`, dados da empresa (`company`), `money`, e Arrays de `barns` e `products`.
*   **Função `fetchGameState()`**: Chama a API Django e compara se o progresso local é mais avançado que o servidor (Resolução de Conflitos). Se for, chama `syncToServer()`, do contrário, mapeia o progresso do Backend para a tipagem do Frontend.
*   **Função `generateDailyTasks(barns)`**: Gera tarefas diárias ("Limpar Bebedouros", "Checar Climatização") que exigem a atenção do jogador para evitar penalidades na saúde (`hygieneLevel`).

---

## 🔗 4. Dependências do Projeto

### Dependências do Frontend (`package.json`)
*   **React 18 & React Router DOM:** Núcleo da interface e navegação.
*   **Zustand:** Gerenciamento do estado local persistido (Local Storage).
*   **Axios:** Para chamadas HTTP e interceptação de tokens JWT.
*   **Tailwind CSS & Framer Motion:** Para estilização responsiva e animações fluidas da interface.
*   **Recharts:** Para geração de gráficos analíticos da fazenda (Receita vs Despesas).
*   **Lucide React:** Biblioteca de ícones SVG.
*   **jwt-decode:** Para leitura dos tokens JWT enviados pelo backend.

### Dependências do Backend (`requirements.txt`)
*   **Django (>=4.2):** Framework backend principal.
*   **djangorestframework (DRF):** Construção da API REST.
*   **djangorestframework-simplejwt:** Autenticação via JSON Web Tokens (Access/Refresh Tokens).
*   **django-cors-headers:** Configuração de CORS para permitir que o Frontend (porta 5173) comunique-se com o Backend (porta 8000).

---

## 🚀 5. Como Executar o Projeto

O projeto requer dois servidores rodando simultaneamente (Backend e Frontend).

### Passo 1: Rodar o Backend (Django)
Abra um terminal, certifique-se de ter o Python 3.10+ instalado e siga os comandos:

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Crie e ative um ambiente virtual (Opcional, mas recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Realize as migrações do Banco de Dados
python manage.py migrate

# 5. Inicie o servidor
python manage.py runserver
```
*O Backend estará disponível em `http://localhost:8000/`.*

### Passo 2: Rodar o Frontend (React/Vite)
Abra um segundo terminal, certifique-se de ter o Node.js (18+) instalado:

```bash
# 1. Volte à raiz do projeto (se estiver na pasta backend)
cd ..

# 2. Instale as dependências via NPM
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```
*O Frontend estará disponível no navegador em `http://localhost:5173/`.*

### Passo 3: Jogar
1. Acesse `http://localhost:5173/` no seu navegador.
2. Crie uma conta no jogo através do fluxo de Registro (Isso salvará um perfil no banco SQLite).
3. Faça Login para gerar os Tokens JWT e começar a administrar sua fazenda!
