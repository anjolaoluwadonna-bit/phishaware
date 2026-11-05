"""Assignment 7: offline CIC-IDS2017 analysis. Usage: python assignment7_analysis.py /path/to/csv_folder"""
import sys, pathlib, numpy as np, pandas as pd, matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay

folder = pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else pathlib.Path('dataset')
files = sorted(folder.rglob('*.csv'))
if not files: raise SystemExit('No CSV files found. Download and extract CIC-IDS2017 CSV files first.')
frames=[]
for file in files:
    df=pd.read_csv(file, low_memory=False)
    df.columns=df.columns.str.strip()
    if 'Label' in df.columns:
        frames.append(df)
if not frames: raise SystemExit('No CSV with a Label column found.')
data=pd.concat(frames,ignore_index=True).drop_duplicates()
labels=data['Label'].astype(str).str.strip()
mask=labels.eq('BENIGN') | labels.str.contains('DoS',case=False,regex=False)
data=data.loc[mask].copy()
labels=labels.loc[mask]
y=(~labels.eq('BENIGN')).astype(int)
print('Records by label:')
print(labels.value_counts().to_string())
if y.nunique()<2: raise SystemExit('Both BENIGN and DoS/DDoS rows are required. Download relevant files.')
features=['Flow Duration','Total Fwd Packets','Total Backward Packets','Flow Bytes/s','Flow Packets/s','Fwd Packet Length Mean','Bwd Packet Length Mean','Flow IAT Mean']
features=[x for x in features if x in data.columns]
if not features: raise SystemExit('Expected CIC-IDS2017 flow features not found. Check CSV column names.')
X=data[features].apply(pd.to_numeric,errors='coerce').replace([np.inf,-np.inf],np.nan)
print('\nMedian feature values by class:')
print(X.assign(class_name=np.where(y.eq(0),'BENIGN','DoS/DDoS')).groupby('class_name').median(numeric_only=True).to_string())
plot_feature='Flow Packets/s' if 'Flow Packets/s' in features else features[0]
chart=pd.DataFrame({'value':X[plot_feature],'label':np.where(y.eq(0),'BENIGN','DoS/DDoS')}).dropna()
# Cap chart outliers for legibility, but do not cap training data.
upper=chart['value'].quantile(.99)
chart['value']=chart['value'].clip(upper=upper)
chart.boxplot(column='value',by='label',showfliers=False)
plt.suptitle('');plt.title(f'{plot_feature}: CIC-IDS2017');plt.ylabel(plot_feature);plt.tight_layout();plt.savefig('assignment7_real_traffic_comparison.png',dpi=160);plt.close()
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=.25,stratify=y,random_state=42)
model=make_pipeline(SimpleImputer(strategy='median'),RandomForestClassifier(n_estimators=100,random_state=42,n_jobs=-1,class_weight='balanced_subsample'))
model.fit(X_train,y_train);pred=model.predict(X_test)
print('\nHELD-OUT TEST RESULTS:');print(classification_report(y_test,pred,target_names=['BENIGN','DoS/DDoS'],zero_division=0))
cm=confusion_matrix(y_test,pred,labels=[0,1]);print('Confusion matrix [benign, attack]:\n',cm)
ConfusionMatrixDisplay(cm,display_labels=['BENIGN','DoS/DDoS']).plot(cmap='Blues',values_format='d')
plt.tight_layout();plt.savefig('assignment7_real_confusion_matrix.png',dpi=160);plt.close()
print('Saved assignment7_real_traffic_comparison.png and assignment7_real_confusion_matrix.png')
