import React, { useEffect, useMemo, useRef } from "react";
import {
  Box
} from "@mui/material";
import Handsontable from 'handsontable';
import chroma from 'chroma-js';
import { HeatmapDataSource, HeatmapProps } from "./Heatmap.props";

const heatmapScale = chroma.scale([
  '#fdbaa1',
  '#67010f'
]);

const generateHandsontableWidgetProps = ({
  tableData,
  tableHeaders
}: HeatmapDataSource) => {
  const preparedData = tableHeaders.map((header, index) => {
    const data: Array<string | number> = [header];

    tableData.forEach(source => {
      data.push(source[index]);
    });

    return data;
  });

  const firstElem = preparedData.shift();

  if (firstElem) {
    preparedData.push(firstElem);
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

export const HandsontableWidget = ({
  data,
  widgetId
}: HeatmapProps) => {
  const heatMapChartRef = useRef<Handsontable | null>(null);
  const heatMapMinMaxValuesRef = useRef<ReturnType<typeof getMaxAndMinValueFromMatrix> | null>(null);

  const memoizedData = useMemo(() => {
    const {
      minAndMaxValues,
      preparedData
    } = generateHandsontableWidgetProps(data);

    heatMapMinMaxValuesRef.current = minAndMaxValues;

    if (heatMapChartRef.current) {
      heatMapChartRef.current.loadData(preparedData);
      heatMapChartRef.current.render();
    };

    return preparedData;
  }, [data]);

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
          tableCell.style.border = '1px solid black';
          tableCell.style.color = 'black';

          if (
            typeof value !== 'string'
            && heatMapMinMaxValuesRef.current
          ) {
            const opacityPercentage = calculatePercentageOfANumberBetweenBoundaries(value, heatMapMinMaxValuesRef.current);
            const chroma = heatmapScale(opacityPercentage).hex();
            tableCell.style.backgroundColor = chroma;
            tableCell.textContent = ''
            tableCell.style.height = '40px'
          }
        },
      });
    };
  }, [memoizedData, widgetId]);

  return (
    <Box bgcolor='white' position='relative' id={widgetId} />
  );
};
