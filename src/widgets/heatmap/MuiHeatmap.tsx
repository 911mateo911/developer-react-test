import React, { useMemo } from 'react';
import { HeatmapDataSource, HeatmapProps } from './Heatmap.props';
import { TableContainer, Paper, Table, TableRow, TableCell, TableBody, TableTypeMap, TableCellProps, SxProps } from '@mui/material';
import chroma from 'chroma-js';
import { useCheckDataSourceValidity } from '../../hooks/useCheckDataSourceValidity';
import { getMaxAndMinValueFromMatrix, calculatePercentageOfANumberBetweenBoundaries } from './helpers';

const getMuiHeatMapData = ({
  tableData,
  tableHeaders,
}: HeatmapDataSource) => {
  const preparedData = tableHeaders.map((header, index) => {
    const data: Array<{
      value: string | number,
      isHeader: boolean;
    }> = [{
      isHeader: true,
      value: header
    }];

    tableData.forEach(source => {
      data.push({
        value: source[index],
        isHeader: false
      });
    });

    return data;
  });

  return preparedData.slice(1);
};

const renderTableHeader = (
  headers: Array<string | number>,
  xAxisName: string,
  headerCellProps?: TableCellProps
): JSX.Element => {
  return (
    <TableRow>
      {[xAxisName, ...headers].map(header => (
        <TableCell
          key={header}
          {...headerCellProps}
          sx={{
            color: 'black',
            height: 40,
            fontSize: 12,
            padding: 0,
            paddingLeft: .5,
            paddingRight: .5,
            textAlign: 'center',
            ...headerCellProps?.sx
          }}
        >
          {header}
        </TableCell>
      ))}
    </TableRow>
  )
};

interface MuiHeatmapProps extends Omit<HeatmapProps, 'widgetId'> {
  tableProps?: TableTypeMap['props'];
  xAxisOnTop?: boolean;
  headerCellProps?: TableCellProps;
  tableCellProps?: TableCellProps;
};

export const MuiHeatmap = ({
  data,
  colorScale = [
    '#fdbaa1',
    '#67010f'
  ],
  tableProps,
  xAxisOnTop,
  headerCellProps,
  tableCellProps
}: MuiHeatmapProps) => {
  const {
    tableData,
    tableHeaders
  } = data;

  useCheckDataSourceValidity(data);

  const heatmapScale = chroma.scale(colorScale);
  const headers = tableData.flatMap(mtx => mtx[0]);
  const xAxisName = tableHeaders[0];

  const minAndMaxValues = getMaxAndMinValueFromMatrix(tableData);

  const memoizedTableData = useMemo(() => getMuiHeatMapData(data), [data]);

  return (
    <TableContainer
      component={Paper}>
      <Table
        {...tableProps}
        sx={{
          bgcolor: 'white',
          tableLayout: 'fixed',
          ...tableProps?.sx
        }}
      >
        <TableBody>
          {xAxisOnTop && renderTableHeader(headers, xAxisName, headerCellProps)}
          {memoizedTableData.map((mtx) => {
            return (
              <TableRow
                key={mtx[0].value}
              >
                {mtx.map(({ value, isHeader }, index) => {
                  const cellStyles: SxProps = {
                    height: 40,
                    fontSize: 12,
                    padding: 0,
                    paddingLeft: 1,
                    paddingRight: 1,
                    borderLeft: '1px solid white',
                    color: isHeader ? 'black' : 'transparent',
                    '&:hover': {
                      color: 'black'
                    },
                    cursor: 'pointer',
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    ...tableCellProps?.style
                  }

                  if (!isHeader && typeof value === 'number') {
                    const opacityPercentage = calculatePercentageOfANumberBetweenBoundaries(
                      value,
                      minAndMaxValues
                    );
                    const chroma = heatmapScale(opacityPercentage).hex();
                    cellStyles.backgroundColor = chroma;
                  }
                  return (
                    <TableCell
                      key={index}
                      component="th"
                      scope="row"
                      {...tableCellProps}
                      sx={cellStyles}
                    >
                      {value}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
          {!xAxisOnTop && renderTableHeader(headers, xAxisName, headerCellProps)}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
