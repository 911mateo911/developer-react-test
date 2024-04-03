import { HeatmapDataSource } from "./Heatmap.props";

export const getMaxAndMinValueFromMatrix = (tableData: HeatmapDataSource['tableData']) => {
  let maxNumber = Number.MIN_SAFE_INTEGER;
  let minNumber = Number.MAX_SAFE_INTEGER;

  tableData.forEach(source => {
    source.forEach(value => {
      if (typeof value === 'string') {
        return;
      };

      if (value > maxNumber) {
        maxNumber = value;
      };

      if (value < minNumber) {
        minNumber = value;
      };
    })
  });

  return {
    maxNumber,
    minNumber
  };
};

export const calculatePercentageOfANumberBetweenBoundaries = (num: number, {
  maxNumber,
  minNumber
}: ReturnType<typeof getMaxAndMinValueFromMatrix>) => {
  const letfHandOperation = ((num - minNumber) / (maxNumber - minNumber));

  return letfHandOperation;
};
