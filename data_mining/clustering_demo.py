import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.mixture import GaussianMixture
import matplotlib.pyplot as plt

# 1. Simulación de Datos (Variables seleccionadas)
# Features: [amigos_reales, conversaciones_activas, dias_inactividad, engagement, sentimiento]
np.random.seed(42)
n_samples = 1000
X = np.random.randn(n_samples, 5)

# Generar anomalías artificiales (usuarios en riesgo)
X_outliers = np.random.uniform(low=-4, high=4, size=(50, 5))
X = np.vstack([X, X_outliers])

# 2. Preprocesamiento
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("Datos simulados:", X_scaled.shape)

# 3. Implementación de Modelos Individuales

# A. K-Means (Segmentación Base)
kmeans = KMeans(n_clusters=4, random_state=42)
kmeans_labels = kmeans.fit_predict(X_scaled)
# Distancia al centroide (para score continuo)
distances = kmeans.transform(X_scaled)
min_distances = np.min(distances, axis=1)

# B. Isolation Forest (Random Forest Variant para Anomalías)
iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
iso_labels = iso_forest.fit_predict(X_scaled) # -1 es anómalo
iso_scores = -iso_forest.decision_function(X_scaled) # Mayor valor = más anómalo

# C. One Class SVM
oc_svm = OneClassSVM(nu=0.05)
svm_labels = oc_svm.fit_predict(X_scaled) # -1 es anómalo

# D. DBSCAN (Densidad)
dbscan = DBSCAN(eps=2.0, min_samples=5)
dbscan_labels = dbscan.fit_predict(X_scaled) # -1 es ruido

# 4. Ensamble (Enfoque de Votación)

results = pd.DataFrame({
    'kmeans_cluster': kmeans_labels,
    'iso_forest_pred': iso_labels, # -1 anómalo
    'svm_pred': svm_labels,        # -1 anómalo
    'dbscan_pred': dbscan_labels   # -1 ruido
})

# Regla de Votación: Si 2+ modelos dicen "Anómalo" (-1), marcar como Riesgo
results['vote_iso'] = results['iso_forest_pred'].apply(lambda x: 1 if x == -1 else 0)
results['vote_svm'] = results['svm_pred'].apply(lambda x: 1 if x == -1 else 0)
results['vote_dbscan'] = results['dbscan_pred'].apply(lambda x: 1 if x == -1 else 0)

results['risk_votes'] = results['vote_iso'] + results['vote_svm'] + results['vote_dbscan']
results['is_high_risk'] = results['risk_votes'] >= 2

print("\n--- Resultados del Ensamble (Votación) ---")
print(results['is_high_risk'].value_counts())

# 5. Cálculo de Métrica de Severidad (Risk Severity Index)

# Normalizar scores para promediar
def normalize(v):
    return (v - v.min()) / (v.max() - v.min())

norm_dist_kmeans = normalize(min_distances)
norm_score_iso = normalize(iso_scores)

# RSI = Promedio ponderado
# Damos más peso a Isolation Forest porque es específico para anomalías
results['risk_severity_index'] = (0.4 * norm_dist_kmeans) + (0.6 * norm_score_iso)

print("\n--- Top 5 Usuarios con Mayor Severidad de Riesgo ---")
print(results.sort_values('risk_severity_index', ascending=False).head(5))

# Guardar resultados simulados
results.to_csv('resultados_clustering_demo.csv', index=False)
print("\nResultados guardados en 'resultados_clustering_demo.csv'")
