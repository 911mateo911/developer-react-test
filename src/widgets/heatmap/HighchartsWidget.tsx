import React, { useEffect, useMemo, useRef } from "react";
import Highcharts, { PointOptionsObject } from 'highcharts';
import 'highcharts/modules/heatmap'
import HM from 'highcharts/modules/heatmap.src'
import {
  Box
} from "@mui/material";
import { HeatmapDataSource, HeatmapProps } from "./Heatmap.props";
import { useCheckDataSourceValidity } from "../../hooks/useCheckDataSourceValidity";
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
  });
};
interface HighchartsWidgetProps extends HeatmapProps {
  options?: Highcharts.Options;
  onInstanceAttached?: (instance: ReturnType<typeof Highcharts.chart>) => void;
};

export const HighchartsWidget = ({
  widgetId,
  data,
  colorScale = [
    '#fdbaa1',
    '#67010f'
  ],
  options = {},
  onInstanceAttached
}: HighchartsWidgetProps) => {
  const {
    tableData,
    tableHeaders
  } = data;

  useCheckDataSourceValidity(data);

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
      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 16,
        ...options?.legend,
        verticalAlign: 'middle'
      },
      tooltip: {
        format: '<b>{point.value}</b>',
        ...options?.tooltip,
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
    onInstanceAttached?.(chartRef.current);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    }
  }, [colorScale, memoizedChartData, options, widgetId, xAxisHeaders, yAxisNormalizedHeaders, yAxisTitle, onInstanceAttached]);

  return (
    <Box id={widgetId} />
  );
};
