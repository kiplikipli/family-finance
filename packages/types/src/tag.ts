export enum TagScope {
  GLOBAL = 'GLOBAL',
  PRIVATE = 'PRIVATE',
}

export interface ITag {
  id: string;
  name: string;
  scope: TagScope;
  ownerUserId: string | null;
  deletedAt: string | null;
}
