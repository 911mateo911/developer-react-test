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
    value, index
  ) => {
    if (index === 0) {
      return typeof value === 'string'
    } else {
      return typeof value === 'number' && !isNaN(value)
    }
  });

  const tableHeadersLength = tableHeaders.length;
  const tableHeadersAreTheSameLengthAsData = tableHeadersLength === tableData.slice(1).length;

  return tableDataIsValid && tableHeadersAreTheSameLengthAsData;
};

export const HighchartsWidget = ({
  widgetId,
  data
}: HeatmapProps) => {
  const {
    tableData,
    tableHeaders
  } = data;

  if (!checkDataSourceValidity(data)) {
    console.dir({
      cause: 'INVALID DATA PROVIDED',
      data
    });
  };

  const chartRef = useRef<ReturnType<typeof Highcharts.chart> | null>(null);

  const yAxisNormalizedHeaders = tableHeaders.slice(1);
  const yAxisTitle = tableHeaders[0];

  const xAxisHeaders = tableData.flatMap(data => data[0].toString());
  const memoizedChartData = useMemo(() => generateHighchartsData(tableData), [tableData]);

  useEffect(() => {
    chartRef.current = Highcharts.chart(widgetId, {
      chart: {
        type: 'heatmap',
        plotBorderWidth: 1
      },
      yAxis: {
        categories: yAxisNormalizedHeaders,
        title: {
          text: yAxisTitle,
        },
        reversed: true
      },
      title: {
        text: 'Highcharts Widget',
      },
      xAxis: {
        categories: xAxisHeaders,
        title: {
          text: ''
        }
      },
      colorAxis: {
        min: 0,
        minColor: '#fdbaa1',
        maxColor: '#67010f'
      },
      series: [
        {
          type: 'heatmap',
          borderWidth: 1,
          data: memoizedChartData
        }
      ]
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    }
  }, [memoizedChartData, widgetId, xAxisHeaders, yAxisNormalizedHeaders, yAxisTitle]);

  return (
    <Box id={widgetId} />
  );
};
