import React, { useEffect, useMemo, useRef } from "react";
import {
  Box
} from "@mui/material";
import Handsontable from 'handsontable';
import chroma from 'chroma-js';
import { HeatmapDataSource, HeatmapProps } from "./Heatmap.props";
import styles from './HandsontableWidget.module.css';

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
    const firstElem = preparedData.shift();

    if (firstElem) {
      preparedData.push(firstElem);
    }
  }

  const minAndMaxValues = getMaxAndMinValueFromMatrix(preparedData);

  return {
    preparedData,
    minAndMaxValues
  }
};

const getMaxAndMinValueFromMatrix = (tableData: HeatmapDataSource['tableData']) => {
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

const calculatePercentageOfANumberBetweenBoundaries = (num: number, {
  maxNumber,
  minNumber
}: ReturnType<typeof getMaxAndMinValueFromMatrix>) => {
  const letfHandOperation = ((num - minNumber) / (maxNumber - minNumber));

  return letfHandOperation;
};

interface HandsontableWidgetProps extends HeatmapProps {
  options?: Handsontable.GridSettings;
  xAxisOnTop?: boolean;
};

export const HandsontableWidget = ({
  data,
  widgetId,
  colorScale = [
    '#fdbaa1',
    '#67010f'
  ],
  options,
  xAxisOnTop
}: HandsontableWidgetProps) => {
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
            tableCell.style.backgroundColor = chroma;
            tableCell.textContent = ''
          }
        },
        ...options
      });
    } else {
      if (options) {
        heatMapChartRef.current?.updateSettings(options);
        heatMapChartRef.current?.render();
      }
    };
  }, [heatmapScale, memoizedData, options, widgetId]);

  return (
    <Box bgcolor='white' position='relative' id={widgetId} />
  );
};
