export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum CategoryScope {
  GLOBAL = 'GLOBAL',
  PRIVATE = 'PRIVATE',
}

export interface ICategory {
  id: string;
  name: string;
  type: CategoryType;
  scope: CategoryScope;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
