import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import IsolationForest
from sklearn.metrics import silhouette_score
import warnings

warnings.filterwarnings('ignore')

class AuraRiskEnsemble:
    """
    Sistema de Clustering Ensamblado para detección de riesgo psicosocial en Aura.
    Combina K-Means, DBSCAN e Isolation Forest.
    """
    
    def __init__(self, data):
        self.raw_data = data
        self.scaler = StandardScaler()
        self.X_scaled = None
        self.results = pd.DataFrame()
        self.models = {}

    def preprocess(self):
        """
        Preprocesamiento y normalización de datos.
        Selecciona las features clave definidas en el reporte.
        """
        print("Preprocesando datos...")
        # Selección de features clave basadas en el análisis
        # Nota: En un caso real, estas columnas deben existir en el DF de entrada
        features = [
            'amigos_reales', 
            'conversaciones_activas', 
            'dias_inactividad',
            'engagement_promedio', 
            'ratio_reciprocidad', 
            'sentimiento_promedio'
        ]
        
        # Verificar que las columnas existan, si no, crear dummy data para demostración
        missing_cols = [col for col in features if col not in self.raw_data.columns]
        if missing_cols:
            print(f"Advertencia: Faltan columnas {missing_cols}. Usando datos simulados para demostración.")
            # Generar datos aleatorios para demostración si faltan columnas
            X = pd.DataFrame(np.random.rand(len(self.raw_data), len(features)), columns=features)
        else:
            X = self.raw_data[features].fillna(0)
            
        self.X_scaled = self.scaler.fit_transform(X)
        self.results = self.raw_data.copy()
        if 'user_id' not in self.results.columns:
            self.results['user_id'] = range(len(self.results))

    def run_kmeans(self, n_clusters=4):
        """
        Enfoque 1: K-Means Clustering
        """
        print(f"Ejecutando K-Means con k={n_clusters}...")
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(self.X_scaled)
        
        # Identificar cluster de riesgo (el que tenga menor promedio de amigos/interacciones)
        # Asumimos heurística: el centroide más cercano al origen (0,0,0...) tras escalar
        # suele ser el de menor actividad/conexión
        centers = kmeans.cluster_centers_
        distances_to_origin = np.linalg.norm(centers, axis=1)
        risk_cluster_idx = np.argmin(distances_to_origin)
        
        self.results['kmeans_cluster'] = clusters
        self.results['vote_kmeans'] = (clusters == risk_cluster_idx).astype(int)
        self.models['kmeans'] = kmeans
        print(f"  -> Cluster de riesgo identificado: {risk_cluster_idx}")

    def run_dbscan(self, eps=0.5, min_samples=5):
        """
        Enfoque 2: DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
        Detecta outliers (ruido).
        """
        print("Ejecutando DBSCAN...")
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        clusters = dbscan.fit_predict(self.X_scaled)
        
        # -1 indica outlier en DBSCAN
        self.results['dbscan_cluster'] = clusters
        self.results['vote_dbscan'] = (clusters == -1).astype(int)
        print(f"  -> Outliers detectados: {sum(clusters == -1)}")

    def run_isolation_forest(self, contamination=0.05):
        """
        Enfoque 3: Isolation Forest
        Detecta anomalías basado en aislamiento.
        """
        print("Ejecutando Isolation Forest...")
        iso = IsolationForest(contamination=contamination, random_state=42)
        preds = iso.fit_predict(self.X_scaled)
        # -1 es anomalía, 1 es normal
        scores = iso.decision_function(self.X_scaled)
        
        self.results['iso_pred'] = preds
        self.results['iso_score'] = scores # Score negativo = más anómalo
        self.results['vote_iso'] = (preds == -1).astype(int)
        print(f"  -> Anomalías detectadas: {sum(preds == -1)}")

    def calculate_ensemble_risk(self):
        """
        Combina los votos de los 3 modelos para determinar el nivel de riesgo.
        """
        print("Calculando riesgo ensamblado...")
        # Suma de votos
        self.results['total_votes'] = (
            self.results['vote_kmeans'] + 
            self.results['vote_dbscan'] + 
            self.results['vote_iso']
        )
        
        # Clasificación final
        conditions = [
            (self.results['total_votes'] >= 2),
            (self.results['total_votes'] == 1)
        ]
        choices = ['ALTO RIESGO', 'RIESGO MODERADO']
        self.results['risk_level'] = np.select(conditions, choices, default='BAJO RIESGO')
        
        return self.results['risk_level'].value_counts()

    def calculate_anomaly_severity(self):
        """
        Calcula el Índice de Severidad de Anomalía (ASI) de 0 a 100.
        """
        print("Calculando Índice de Severidad de Anomalía (ASI)...")
        iso_score = self.results['iso_score']
        min_score = iso_score.min()
        max_score = iso_score.max()
        
        # Normalización Min-Max invertida (más negativo = más severo)
        # Evitar división por cero
        if max_score == min_score:
            severity = np.zeros(len(iso_score))
        else:
            severity = 100 * (1 - (iso_score - min_score) / (max_score - min_score))
        
        # Ajuste: Si DBSCAN también dice que es outlier, aumentamos severidad un 20%
        severity = np.where(self.results['vote_dbscan'] == 1, severity * 1.2, severity)
        
        # Cap en 100
        self.results['anomaly_severity_index'] = np.clip(severity, 0, 100)
        
        return self.results[['user_id', 'risk_level', 'anomaly_severity_index']]

if __name__ == "__main__":
    # Generar datos dummy para probar el script
    print("Generando datos de prueba...")
    np.random.seed(42)
    n_users = 1000
    data = pd.DataFrame({
        'user_id': range(n_users),
        'amigos_reales': np.random.poisson(20, n_users),
        'conversaciones_activas': np.random.poisson(5, n_users),
        'dias_inactividad': np.random.exponential(5, n_users),
        'engagement_promedio': np.random.normal(10, 3, n_users),
        'ratio_reciprocidad': np.random.normal(1.0, 0.2, n_users),
        'sentimiento_promedio': np.random.normal(0.5, 0.2, n_users)
    })
    
    # Inyectar anomalías (usuarios aislados)
    data.loc[0:10, 'amigos_reales'] = 0
    data.loc[0:10, 'conversaciones_activas'] = 0
    data.loc[0:10, 'dias_inactividad'] = 60
    data.loc[0:10, 'engagement_promedio'] = 0
    
    # Ejecutar sistema
    system = AuraRiskEnsemble(data)
    system.preprocess()
    system.run_kmeans()
    system.run_dbscan()
    system.run_isolation_forest()
    
    print("\nResumen de Riesgos:")
    print(system.calculate_ensemble_risk())
    
    print("\nTop 10 Usuarios con mayor severidad de anomalía:")
    severity_df = system.calculate_anomaly_severity()
    print(severity_df.sort_values('anomaly_severity_index', ascending=False).head(15))
    
    print("\nScript finalizado exitosamente.")
