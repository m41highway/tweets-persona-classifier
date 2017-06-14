# social-persona-engine
* The Social Persona Engine comprises of a Training Engine and a Persona Classifier
## Training Engine
* The engine is based on supervised machine learning
* It reads the training documents under the folder "training_text"
* In the folder "training_text", there are pre-defined sub-folders, which is the categories of pesonal that we want to train the engine
* The training documents can be any human readable textual file.
* Only plain text will be processed (HTML tags are ignored)
* Only support English
* The subfolder (aka Persona) where the documents placed is purely determined by human judgement
## Classifier
* The persona classifier will load the latest knowledge in folder knowledge_base
* It calls Twitter API to collect users tweets
* It takes test.json as the input testing data, where you define the twitter account name and the classification you baed on your judgement
* It predicts the likehood of the categories
* It measure the accuracy of the engine against the input data
## Install and Run
1. Install

```javascript
npm install
```

2. To train the engine

```javascript
node train
```

3. To measure the accuracy

```javascript
node measure-hashtags
```



