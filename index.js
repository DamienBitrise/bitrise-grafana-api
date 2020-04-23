const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const fetch = require('node-fetch');
const builds = require('./builds')
const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function keepAlive(){
  fetch('https://BitriseAPI--damo1884.repl.co/')
    .then(res => res.json())
    .then((res) => {
      console.log('Keep Alive');
    });
}

setInterval(()=>{
  keepAlive()
}, 10*1000*60);

app.get('/', (req, res) => {
  console.log('/ health check');
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
  res.json([
  // {
  //   "text": "text shown in body",
  //   "title": "Annotation Title",
  //   "isRegion": true,
  //   "time": "timestamp",
  //   "timeEnd": "timestamp",
  //   "tags": ["tag1"]
  // }
  ]);
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
  res.json([
  // {
  //   "text": "text shown in body",
  //   "title": "Annotation Title",
  //   "isRegion": true,
  //   "time": "timestamp",
  //   "timeEnd": "timestamp",
  //   "tags": ["tag1"]
  // }
  ]);
});

app.post('/running/search', (req, res) => {
  console.log('/running/search');
  res.json(["running"]);
});

app.post('/running/query', (req, res) => {
  console.log('/running');

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
  res.json([
  // {
  //   "text": "text shown in body",
  //   "title": "Annotation Title",
  //   "isRegion": true,
  //   "time": "timestamp",
  //   "timeEnd": "timestamp",
  //   "tags": ["tag1"]
  // }
  ]);
});

app.listen(3000, () => console.log('server started'));
