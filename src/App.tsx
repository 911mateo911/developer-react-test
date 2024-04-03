import React, { useMemo, useState } from "react";
import { HandsontableWidget, HighchartsWidget, MuiHeatmap } from "./widgets";
import {
  AppBar,
  Box,
  Button,
  ButtonProps,
  Container,
  Grid,
  Toolbar,
  Typography,
} from "@mui/material";

type AVAILABLE_DATA_SOURCES = 'products' | 'regions' | 'versions';

const getBtnVariantBasedOnDataSrcSelection = (
  dataSrc: AVAILABLE_DATA_SOURCES,
  selectedSrc: AVAILABLE_DATA_SOURCES
): ButtonProps['variant'] | undefined => {
  if (dataSrc === selectedSrc) {
    return 'contained';
  };
}

function App() {
  const [selectedDataSourceType, setSelectedDataSourceType] = useState<AVAILABLE_DATA_SOURCES>('versions');

  const dataSource = useMemo(() => {
    try {
      const dataSrc = require(`./dataSources/${selectedDataSourceType}.json`);

      return dataSrc;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [selectedDataSourceType]);

  return (
    <Box className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h1"
            noWrap
            component="div"
            sx={{ fontSize: 20, flexGrow: 1 }}
          >
            Developer Assessment
          </Typography>
          <Box>
            <Typography
              variant="overline"
              component="span"
              sx={{ marginRight: 3 }}
            >
              Data Source:
            </Typography>
            <Button
              variant={getBtnVariantBasedOnDataSrcSelection('versions', selectedDataSourceType)}
              onClick={() => setSelectedDataSourceType('versions')}
              size="small"
            >
              Versions
            </Button>
            <Button
              variant={getBtnVariantBasedOnDataSrcSelection('products', selectedDataSourceType)}
              size="small"
              onClick={() => setSelectedDataSourceType('products')} sx={{ margin: "0 15px" }}
            >
              Products
            </Button>
            <Button
              variant={getBtnVariantBasedOnDataSrcSelection('regions', selectedDataSourceType)}
              size="small"
              onClick={() => setSelectedDataSourceType('regions')}
            >
              Regions
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ paddingTop: 3 }} maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item lg={12} >
            <Typography variant="h5" sx={{ marginBottom: 1 }}>
              Mui heatmap
            </Typography>
            <MuiHeatmap
              data={dataSource}
            />
          </Grid>
          <Grid item lg={12}>
            <Typography variant="h5" sx={{ marginBottom: 1 }}>
              Highcharts Heatmap
            </Typography>
            <HighchartsWidget
              widgetId="highcharts"
              data={dataSource}
            />
          </Grid>
          <Grid item lg={12}>
            <Typography variant="h5" sx={{ marginBottom: 1 }}>
              Handsontable Heatmap
            </Typography>
            <HandsontableWidget
              widgetId="handsontable"
              data={dataSource}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
