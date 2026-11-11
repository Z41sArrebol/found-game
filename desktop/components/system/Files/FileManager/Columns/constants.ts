type ColumnData = {
  name: string;
  width: number;
};

export const MAX_STEPS_PER_RESIZE = 15;

export type ColumnName = "date" | "name" | "size" | "type";

export type Columns = Record<ColumnName, ColumnData>;

export const DEFAULT_COLUMN_ORDER: ColumnName[] = [
  "name",
  "date",
  "type",
  "size",
];

export const DEFAULT_COLUMNS: Columns = {
  date: {
    name: "修改日期",
    width: 133,
  },
  name: {
    name: "名称",
    width: 133,
  },
  size: {
    name: "大小",
    width: 70,
  },
  type: {
    name: "类型",
    width: 80,
  },
};
