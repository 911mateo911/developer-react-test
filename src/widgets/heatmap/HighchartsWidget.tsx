import React, { useEffect, useMemo, useRef } from "react";
import Highcharts, { PointOptionsObject } from 'highcharts';
import 'highcharts/modules/heatmap'
import HM from 'highcharts/modules/heatmap.src'
import {
  Box
} from "@mui/material";
import { HeatmapDataSource, HeatmapProps } from "./Heatmap.props";
HM(Highcharts);

const generateHighchartsData = (tableData: HeatmapDataSource['tableData']): PointOptionsObject[] => {
  return tableData.flatMap((data, xIndex) => {
    return data.slice(1).map((val, yIndex) => {
      return {
        value: val,
        y: yIndex,
        x: xIndex
      } as PointOptionsObject;
    })
  })
};

const checkDataSourceValidity = ({
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

interface HighchartsWidgetProps extends HeatmapProps {
  options?: Highcharts.Options;
}

export const HighchartsWidget = ({
  widgetId,
  data,
  colorScale = [
    '#fdbaa1',
    '#67010f'
  ],
  options = {}
}: HighchartsWidgetProps) => {
  const {
    tableData,
    tableHeaders
  } = data;

  const validityCheck = checkDataSourceValidity(data);
  if (!validityCheck.condition) {
    console.error({
      cause: 'INVALID DATA PROVIDED',
      data,
      ...validityCheck
    });
  };

  const chartRef = useRef<ReturnType<typeof Highcharts.chart> | null>(null);

  const yAxisNormalizedHeaders = tableHeaders.slice(1);
  const yAxisTitle = tableHeaders[0];

  const xAxisHeaders = tableData.flatMap(data => data[0].toString());
  const memoizedChartData = useMemo(() => generateHighchartsData(tableData), [tableData]);

  useEffect(() => {
    const [minColor, maxColor] = colorScale;

    const instanceOptions: Highcharts.Options = {
      chart: {
        type: 'heatmap',
        plotBorderWidth: 1,
        ...options?.chart
      },
      yAxis: {
        categories: yAxisNormalizedHeaders,
        title: {
          text: yAxisTitle,
        },
        reversed: true,
        ...options?.yAxis
      },
      title: {
        text: 'Highcharts Widget',
        ...options?.title
      },
      xAxis: {
        categories: xAxisHeaders,
        title: {
          text: ''
        },
        ...options?.xAxis
      },
      colorAxis: {
        min: 0,
        minColor,
        maxColor,
        ...options?.colorAxis
      },
      series: options?.series || [
        {
          type: 'heatmap',
          borderWidth: 1,
          data: memoizedChartData
        }
      ]
    };
    chartRef.current = Highcharts.chart(widgetId, instanceOptions);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    }
  }, [colorScale, memoizedChartData, options, widgetId, xAxisHeaders, yAxisNormalizedHeaders, yAxisTitle]);

  return (
    <Box id={widgetId} />
  );
};
