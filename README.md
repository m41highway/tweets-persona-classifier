# social-persona-engine
## The Social Persona Engine comprises of a Training Engine and a Persona Classifier
## Training Engine
### The engine is based on supervised machine learning
### It reads the training documents under the folder "training_text"
### In the folder "training_text", there are pre-defined sub-folders, which is the categories of pesonal that we want to train the engine
### The training documents can be any human readable textual file.
### Only plain text will be processed (HTML tags are ignored)
### Only support English
### The subfolder (aka Persona) where the documents placed is purely determined by human judgement
### To run the training engine

```
node train
```

### To measure the accuracy

```
node measure-hashtags
```


