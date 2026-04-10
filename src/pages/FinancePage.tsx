import { useGameStore } from '../store/useGameStore';
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Activity, History, PieChart, Wrench, Users, Truck, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageTransition } from '../components/PageTransition';

export default function FinancePage() {
  const navigate = useNavigate();
  
  const money = useGameStore(state => state.money);
  const totalProfit = useGameStore(state => state.totalProfit);
  const totalExpenses = useGameStore(state => state.totalExpenses);
  const detailedExpenses = useGameStore(state => state.detailedExpenses);
  const currentDay = useGameStore(state => state.currentDay);
  const resetGame = useGameStore(state => state.resetGame);
  const history = useGameStore(state => state.history);
  const company = useGameStore(state => state.company);
  const bankLoan = useGameStore(state => state.bankLoan);
  const takeLoan = useGameStore(state => state.takeLoan);
  const payLoan = useGameStore(state => state.payLoan);

  const payInstallment = useGameStore(state => state.payInstallment);
  const loanInstallment = useGameStore(state => state.loanInstallment);
  const loanInstallmentsRemaining = useGameStore(state => state.loanInstallmentsRemaining);
  const nextLoanPaymentDay = useGameStore(state => state.nextLoanPaymentDay);
  const missedPayments = useGameStore(state => state.missedPayments);
  const lastMonthRevenue = useGameStore(state => state.lastMonthRevenue);

  const balance = totalProfit - totalExpenses;
  const isProfitable = balance >= 0;

  const handleTakeLoan = () => {
    if (bankLoan > 0) {
      alert('Você já possui um empréstimo ativo. Quite-o antes de pegar outro.');
      return;
    }
    const maxSafeInstallment = lastMonthRevenue > 0 ? lastMonthRevenue * 0.3 : 5000;
    const amountStr = prompt(`Valor do empréstimo (R$):\nLembre-se: sua parcela não pode exceder R$ ${maxSafeInstallment.toFixed(2)}`, '5000');
    const amount = Number(amountStr);
    if (!isNaN(amount) && amount > 0) {
      const installmentsStr = prompt('Em quantas parcelas? (Ex: 12, 24, 36)', '12');
      const installments = Number(installmentsStr);
      if (!isNaN(installments) && installments > 0) {
        takeLoan(amount, installments);
      }
    }
  };

  const handlePayInstallment = () => {
    if (money < loanInstallment) {
      alert('Você não tem dinheiro suficiente para pagar a parcela!');
      return;
    }
    payInstallment();
  };

  const handlePayLoan = () => {
    const amount = Number(prompt(`Valor para amortizar do saldo total (Saldo da conta: R$ ${money.toFixed(2)}, Dívida Total: R$ ${bankLoan.toFixed(2)}):`, bankLoan.toFixed(2)));
    if (!isNaN(amount) && amount > 0) {
      payLoan(amount);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja recomeçar? Todo o seu progresso será perdido.')) {
      navigate('/');
    }
  };

  // Preparando dados para o gráfico (últimos 10 lotes)
  const chartData = history.slice(-10).map((h, i) => ({
    name: `Lote ${i + 1}`,
    receita: h.revenue,
    mortalidade: h.mortalityCount,
    ca: h.finalWeight > 0 ? (h.totalFeedConsumed / h.finalWeight).toFixed(2) : 0,
  }));

  return (
    <PageTransition className="space-y-8">
      {/* Resumo Financeiro */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Activity size={24} className="text-blue-600" />
          Resumo Financeiro
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-emerald-500" />
              <h3 className="text-lg font-medium text-zinc-600">Receita Total</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-600">R$ {totalProfit.toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown size={20} className="text-red-500" />
              <h3 className="text-lg font-medium text-zinc-600">Despesas Totais</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
          </div>
          
          <div className={`p-6 rounded-xl shadow-sm border ${isProfitable ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <ArrowRightLeft size={20} className={isProfitable ? 'text-emerald-600' : 'text-red-600'} />
              <h3 className={`text-lg font-medium ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>Lucro Líquido</h3>
            </div>
            <p className={`text-3xl font-bold ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg border relative overflow-hidden ${bankLoan > 0 ? (missedPayments > 0 ? 'bg-red-900 border-red-800' : 'bg-zinc-900 border-zinc-800') : 'bg-zinc-900 border-zinc-800'} text-white`}>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className={missedPayments > 0 ? "text-red-400" : "text-amber-400"} />
                <h3 className="text-lg font-medium text-zinc-300">Banco do Brasil (PRONAF)</h3>
              </div>
              {missedPayments > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">Atrasado!</span>}
            </div>
            
            <p className={`text-3xl font-bold relative z-10 ${missedPayments > 0 ? "text-red-400" : "text-amber-400"}`}>R$ {bankLoan.toFixed(2)}</p>
            
            {bankLoan > 0 ? (
              <div className="mt-2 text-sm text-zinc-400 relative z-10">
                <div className="flex justify-between">
                  <span>Parcela Mensal:</span>
                  <span className="font-bold text-zinc-200">R$ {loanInstallment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vencimento:</span>
                  <span className={`font-bold ${currentDay > nextLoanPaymentDay ? 'text-red-400' : 'text-zinc-200'}`}>
                    Dia {nextLoanPaymentDay} {currentDay > nextLoanPaymentDay && `(${currentDay - nextLoanPaymentDay} dias atraso)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Restantes:</span>
                  <span className="font-bold text-zinc-200">{loanInstallmentsRemaining}x</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-500/80 mb-3 relative z-10 mt-2">Limite Pré-Aprovado: R$ {lastMonthRevenue > 0 ? (lastMonthRevenue * 0.3 * 12).toFixed(2) : '60000.00'}</p>
            )}

            <div className="mt-4 flex gap-2 relative z-10">
              {!bankLoan ? (
                <button onClick={handleTakeLoan} className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-bold py-2 rounded transition-colors border border-amber-500/30">Solicitar Empréstimo</button>
              ) : (
                <>
                  <button onClick={handlePayInstallment} disabled={currentDay < nextLoanPaymentDay - 15} className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-bold py-2 rounded transition-colors border border-amber-500/30 disabled:opacity-50" title="Pagar Parcela">
                    Pagar Parcela
                  </button>
                  <button onClick={handlePayLoan} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-bold py-2 rounded transition-colors border border-emerald-500/30">Amortizar</button>
                </>
              )}
            </div>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${missedPayments > 0 ? 'bg-red-500/10' : 'bg-amber-500/10'}`}></div>
          </div>
        </div>
      </section>

      {/* Estatísticas Gerais e Detalhamento de Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <DollarSign size={24} className="text-zinc-500" />
            Métricas de Desempenho
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="py-4 px-6 text-zinc-600 font-medium">Dias de Operação</td>
                  <td className="py-4 px-6 text-zinc-800 font-bold text-right">{currentDay} dias</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-4 px-6 text-zinc-600 font-medium">Saldo Atual em Caixa</td>
                  <td className="py-4 px-6 text-zinc-800 font-bold text-right">R$ {money.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-4 px-6 text-zinc-600 font-medium">Receita Média por Dia</td>
                  <td className="py-4 px-6 text-zinc-800 font-bold text-right">R$ {(totalProfit / Math.max(1, currentDay)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-zinc-600 font-medium">Despesa Média por Dia</td>
                  <td className="py-4 px-6 text-zinc-800 font-bold text-right">R$ {(totalExpenses / Math.max(1, currentDay)).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <PieChart size={24} className="text-orange-500" />
            Detalhamento de Custos Acumulados
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="flex items-center gap-3">
                <Home size={20} className="text-blue-500" />
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Operação de Galpões</h3>
                  <p className="text-xs text-zinc-500">Luz, água e infraestrutura</p>
                </div>
              </div>
              <span className="font-bold text-zinc-700">R$ {detailedExpenses.barns.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-amber-500" />
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Mão de Obra (Peão)</h3>
                  <p className="text-xs text-zinc-500">Pode ser reduzido comprando Tratores</p>
                </div>
              </div>
              <span className="font-bold text-zinc-700">R$ {detailedExpenses.labor.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="flex items-center gap-3">
                <Wrench size={20} className="text-zinc-500" />
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Manutenção de Equip.</h3>
                  <p className="text-xs text-zinc-500">Custo diário dos equipamentos instalados</p>
                </div>
              </div>
              <span className="font-bold text-zinc-700">R$ {detailedExpenses.maintenance.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-emerald-500" />
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm">Custos de Frete (Ração)</h3>
                  <p className="text-xs text-zinc-500">Pode ser zerado com Frota Própria (Carretas)</p>
                </div>
              </div>
              <span className="font-bold text-zinc-700">R$ {detailedExpenses.freight.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Histórico de Lotes e Gráfico */}
      {history.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <History size={24} className="text-purple-600" />
            Histórico de Lotes (Corte)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 h-80">
              <h3 className="text-sm font-bold text-zinc-500 mb-4 uppercase tracking-wider">Receita dos últimos lotes</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita Bruta (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de Histórico */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden overflow-y-auto h-80">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 sticky top-0 border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4 text-zinc-500 font-bold uppercase">Lote / Galpão</th>
                    <th className="py-3 px-4 text-zinc-500 font-bold uppercase">Dias</th>
                    <th className="py-3 px-4 text-zinc-500 font-bold uppercase">Mortalidade</th>
                    <th className="py-3 px-4 text-zinc-500 font-bold uppercase text-right">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[...history].reverse().map((h, i) => (
                    <tr key={h.id} className="hover:bg-zinc-50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-800">Lote #{history.length - i}</p>
                        <p className="text-xs text-zinc-500">{h.barnName}</p>
                      </td>
                      <td className="py-3 px-4 text-zinc-600">{h.endedAtDay - h.startedAtDay} dias</td>
                      <td className="py-3 px-4 text-red-500">{h.mortalityCount} aves</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">R$ {h.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        </section>
      )}

      {/* Zona de Perigo */}
      <section className="pt-8">
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-1">Zona de Perigo</h3>
            <p className="text-red-600 text-sm">Faliu? Cometeu um erro na gestão? Você pode recomeçar do zero.</p>
          </div>
          <button 
            onClick={handleReset}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-sm"
          >
            Recomeçar Jogo
          </button>
        </div>
      </section>
    </PageTransition>
  );
}
