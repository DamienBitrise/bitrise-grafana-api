const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const fetch = require('node-fetch');
const builds = require('./builds')
const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*
const {InfluxDB} = require('@influxdata/influxdb-client')

// You can generate a Token from the "Tokens Tab" in the UI
const token = '2w8urO8AVPCBvYCgBQevCxWipHox9d9j8XRI7w1HDcfkQoM8TxNqY7LFVBX-P0nNGfeWRkwoJtfsU7q311r6Hg==';
const org = 'damien.murphy@bitrise.io';
const bucket = 'bitrise-grafana-db';

const client = new InfluxDB({url: 'https://us-west-2-1.aws.cloud2.influxdata.com', token: token})

const {Point} = require('@influxdata/influxdb-client')
const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({host: 'host1'})

const point = new Point('mem')
  .floatField('used_percent', 23.43234543)
writeApi.writePoint(point)
writeApi
    .close()
    .then(() => {
        console.log('FINISHED Write')
    })
    .catch(e => {
        console.error(e)
        console.log('\nFinished ERROR')
    })


const queryApi = client.getQueryApi(org)
const query = `from(bucket: "${bucket}") |> range(start: -1h)`
queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    console.log(
      `${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`
    )
  },
  error(error) {
    console.error(error)
    console.log('\nFinished ERROR')
  },
  complete() {
    console.log('\nFinished Read SUCCESS')
  },
})
*/
function keepAlive(){
  fetch('https://BitriseAPI--damo1884.repl.co/')
    .then(res => res.json())
    .then((res) => {
      console.log('Keep Alive');
    });
}

// setInterval(()=>{
//   keepAlive()
// }, 10*1000*60);

app.get('/', (req, res) => {
  console.log('/health check');
  res.status(200).json({alive:true});
});

app.get('/builds', (req, res) => {
  console.log('/builds health check');
  res.status(200).json({alive:true});
});

app.get('/running', (req, res) => {
  console.log('/running health check');
  res.status(200).json({alive:true});
});

app.get('/stats', (req, res) => {
  console.log('/stats health check');
  res.status(200).json({alive:true});
});

app.get('/queue', (req, res) => {
  console.log('/queue health check');
  res.status(200).json({alive:true});
});

app.post('/builds/search', (req, res) => {
  console.log('/builds/search');
  res.json(["builds"]);
});

app.post('/builds/query', (req, res) => {
  console.log('/builds/query');
  let body = req.body;
  let from = body.range.from;
  let to = body.range.to;
  let appSlugs = req.header('appSlugs');
  if(!appSlugs || appSlugs == ''){
    appSlugs = null;
  } else {
    appSlugs = appSlugs.split(',')
  }
  const API_KEY = req.header('Authorization');

  builds.getAllData(appSlugs, API_KEY, from, to, (data) => {
    let timeseries_data = builds.getBuildTimeseriesData(appSlugs, data);
    res.json(timeseries_data);
  });
});


app.post('/builds/annotations', (req, res) => {
  console.log('/builds/annotations');
  res.json([]);
});

app.post('/queue/search', (req, res) => {
  console.log('/queue/search');
  res.json(["queue"]);
});

app.post('/queue/query', (req, res) => {
  console.log('/queue/query');
  let body = req.body;
  let from = body.range.from;
  let to = body.range.to;
  let appSlugs = req.header('appSlugs');
  if(!appSlugs || appSlugs == ''){
    appSlugs = null;
  } else {
    appSlugs = appSlugs.split(',')
  }
  console.log('App Slug: ', appSlugs);
  const API_KEY = req.header('Authorization');
  builds.getAllData(appSlugs, API_KEY, from, to, (data) => {
    let timeseries_data = builds.getQueueTimeseriesData(appSlugs, data);
    res.json(timeseries_data);
  });
});


app.post('/queue/annotations', (req, res) => {
  console.log('/queue/annotations');
  res.json([]);
});

app.post('/running/search', (req, res) => {
  console.log('/running/search');
  res.json(["running"]);
});

app.post('/running/query', (req, res) => {
  console.log('/running/query');

  let body = req.body;
  let from = body.range.from;
  let to = body.range.to;
  let appSlugs = req.header('appSlugs');
  if(!appSlugs || appSlugs == ''){
    appSlugs = null;
  } else {
    appSlugs = appSlugs.split(',')
  }
  console.log('App Slug: ', appSlugs);
  const API_KEY = req.header('Authorization');
  builds.getAllData(appSlugs, API_KEY, from, to, (data) => {
    let table_data = builds.getBuildTableData(appSlugs, data);
    res.json(table_data);
  });
});

app.post('/running/annotations', (req, res) => {
  console.log('/running/annotations');
  res.json([]);
});

app.post('/stats/search', (req, res) => {
  console.log('/stats/search');
  res.json(["stats"]);
});

app.post('/stats/query', (req, res) => {
  console.log('/stats/query');

  let body = req.body;
  let from = body.range.from;
  let to = body.range.to;
  let appSlugs = req.header('appSlugs');
  if(!appSlugs || appSlugs == ''){
    appSlugs = null;
  } else {
    appSlugs = appSlugs.split(',')
  }
  console.log('App Slug: ', appSlugs);
  const API_KEY = req.header('Authorization');
  builds.getAllData(appSlugs, API_KEY, from, to, (data) => {
    let table_data = builds.getStatsTableData(appSlugs, data);
    res.json(table_data);
  });
});

app.post('/stats/annotations', (req, res) => {
  console.log('/stats/annotations');
  res.json([]);
});

app.post('/steps/search', (req, res) => {
  console.log('/queue/search');
  res.json(["queue"]);
});

app.get('/steps/query', (req, res) => {
  console.log('/steps/query');
  let body = req.body;
  let from = body.range.from;
  let to = body.range.to;
  let appSlugs = req.header('appSlugs');
  if(!appSlugs || appSlugs == ''){
    appSlugs = null;
  } else {
    appSlugs = appSlugs.split(',')
  }
  console.log('App Slug: ', appSlugs);
  const API_KEY = req.header('Authorization');
  builds.getAllData(appSlugs, API_KEY, from, to, (data) => {
    let timeseries_data = builds.getStepsTimeseriesData(appSlugs, data);
    res.json(timeseries_data);
  });
});


app.post('/steps/annotations', (req, res) => {
  console.log('/steps/annotations');
  res.json([]);
});

app.listen(3001, () => console.log('server started'));
