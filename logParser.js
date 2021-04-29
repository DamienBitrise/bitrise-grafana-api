const utils = require('./utils')
const fetch = require('node-fetch');
const startLine = 'bitrise summary';
const endLine= 'Total runtime:';
const successLine = '✓';
const errorLine = 'x';
const spacer = '|';

function getBuildLogs(api_key, appSlug, buildSlug){
    return fetch(utils.BASE_URL+'/'+appSlug+'/builds/'+buildSlug+'/log', utils.getHeaders(api_key))
    .then(response => response.json());
}

function getBuildLogContent(buildLogUrl){
    return fetch(buildLogUrl)
    .then(response => response.text());
}

function getStepLines(log){
    let steps = [];
    let lines = log.split('\n');
    lines.reverse();
    let foundStart = false;
    let foundEnd = false;
    for(let i=0; i < lines.length; i++){
        let line = lines[i];
        if(line.indexOf(startLine) > -1){
            foundStart = true;
        }
        if(line.indexOf(endLine) > -1){
            foundEnd = true;
        }
        if(foundEnd && !foundStart && (line.indexOf(successLine) > -1 || line.indexOf(errorLine) > -1)){
            let parts = line.split(spacer);
            parts.map((part) => part.trim());
            let stepPassed = parts[1].indexOf(successLine) > -1;
            let stepTitle = parts[2].trim();
            let unicode = JSON.stringify(stepTitle);
            stepTitle = unicode.substring(13, unicode.length-12);
            let time = parts[3].trim();
            let timeParts = time.split(' ');
            let stepTime = parseFloat(timeParts[0]);
            if(timeParts[1].indexOf('min') > -1){
                stepTime = stepTime*60;
            }
            // console.log('stepTime[',stepTime);
            steps.push({
                success: stepPassed,
                step: stepTitle,
                time: parseFloat(stepTime),
            });
        }
    }
    if(steps.length == 0){
        // console.log('NO STEPS FOUND START', lines.join('\n'));
        console.log('NO STEPS FOUND END');
    }
    return steps.reverse();
}


module.exports = {
    getStepTimings: (api_key, appSlug, builds, callback) => {
        let completeCount = 0;
        builds.forEach((build) => {
            if(build.status != 1){
                completeCount++;
                if(completeCount == builds.length-1){
                    callback(builds);
                }
                return;
            }
            getBuildLogs(api_key, appSlug, build.slug)
            .then(result => {
                if(result.expiring_raw_log_url && result.expiring_raw_log_url != ''){
                    getBuildLogContent(result.expiring_raw_log_url)
                    .then(log => {
                        let stepTimes = getStepLines(log);
                        let total = 0;
                        stepTimes.forEach((step)=>total+=parseFloat(step.time))
                        build.steps = stepTimes;
                        build.total = total;
                        completeCount++;
                        if(completeCount == builds.length-1){
                            callback(builds);
                        }
                    })
                    .catch(error => {
                        console.log('Steps Error: ', error);
                        completeCount++;
                        if(completeCount == builds.length-1){
                            callback(builds);
                        }
                    });
                } else {
                    completeCount++;
                    if(completeCount == builds.length-1){
                        callback(builds);
                    }
                }
            })
            .catch(error => {
                console.log('Log error', error);
                completeCount++;
                if(completeCount == builds.length-1){
                    callback(builds);
                }
            });
        })
    }
}