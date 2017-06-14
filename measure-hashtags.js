const Promise = require('bluebird');
const co = require('co');
const Twitter = require('twitter');
const decamelize = require('decamelize');
const getLoaderPromoise = require('./knowledge-loader').getLoaderPromoise;

// ------------------------
// Load config
// ------------------------
const config = require('./config').config;

// ------------------------
// Load data
// ------------------------
const data = require('./test.json');

let twitterApi = new Twitter(config.twitter);

// -------------------------------------------------------------
// Wrapper function to handle async call in Generator style
// -------------------------------------------------------------
function run () {
    return Promise.coroutine(function* (){

        // --------------------------------------
        // Get the promisfied persona classifier
        // --------------------------------------
        let classifier = yield getLoaderPromoise;

        let prettyResult = [];

        // -------------------------------------------
        // Process each line of testing data
        // synchrouously
        // -------------------------------------------
        yield Promise.each(data, co.wrap(function*(d) {
            console.log(`Processing @${d.twitter_account} ...`);
            let tweets =  yield twitterApi.get('statuses/user_timeline', {
                screen_name: d.twitter_account,
                count: config.tweet_count
            }) ;

            let aggragatedText = '';
            // let aggregatedTags = '';
            let hashTagsList = [];

            // -------------------------------------
            // Aggregate the text content of tweets
            // -------------------------------------
            tweets.forEach(function (tweet) {
                aggragatedText = aggragatedText + tweet.text + ' ';
                if (tweet.entities.hashtags && tweet.entities.hashtags.length > 0) {
                    tweet.entities.hashtags.forEach(function (h) {
                        let decamelText = decamelize(h.text, ' ');
                        hashTagsList.push(decamelText);
                    })
                }
            });

            // -------------------------------------
            // Deduplicate hashtags
            // -------------------------------------
            let dedupedHashTagsList = Array.from( new Set(hashTagsList) );
            let dedupedHashTagsString = dedupedHashTagsList.join(' ');

            // ------------------------------------------------------------
            // Get prediction by hashtags
            // Note that the input parameter of getClassifications()
            // "dedupedHashTagsList.join(' ')" and "dedupedHashTagsList"
            // are both valid but different in accuracy the scores.
            // ------------------------------------------------------------
            let prediction = classifier.getClassifications(dedupedHashTagsList.join(' '))

            // -------------------------------------
            // Format the predictions
            // -------------------------------------
            let sum = prediction.reduce(function(acc, score) {
                return acc + score.value;
            }, 0);
            let scoreList = [];
            yield Promise.each(prediction, co.wrap(function*(category) {
                let s = category.value.toPrecision(10);
                let t = sum.toPrecision(10);
                let x = s / t * 100;
                scoreList.push({'label': category.label, 'percent': Math.round(x)});
            }));

            // -------------------------------------
            // Sort score in descending order
            // -------------------------------------
            scoreList.sort(function (a, b){
                return b.percent - a.percent;
            })

            prettyResult.push({
                'twitter_account': d.twitter_account,
                'justification': d.justification,
                'scores': scoreList,
                'dedupedTags': dedupedHashTagsString,
                'prediction': scoreList[0].label
            })
        }));
        return prettyResult;
    })();
}

// -------------------------------------------------------------
// Present the results in Promise then catch style
// -------------------------------------------------------------
let measurment = run()

measurment
.then(r => {
    let correctCount = 0;
    let wrongCount = 0;
    let isCorrect = false;
    r.forEach((t) => {
        // let answer = (t.justification === t.prediction) ? 'Correct' : 'Wrong';
        if (t.justification === t.prediction) {
            // console.log('Correct');
            isCorrect = true;
            correctCount++;
        } else {
            // console.log('Wrong');
            isCorrect = false;
            wrongCount++;
        }
        // console.log('@' + t.twitter_account + ' Justification:' + t.justification + ' Prediction:' + t.prediction + ' ' + ((isCorrect === true) ? 'Correct': 'Wrong'));
        console.log(`@${t.twitter_account} ${t.justification} (jt) VS ${t.prediction} (pd) ${(isCorrect === true) ? 'Correct': 'Wrong'}`);
        console.log('Hashtags:', t.dedupedTags);
        t.scores.forEach( s => {
            console.log(`${s.label} -> ${s.percent}%`);
        })
        // console.log(t.scores);
        console.log('---------------------------------------------------------------------------------------');

    })
    console.log('Correct count=' + correctCount);
    console.log('Wrong count=' + wrongCount);
    console.log('Accuracy=' + Math.round(correctCount / (correctCount + wrongCount) * 100) + '%');
})