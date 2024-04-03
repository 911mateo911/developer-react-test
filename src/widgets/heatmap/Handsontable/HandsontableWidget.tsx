import React, { useEffect, useMemo, useRef } from "react";
import {
  Box
} from "@mui/material";
import Handsontable from 'handsontable';
import chroma from 'chroma-js';
import { HeatmapDataSource, HeatmapProps } from "../Heatmap.props";
import styles from './HandsontableWidget.module.css';
import { useCheckDataSourceValidity } from "../../../hooks/useCheckDataSourceValidity";
import { calculatePercentageOfANumberBetweenBoundaries, getMaxAndMinValueFromMatrix } from "../helpers";

const generateHandsontableWidgetProps = ({
  tableData,
  tableHeaders
}: HeatmapDataSource, xAxisOnTop?: boolean) => {
  const preparedData = tableHeaders.map((header, index) => {
    const data: Array<string | number> = [header];

    tableData.forEach(source => {
      data.push(source[index]);
    });

    return data;
  });

  if (!xAxisOnTop) {
    [preparedData[0], preparedData[preparedData.length - 1]] = [preparedData[preparedData.length - 1], preparedData[0]];
  }

  const minAndMaxValues = getMaxAndMinValueFromMatrix(preparedData);

  return {
    preparedData,
    minAndMaxValues
  }
};

interface HandsontableWidgetProps extends HeatmapProps {
  options?: Handsontable.GridSettings;
  xAxisOnTop?: boolean;
  onInstanceAttached?: (instance: Handsontable) => void;
};

export const HandsontableWidget = ({
  data,
  widgetId,
  colorScale = [
    '#fdbaa1',
    '#67010f'
  ],
  options,
  xAxisOnTop,
  onInstanceAttached
}: HandsontableWidgetProps) => {
  useCheckDataSourceValidity(data);
  const heatmapScale = chroma.scale(colorScale);
  const heatMapChartRef = useRef<Handsontable | null>(null);
  const heatMapMinMaxValuesRef = useRef<ReturnType<typeof getMaxAndMinValueFromMatrix> | null>(null);

  const memoizedData = useMemo(() => {
    const {
      minAndMaxValues,
      preparedData
    } = generateHandsontableWidgetProps(data, xAxisOnTop);

    heatMapMinMaxValuesRef.current = minAndMaxValues;

    if (heatMapChartRef.current) {
      heatMapChartRef.current.loadData(preparedData);
      heatMapChartRef.current.render();
    };

    return preparedData;
  }, [data, xAxisOnTop]);

  useEffect(() => {
    const widgetContainer = document.getElementById(widgetId);

    if (widgetContainer && !heatMapChartRef.current) {
      heatMapChartRef.current = new Handsontable(widgetContainer, {
        data: memoizedData,
        licenseKey: 'non-commercial-and-evaluation',
        colWidths: 100,
        stretchH: 'all',
        width: '100%',
        renderer(...args) {
          Handsontable.renderers.TextRenderer(...args);

          const tableCell = args[1];
          const value = args[5];
          tableCell.classList.add(styles.tableCellDefault);

          if (
            typeof value !== 'string'
            && heatMapMinMaxValuesRef.current
          ) {
            const opacityPercentage = calculatePercentageOfANumberBetweenBoundaries(value, heatMapMinMaxValuesRef.current);
            const chroma = heatmapScale(opacityPercentage).hex();
            tableCell.classList.add(styles.tableDataCell);
            tableCell.style.backgroundColor = chroma;
          }
        },
        ...options
      });
      onInstanceAttached?.(heatMapChartRef.current);
    } else {
      if (options) {
        heatMapChartRef.current?.updateSettings(options);
        heatMapChartRef.current?.render();
      }
    };
  }, [heatmapScale, memoizedData, options, widgetId, onInstanceAttached]);

  return (
    <Box bgcolor='white' position='relative' id={widgetId} />
  );
};
