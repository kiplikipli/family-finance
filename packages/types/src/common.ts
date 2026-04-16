export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
}

export interface IDateRangeQuery {
  from?: string;
  to?: string;
}

export interface IDashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
}
