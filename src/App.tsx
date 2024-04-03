import React, { useMemo, useState } from "react";
import { HandsontableWidget, HighchartsWidget } from "./widgets";
import {
  Alert,
  AppBar,
  Box,
  Button,
  ButtonProps,
  Container,
  Grid,
  Link,
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
          <Grid item lg={12}>
            <Typography variant="h5" sx={{ marginBottom: 1 }}>
              Highcharts Heatmap
            </Typography>
            <Alert severity="warning">
              Please modify the highcharts-widget so that it returns a heatmap
              using &nbsp;
              <Link
                href="https://www.npmjs.com/package/highcharts"
                target="_blank"
              >
                highcharts
              </Link>
              .
            </Alert>
            <HighchartsWidget
              widgetId="mateo"
              data={dataSource}
            />
          </Grid>
          <Grid item lg={12}>
            <Typography variant="h5" sx={{ marginBottom: 1 }}>
              Handsontable Heatmap
            </Typography>
            <Alert severity="warning">
              Please modify the handsontable-widget so that it returns a heatmap
              using &nbsp;
              <Link
                href="https://www.npmjs.com/package/handsontable"
                target="_blank"
                underline="hover"
              >
                handsontable
              </Link>
            </Alert>
            <HandsontableWidget
              widgetId="mateo1"
              data={dataSource}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
