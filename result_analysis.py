import pandas as pd
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score
import matplotlib.pyplot as plt
import seaborn as sns

# CSV dosyasını oku (noktalı virgül ayraçlı)
df = pd.read_csv("relevance_labels.csv", sep=";")

# Precision@5 ve Recall@5 hesaplayan fonksiyonlar
def precision_at_k(y_true, k):
    return sum(y_true[:k]) / k

def recall_at_k(y_true, k):
    relevant_total = sum(y_true)
    return sum(y_true[:k]) / relevant_total if relevant_total > 0 else 0

# Metrikleri hesapla
metrics = []
for query, group in df.groupby("query"):
    true_labels = group["is_relevant"].tolist()
    predicted_labels = [1] * len(true_labels)  # sistem önerdiği gibi varsay

    precision = precision_score(true_labels, predicted_labels, zero_division=0)
    recall = recall_score(true_labels, predicted_labels, zero_division=0)
    f1 = f1_score(true_labels, predicted_labels, zero_division=0)
    p_at_5 = precision_at_k(true_labels, 5)
    r_at_5 = recall_at_k(true_labels, 5)

    metrics.append({
        "query": query,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "precision@5": p_at_5,
        "recall@5": r_at_5,
    })

metrics_df = pd.DataFrame(metrics)

# Ortalama değerleri yazdır
print("\nOrtalama Metrikler:")
print(metrics_df.mean(numeric_only=True))

# Her metrik için grafik
metrics_melted = metrics_df.melt(id_vars="query", value_vars=["precision", "recall", "f1_score", "precision@5", "recall@5"],
                                  var_name="metric", value_name="value")

plt.figure(figsize=(12, 6))

sns.barplot(data=metrics_melted, x="query", y="value", hue="metric")
plt.xticks(rotation=45)
plt.ylim(0, 1.1)
plt.title("Sorgu Bazlı Performans Metrikleri")
plt.legend(title="Metrik")
plt.tight_layout()
plt.show()
