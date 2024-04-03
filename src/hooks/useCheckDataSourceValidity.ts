import { HeatmapDataSource } from "../widgets";

export const checkDataSourceValidity = ({
  tableData,
  tableHeaders
}: HeatmapDataSource) => {
  const tableDataIsValid = tableData.every((
    mtx
  ) => {
    return mtx.every((value, index) => {
      if (index === 0) {
        return typeof value === 'string';
      } else {
        return typeof value === 'number' && !isNaN(value);
      }
    })
  });

  const dataMatrixHaveSameLength = tableData.every(mtx => mtx.length === tableData[0].length);

  const tableHeadersLength = tableHeaders.length;
  const tableHeadersAreTheSameLengthAsData = dataMatrixHaveSameLength && tableHeadersLength === tableData[0].length;

  return {
    condition: tableDataIsValid && tableHeadersAreTheSameLengthAsData,
    tableDataIsValid,
    tableHeadersAreTheSameLengthAsData
  };
};

export const useCheckDataSourceValidity = (data: HeatmapDataSource) => {
  const validityCheck = checkDataSourceValidity(data);

  if (!validityCheck.condition) {
    // Or do something else here
    console.error({
      cause: 'INVALID DATA PROVIDED',
      data,
      ...validityCheck
    });
  };

  return validityCheck;
}
