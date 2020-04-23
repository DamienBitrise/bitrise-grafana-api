const utils = require('./utils')
const fetch = require('node-fetch');

function getApps(all_apps, api_key, callback) {
  return fetch(utils.BASE_URL, utils.getHeaders(api_key))
    .then(res => res.json())
    .then((apps) => {
      apps.data.forEach((app)=>{
        all_apps[app.slug] = {
          app
        };
      })
      if(apps.paging.next){
        getApps(all_apps, api_key, apps.paging.next, callback)
      } else {
        callback(all_apps);
      }
    });
}

function getBuilds(api_key, all_builds, from, to, appSlug, next, callback) {
  let fromDate = new Date(from);
  let toDate = new Date(to);
  let fromTimestamp = parseInt(fromDate.getTime()/1000);
  let toTimestamp = parseInt(toDate.getTime()/1000);
  let nextStr = next ? '?after='+fromTimestamp+'&before='+toTimestamp+'&next='+next : '?after='+fromTimestamp+'&before='+toTimestamp;
  let url = utils.BASE_URL+'/'+appSlug+'/builds'+nextStr;
  return fetch(url, utils.getHeaders(api_key))
    .then(res => res.json())
    .then((builds) => {
      if(!builds.paging){
        console.log('Error:', builds);
      }
      all_builds = all_builds.concat(builds.data)
      if(builds.paging.next){
        getBuilds(api_key, all_builds, from, to, appSlug, builds.paging.next, callback)
      } else {
        callback(all_builds);
      }
    });
}
module.exports = {
  getAllData: (appSlugsFilter, api_key, from, to, callback) => {
    let all_apps = {};
    getApps(all_apps, api_key, (apps) => {
      let appSlugs = Object.keys(apps);
      let complete = 0;
      appSlugs.forEach((appSlug)=>{
        if(!appSlugsFilter || appSlugsFilter.indexOf(appSlug) != -1){
          all_apps[appSlug] = apps[appSlug];
          let all_builds = [];
          getBuilds(api_key, all_builds, from, to, appSlug, 0, (builds) => {
            complete++;
            all_apps[appSlug].builds = builds;
            if(complete == appSlugs.length || (appSlugsFilter && complete == appSlugsFilter.length)){
              callback(all_apps);
            }
          })
        }
      });
    });
  },

  getBuildTableData: (appSlugsFilter, data) => {
    let table_data = [];
    let appSlugs = Object.keys(data);
    appSlugs.forEach((appSlug) => {
      if(!appSlugsFilter || appSlugsFilter.indexOf(appSlug) != -1){
        let app = data[appSlug];
        app.builds.forEach((build) => {
          let now = new Date();
          let triggered_at = new Date(build.triggered_at);
          let queue_duration = 0;
          if(build.started_on_worker_at){
            let started_on_worker_at = new Date(build.started_on_worker_at);
            queue_duration = (started_on_worker_at.getTime() - triggered_at.getTime()) / 60000;
          }else{
            queue_duration = (now.getTime() - triggered_at.getTime()) / 60000;
          }

          if(build.status_text == 'in-progress' || !build.started_on_worker_at){
            duration = (now.getTime() - triggered_at.getTime()) / 60000;
          } else {
            let finished_at = new Date(build.finished_at);
            let started_on_worker_at = new Date(build.started_on_worker_at);
            duration = (finished_at.getTime() - started_on_worker_at.getTime()) / 60000;
          }

          let name = app.app.title;
          let buildNum = parseInt(build.build_number);
          let workflow = build.triggered_workflow;
          let stack = build.stack_identifier;
          let branch = build.branch;
          let status = build.status_text;
          let slug = build.slug;
          table_data.push([
            triggered_at,
            '<a href="https://app.bitrise.io/app/'+appSlug+'#/builds" target="_blank">'+name+'</a>',
            '<a href="https://app.bitrise.io/build/'+slug+'#?tab=log" target="_blank">'+buildNum+'</a>',
            '<a href="https://app.bitrise.io/app/'+appSlug+'/workflow_editor#!/workflows?workflow_id='+workflow+'" target="_blank">'+workflow+'</a>',
            stack,
            branch,
            status,
            duration.toFixed(1) + ' mins',
            queue_duration.toFixed(1) + ' mins'
            ])
          
        })
      }
    })
    table_data.sort((a,b) => b[0].getTime() - a[0].getTime())
    return [
      {
        "type":"table",
        "columns":[
            {
              "text":"Started At",
              "type":"time"
            },
            {
              "text":"App",
              "type":"string"
            },
            {
              "text":"Build #",
              "type":"int"
            },
            {
              "text":"Workflow",
              "type":"string"
            },
            {
              "text":"Stack",
              "type":"string"
            },
            {
              "text":"Branch",
              "type":"string"
            },
            {
              "text":"Status",
              "type":"string"
            },
            {
              "text":"Duration",
              "type":"string"
            },
            {
              "text":"Queued",
              "type":"string"
            }
        ],
        "rows": table_data
      }
    ];
  },

  getBuildTimeseriesData: (appSlugsFilter, data) => {
    let timeseries_data = [];
    let appSlugs = Object.keys(data);
    appSlugs.forEach((appSlug) => {
      if(!appSlugsFilter || appSlugsFilter.indexOf(appSlug) != -1){
        let buildDurations = [];
        let app = data[appSlug];
        app.builds.forEach((build) => {
          if((build.status_text == 'success' || build.status_text == 'error') && build.started_on_worker_at){
            let started_on_worker_at = new Date(build.started_on_worker_at);
            let finished_at = new Date(build.finished_at);
            let build_duration = (finished_at.getTime() - started_on_worker_at.getTime()) / 60000;

            buildDurations.push([build_duration.toFixed(1),(finished_at.getTime()), 'ABC'])
          }
        })
        timeseries_data.push({
          target: app.app.title,
          datapoints: buildDurations
        })
      }
    })
    return timeseries_data;
  },

  getQueueTimeseriesData: (appSlugsFilter, data) => {
    let timeseries_data = [];
    let appSlugs = Object.keys(data);
    appSlugs.forEach((appSlug) => {
      if(!appSlugsFilter || appSlugsFilter.indexOf(appSlug) != -1){
        let buildDurations = [];
        let app = data[appSlug];
        app.builds.forEach((build) => {
          if((build.status_text == 'success' || build.status_text == 'error') && build.started_on_worker_at){
            let triggered_at = new Date(build.triggered_at);
            let started_on_worker_at = new Date(build.started_on_worker_at);
            let finished_at = new Date(build.finished_at);
            let queue_duration = (started_on_worker_at.getTime() - triggered_at.getTime()) / 60000;

            buildDurations.push([queue_duration.toFixed(1),(finished_at.getTime())])
          }
        })
        timeseries_data.push({
          target: app.app.title,
          datapoints: buildDurations
        })
      }
    })
    return timeseries_data;
  }
}