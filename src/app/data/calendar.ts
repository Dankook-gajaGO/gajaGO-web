export interface Memo {
  id: string;
  date: string;
  title: string;
  content?: string;
}

export interface Holiday {
  date: string;
  name: string;
}

export const holidays: Holiday[] = [];
