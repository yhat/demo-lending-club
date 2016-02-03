from sklearn.linear_model import LogisticRegression
import pandas as pd

cd ~/repos/yhat/demos/heroku-demos/demo-lending-club/model
df = pd.read_csv("./LoanStats3a.csv", skiprows=1)
df_head = df.head()

def is_poor_coverage(row):
    pct_null = float(row.isnull().sum()) / row.count()
    return pct_null < 0.8

df_head[df_head.apply(is_poor_coverage, axis=1)]
df = df[df.apply(is_poor_coverage, axis=1)]

df['year_issued'] = df.issue_d.apply(lambda x: int(x.split("-")[0]))
df_term = df[df.year_issued < 2012]

bad_indicators = [
    "Late (16-30 days)",
    "Late (31-120 days)",
    "Default",
    "Charged Off"
]
df_term['is_rent'] = df_term.home_ownership=="RENT"
df_term['is_bad'] = df_term.loan_status.apply(lambda x: x in bad_indicators)
features = ['last_fico_range_low', 'last_fico_range_high', 'is_rent']
glm = LogisticRegression()
glm.fit(df_term[features], df_term.is_bad)

glm.predict_log_proba(df_term[features].head())

# from ggplot import *

def calculate_score(log_odds):
    # 300 baseline + (40 points equals double risk) * odds
    return 300 + (40 / np.log(2)) * (-log_odds)

probs = glm.predict_proba(df_term[features])[:,1]
log_probs = glm.predict_log_proba(df_term[features])[:,1]
scores = calculate_score(log_probs)
# qplot(scores)
# qplot(probs, scores)



from yhat import Yhat, YhatModel

class LoanModel(YhatModel):
    def execute(self, data):
        data['is_rent'] = data['home_ownership']=="RENT"
        data = {k: [v] for k,v in data.items()}
        data = pd.DataFrame(data)
        data = data[features]
        prob = glm.predict_proba(data)[0][1]
        if prob > 0.3:
            decline_code = "Credit score too low"
        else:
            decline_code = ""
        odds = glm.predict_log_proba(data)[0][1]
        score = calculate_score(odds)
            
        output = {
            "prob_default": [prob],
            "decline_code": [decline_code],
            "score": [score]
        }
        
        return output

df_term[features].head()

test = {
    "last_fico_range_low": 705,
    "last_fico_range_high": 732,
    "home_ownership": "MORTGAGE"
}

LoanModel().execute(test)

yh = Yhat("demo-master", "4a662eb13647cfb9ed4ca36c5e95c7b3", 
          "https://sandbox.yhathq.com/")
yh.deploy("LendingClub", LoanModel, globals(), True)



