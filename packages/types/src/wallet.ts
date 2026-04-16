export enum WalletType {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
}

export enum WalletPermission {
  VIEW = 'VIEW',
  CONTRIBUTE = 'CONTRIBUTE',
}

export interface IWallet {
  id: string;
  name: string;
  type: WalletType;
  ownerUserId: string | null;
  openingBalanceMinor: number;
  currency: string;
  description: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IWalletShare {
  id: string;
  walletId: string;
  userId: string;
  permission: WalletPermission;
  createdAt: string;
}

export interface IWalletWithBalance extends IWallet {
  currentBalanceMinor: number;
}
