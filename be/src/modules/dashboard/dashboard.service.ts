import { accountsRepository } from "../accounts/accounts.repository.js";
import { balanceService } from "../balance/balance.service.js";
import { plansRepository } from "../plans/plans.repository.js";
import { transactionsRepository } from "../transactions/transactions.repository.js";

export type ChartDataPoint = { date: string; revenue: number; label: string };

export type RecentTransactionDto = {
  id: string;
  amount: number;
  type: string;
  description: string;
  occurred_at: string;
};

export type DashboardResult = {
  total_accounts: number;
  total_plans: number;
  total_balance_vnd: number;
  today_revenue_vnd: number;
  chart_data: ChartDataPoint[];
  recent_transactions: RecentTransactionDto[];
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function formatChartLabel(d: Date, period: 7 | 30): string {
  if (period === 7) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getUTCDay()];
  }
  return String(d.getUTCDate());
}

export class DashboardService {
  async getDashboard(userId: string, period: 7 | 30): Promise<DashboardResult> {
    const [accounts, plans, totalBalanceVnd] = await Promise.all([
      accountsRepository.listByUserId(userId),
      plansRepository.list(),
      balanceService.getBalance(userId)
    ]);

    const accountIds = accounts.map((a) => a.id);
    const totalAccounts = accounts.length;
    const totalPlans = plans.length;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const daysBack = period - 1;
    const fromDate = new Date(todayStart);
    fromDate.setUTCDate(fromDate.getUTCDate() - daysBack);

    const [recentRows, rangeRows] = await Promise.all([
      transactionsRepository.listByBankAccountIds(accountIds, { limit: 10 }),
      transactionsRepository.listByBankAccountIds(accountIds, {
        from: fromDate,
        to: todayEnd
      })
    ]);

    let todayRevenueVnd = 0;
    const revenueByDay = new Map<string, number>();

    for (let i = 0; i < period; i++) {
      const d = new Date(todayStart);
      d.setUTCDate(d.getUTCDate() - (period - 1 - i));
      const key = d.toISOString().slice(0, 10);
      revenueByDay.set(key, 0);
    }

    for (const tx of rangeRows) {
      const amount = Number(tx.amount);
      const dateKey = tx.occurredAt.toISOString().slice(0, 10);
      if (amount > 0) {
        revenueByDay.set(dateKey, (revenueByDay.get(dateKey) ?? 0) + amount);
        if (tx.occurredAt >= todayStart && tx.occurredAt <= todayEnd) {
          todayRevenueVnd += amount;
        }
      }
    }

    const sortedDates = Array.from(revenueByDay.keys()).sort();
    const chart_data: ChartDataPoint[] = sortedDates.map((date) => {
      const d = new Date(date + "T00:00:00.000Z");
      return {
        date,
        revenue: revenueByDay.get(date) ?? 0,
        label: formatChartLabel(d, period)
      };
    });

    const recent_transactions: RecentTransactionDto[] = recentRows.map((tx) => ({
      id: tx.id,
      amount: Number(tx.amount),
      type: tx.type,
      description: tx.description ?? "",
      occurred_at: tx.occurredAt.toISOString()
    }));

    return {
      total_accounts: totalAccounts,
      total_plans: totalPlans,
      total_balance_vnd: totalBalanceVnd,
      today_revenue_vnd: todayRevenueVnd,
      chart_data,
      recent_transactions
    };
  }
}

export const dashboardService = new DashboardService();
