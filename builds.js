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

  getBuildTimeseriesData: (appSlugsFilter, data) => {
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

            let build_duration = (finished_at.getTime() - started_on_worker_at.getTime()) / 60000;
            let queue_duration = (started_on_worker_at.getTime() - triggered_at.getTime()) / 60000;

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

            let build_duration = (finished_at.getTime() - started_on_worker_at.getTime()) / 60000;
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