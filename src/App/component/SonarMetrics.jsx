import * as React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import axios from "axios";
import {Card, CardActionArea, CardContent, CardMedia, makeStyles, Typography} from "@material-ui/core";
import {randomHash, toUpperCamelCase} from "../../utils";
import {SiSonarqube} from "react-icons/si";

const baseURL = 'http://localhost:9100/pvs-api';
const jwt = localStorage.getItem("jwtToken");

const sonarMetricsProxyApiPath = '/proxy/sonar/metrics';
const createClient = (baseURL, headers) => {
  return axios.create({baseURL, headers});
};

const bestValueBadgeUrl = 'https://i.imgur.com/iPwxQft.webp';
const warningValueBadgeUrl = 'https://i.imgur.com/WtPSvXt.webp';

const SONAR_METRICS_KEYS = [
  {
    name: 'reliability_rating',
    logoUrl: 'https://i.imgur.com/RxfGk5l.webp'
  },
  {
    name: 'bugs',
    logoUrl: 'https://i.imgur.com/9fieME5.webp'
  },
  {
    name: 'code_smells',
    logoUrl: 'https://i.imgur.com/ANhJtOM.webp'
  },
  {
    name: 'security_rating',
    logoUrl: 'https://i.imgur.com/JoUXs1o.webp'
  },
  {
    name: 'duplicated_blocks',
    logoUrl: 'https://i.imgur.com/cmxC7ZG.webp'
  },
  {
    name: 'critical_violations',
    logoUrl: 'https://i.imgur.com/mwqZYrI.webp'
  }
];

async function sendPVSBackendRequest(client, method, url, params, data) {
  try {
    return (await client.request({url, method, params, data}))?.data;
  } catch (e) {
    console.warn(e);
    return null;
  }
}

const useStyles = makeStyles(() => ({
  metricsTitle: {
    margin: '2rem 0 0 calc(1.5rem + 8px)',
    fontFamily: 'Trebuchet MS'
  },

  metricsContainer: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
    gridTemplateRows: 'auto',
    justifyItems: 'center',
    gap: '1.5rem',
    padding: '1.5rem'
  },

  metricCard: {
    width: '100%'
  },

  metricCardHeaderContainer: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    margin: '0 0 1em 0'
  },

  metricCardTitle: {
    fontWeight: 'bolder',
    color: 'rgb(82, 104, 116)',
    fontFamily: 'Trebuchet MS'
  },

  metricCardContentContainer: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  metricCardValue: {
    display: 'inline-block',
    color: '#236a97',
    height: 'auto',
    lineHeight: 'normal',
    verticalAlign: 'middle',
    fontFamily: 'monospace'
  },

  metricCardImg: {
    display: 'inline-block',
    width: '3em',
    height: '3em',
  },

  metricHeaderImg: {
    display: 'inline-block',
    width: '2em',
    height: '2em',
    margin: '0 1em 0 0',
  },

  colorfulDivider: {
    width: '95%',
    height: '7px',
    borderRadius: '10px',
    marginRight: 'auto',
    marginLeft: 'auto',
    position: 'relative',
    background: 'linear-gradient(-45deg,#3ec1d3,#f6f7d7,#ff9a00,#ff165d)'
  }
}));

const SonarMetrics = React.memo((props) => {
  const httpClientHeaders = useMemo(() => {
    return {
      ...(jwt && {'Authorization': jwt})
    };
  }, [jwt]);

  const httpClient = useMemo(() => createClient(baseURL, httpClientHeaders), [baseURL, httpClientHeaders]);

  const getMetricsData = useCallback(async () => {
    const params = {
      'metricKeys': SONAR_METRICS_KEYS.map(key => key.name).join(','),
      'component': props.sonarComponentName
    };
    return await sendPVSBackendRequest(httpClient, 'GET', sonarMetricsProxyApiPath, params);
  }, [props.sonarComponentName]);

  const styles = useStyles();
  const [metricsData, setMetricData] = useState();

  useEffect(() => {
    getMetricsData().then((data) => {
      if (!data)
        return;
      setMetricData(data);
    });
  }, [props.sonarComponentName]);

  return (
    <>
      <h1 className={styles.metricsTitle}>
        <SiSonarqube size={24}/> Sonar Metrics
      </h1>
      <div className={styles.colorfulDivider}/>
      {
        metricsData &&
        <div className={styles.metricsContainer}>
          {
            metricsData.component.measures.map((measure) => (
              <Card key={randomHash()} className={styles.metricCard}>
                <CardActionArea>
                  <CardContent>
                    <div className={styles.metricCardHeaderContainer}>
                      <CardMedia
                        className={styles.metricHeaderImg}
                        image={SONAR_METRICS_KEYS.find(key => key.name === measure.metric)?.logoUrl}
                      />
                      <Typography variant="h6" component="div" className={styles.metricCardTitle}>
                        {toUpperCamelCase(measure.metric)}
                      </Typography>
                    </div>
                    <div className={styles.metricCardContentContainer}>
                      <Typography variant="h4" component="span" className={styles.metricCardValue}>
                        {measure.value}
                      </Typography>
                      <CardMedia
                        className={styles.metricCardImg}
                        image={measure.bestValue ? bestValueBadgeUrl : warningValueBadgeUrl}
                      />
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))
          }
        </div>
      }
    </>
  )
});

SonarMetrics.displayName = SonarMetrics.name;

export default SonarMetrics;
