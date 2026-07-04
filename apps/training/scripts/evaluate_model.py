
from pathlib import Path
import json
import joblib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score,precision_score,recall_score,f1_score,classification_report,confusion_matrix

ROOT=Path(__file__).resolve().parent.parent
DATA=ROOT/'datasets'/'csv'/'landmarks_normalized.csv'
MODELS=ROOT/'models'
REPORTS=ROOT/'reports'
EXPERIMENTS=ROOT/'experiments'

df=pd.read_csv(DATA)
X=df.iloc[:,1:].values
y=df.iloc[:,0].values

enc=LabelEncoder()
y=enc.fit_transform(y)

_,X_test,_,y_test=train_test_split(X,y,test_size=0.2,stratify=y,random_state=42)

scaler=joblib.load(MODELS/'scaler.pkl')
model=joblib.load(MODELS/'random_forest.pkl')

X_test=scaler.transform(X_test)
pred=model.predict(X_test)

metrics={
 'accuracy':float(accuracy_score(y_test,pred)),
 'precision':float(precision_score(y_test,pred,average='weighted')),
 'recall':float(recall_score(y_test,pred,average='weighted')),
 'f1_score':float(f1_score(y_test,pred,average='weighted'))
}

(REPORTS/'metrics.json').write_text(json.dumps(metrics,indent=4))
(REPORTS/'classification_report.txt').write_text(classification_report(y_test,pred,target_names=enc.classes_))

rep=classification_report(y_test,pred,target_names=enc.classes_,output_dict=True)
rows=[]
for c in enc.classes_:
    r=rep[c]
    rows.append({'class':c,'precision':r['precision'],'recall':r['recall'],'f1_score':r['f1-score'],'support':r['support']})
pd.DataFrame(rows).to_csv(REPORTS/'per_class_accuracy.csv',index=False)

cm=confusion_matrix(y_test,pred)
plt.figure(figsize=(12,10))
plt.imshow(cm)
plt.colorbar()
plt.tight_layout()
plt.savefig(REPORTS/'confusion_matrix.png')
plt.close()

mis=[]
for i in range(len(cm)):
    for j in range(len(cm)):
        if i!=j and cm[i,j]>0:
            mis.append({'actual':enc.classes_[i],'predicted':enc.classes_[j],'count':int(cm[i,j])})
mis=sorted(mis,key=lambda x:x['count'],reverse=True)
pd.DataFrame(mis).to_csv(REPORTS/'top_misclassifications.csv',index=False)

exps=sorted([p for p in EXPERIMENTS.iterdir() if p.is_dir() and p.name.startswith('EXP-')])
if exps:
    (exps[-1]/'evaluation_metrics.json').write_text(json.dumps(metrics,indent=4))

print(metrics)
