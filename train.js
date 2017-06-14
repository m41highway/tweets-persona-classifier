var fs = require('fs');
const recursiveReadSync = require('recursive-readdir-sync');
const striptags = require('striptags');
const natural = require('natural');
const classifier = new natural.BayesClassifier();
const moment = require('moment');

const trainingFolderName = '/training_text/';

try {
    let files = recursiveReadSync(__dirname + trainingFolderName);
    const basePathEndPosition = __dirname.length + trainingFolderName.length;

    // loop over resulting files 
    for (var i = 0, len = files.length; i < len; i++) {
        let beginTime = moment()        
        let file = files[i]
        
        // Get the Category from the file path
        prefix = file.substring(basePathEndPosition, file.length)
        prefix.indexOf('/'); // Get the next slash
        let category = prefix.substring(0, prefix.indexOf('/'))
        
        // read raw file to memory string
        var rawData = fs.readFileSync(file, 'utf8');

        // clean data string
        var cleanedData = striptags(rawData); // only keep text, can consider url later

        classifier.addDocument(cleanedData, category);

        console.log(`Processed ${file} - ${ moment().diff(beginTime, 'milisecond') } ms`);

    }

    console.log('Training begins...');
    let trainBeginTime = moment()
    classifier.train();
    console.log(`Training elapsed - ${ moment().diff(trainBeginTime, 'milisecond') } ms`);
    

    // persist to file system
    classifier.save(`knowledge_base/classifier-${moment(new Date()).format("YYYYMMDDHHmmss")}.json`, function (err, classifier) {
        // the classifier is saved to the classifier.json file!
    });
    
    
} catch (err) {
    if (err.errno === 34) {
        console.log('Path does not exist');
    } else {
        //something unrelated went wrong, rethrow 
        throw err;
    }
}