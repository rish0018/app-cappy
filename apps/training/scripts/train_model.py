
from pathlib import Path
import json, joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score,precision_score,recall_score,f1_score,classification_report,confusion_matrix

ROOT=Path(__file__).resolve().parent.parent
DATA=ROOT/'datasets'/'csv'/'landmarks_normalized.csv'
MODELS=ROOT/'models'; REPORTS=ROOT/'reports'; EXPERIMENTS=ROOT/'experiments'
for d in [MODELS,REPORTS,EXPERIMENTS]: d.mkdir(exist_ok=True)

df=pd.read_csv(DATA)
# Drop classes with too few samples to stratify-split (e.g. "nothing", which by
# definition has no hand landmarks to learn from and isn't a real classification
# target for a hand-landmark model anyway).
counts=df['label'].value_counts()
df=df[df['label'].isin(counts[counts>=10].index)]
X=df.iloc[:,1:].values
y=df.iloc[:,0].values
enc=LabelEncoder(); y=enc.fit_transform(y)
Xtr,Xte,Ytr,Yte=train_test_split(X,y,test_size=0.2,stratify=y,random_state=42)
scaler=StandardScaler()
Xtr=scaler.fit_transform(Xtr); Xte=scaler.transform(Xte)
model=RandomForestClassifier(n_estimators=300,n_jobs=-1,random_state=42)
model.fit(Xtr,Ytr)
pred=model.predict(Xte)
metrics={
'accuracy':float(accuracy_score(Yte,pred)),
'precision':float(precision_score(Yte,pred,average='weighted')),
'recall':float(recall_score(Yte,pred,average='weighted')),
'f1_score':float(f1_score(Yte,pred,average='weighted'))
}
joblib.dump(model,MODELS/'random_forest.pkl')
joblib.dump(scaler,MODELS/'scaler.pkl')
joblib.dump(enc,MODELS/'label_encoder.pkl')
(REPORTS/'classification_report.txt').write_text(classification_report(Yte,pred,target_names=enc.classes_))
(REPORTS/'metrics.json').write_text(json.dumps(metrics,indent=4))
cm=confusion_matrix(Yte,pred)
plt.figure(figsize=(12,10)); plt.imshow(cm); plt.colorbar(); plt.tight_layout(); plt.savefig(REPORTS/'confusion_matrix.png'); plt.close()
existing=[p for p in EXPERIMENTS.iterdir() if p.is_dir() and p.name.startswith('EXP-')]
exp=EXPERIMENTS/f"EXP-{len(existing)+1:03d}"; exp.mkdir()
(exp/'metrics.json').write_text(json.dumps(metrics,indent=4))
(exp/'config.json').write_text(json.dumps({'model':'RandomForest','n_estimators':300},indent=4))
(exp/'notes.md').write_text('# Experiment\n')
print(metrics)
