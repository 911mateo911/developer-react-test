export interface HeatmapDataSource {
  tableHeaders: string[];
  tableData: Array<[string, ...number[]] | (string | number)[]>;
}

export interface HeatmapProps {
  widgetId: string;
  data: HeatmapDataSource;
  colorScale?: [string, string];
}
