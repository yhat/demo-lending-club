import pandas as pd
import numpy as np
import time
from yhat import Yhat

# cd ~/repos/yhat/demos/heroku-demos/demo-lending-club/model
df = pd.read_csv("./model/LoanStats3a.csv", skiprows=1)
df_head = df.head()

def is_poor_coverage(row):
    pct_null = float(row.isnull().sum()) / row.count()
    return pct_null < 0.8

df_head[df_head.apply(is_poor_coverage, axis=1)]
df = df[df.apply(is_poor_coverage, axis=1)]

df['year_issued'] = df.issue_d.apply(lambda x: int(x.split("-")[0]))
df_term = df[df.year_issued < 2012]

features = ['last_fico_range_low', 'last_fico_range_high', 'home_ownership']

yh = Yhat("demo-master", "3b0160e10f6d7a94a2528b11b1c9bca1", "https://sandbox.c.yhat.com/")

for i, row in df_term[features][:500].iterrows():

    # some models require vectorized data, others don't
    # non-vectorized
    # row = row.to_dict() # {'is_rent': True, 'last_fico_range_low': 785, 'last_fico_range_high': 789}
    # vectorized
    row = { k: [v] for k,v in row.to_dict().items() } # {'is_rent': [True], 'last_fico_range_low': [785], 'last_fico_range_high': [789]}
    print yh.predict("LendingClub", row)
    time.sleep(.05)
