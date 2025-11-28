"""
Sistema de Clustering Multi-Nivel para Detección de Riesgo Psicosocial
Autor: Sistema Aura - Análisis de Datos
Fecha: 2025-11-28

Implementa 5 algoritmos de clustering diferentes para detección de riesgo.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.mixture import GaussianMixture
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, davies_bouldin_score
import warnings
warnings.filterwarnings('ignore')

class MultiLevelClusteringSystem:
    """Sistema de clustering multi-nivel para detección de riesgo"""
    
    def __init__(self, data_path='features_riesgo_psicosocial.csv'):
        """
        Args:
            data_path: Ruta al CSV con features extraídas
        """
        self.df = pd.read_csv(data_path)
        self.scaler = StandardScaler()
        self.X_scaled = None
        self.feature_cols = None
        
    def prepare_features(self):
        """Selecciona y normaliza features para clustering"""
        # Features clave para detección de riesgo
        self.feature_cols = [
            'amigos_reales',
            'conversaciones_activas',
            'num_comunidades',
            'engagement_promedio',
            'dias_inactividad',
            'posts_count',
            'mensajes_enviados',
            'ratio_reciprocidad_comentarios',
            'indice_aislamiento_social',
            'ratio_actividad_diaria',
            'indice_conflicto_social'
        ]
        
        # Asegurar que las columnas existen
        available_cols = [col for col in self.feature_cols if col in self.df.columns]
        
        X = self.df[available_cols].fillna(0)
        self.X_scaled = self.scaler.fit_transform(X)
        
        print(f"Features preparadas: {len(available_cols)}")
        print(f"Usuarios: {len(X)}")
        
        return self.X_scaled
    
    def kmeans_clustering(self, n_clusters=4, visualize=True):
        """
        Sistema 1: K-Means para segmentación de riesgo estándar
        
        Args:
            n_clusters: Número de clusters (default: 4 = Bajo, Moderado, Alto, Crítico)
            visualize: Si mostrar gráficos
            
        Returns:
            Array con etiquetas de cluster
        """
        print("\n=== K-MEANS CLUSTERING ===")
        
        # Método del codo para encontrar K óptimo
        if visualize:
            inertias = []
            K_range = range(2, 11)
            for k in K_range:
                kmeans_temp = KMeans(n_clusters=k, random_state=42, n_init=10)
                kmeans_temp.fit(self.X_scaled)
                inertias.append(kmeans_temp.inertia_)
            
            plt.figure(figsize=(10, 5))
            plt.plot(K_range, inertias, 'bo-')
            plt.xlabel('Número de Clusters (K)')
            plt.ylabel('Inercia')
            plt.title('Método del Codo para K-Means')
            plt.grid(True)
            plt.savefig('kmeans_elbow.png')
            print("Gráfico del codo guardado en 'kmeans_elbow.png'")
        
        # Entrenar K-Means con K óptimo
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(self.X_scaled)
        
        self.df['cluster_kmeans'] = clusters
        
        # Métricas de calidad
        silhouette = silhouette_score(self.X_scaled, clusters)
        davies_bouldin = davies_bouldin_score(self.X_scaled, clusters)
        
        print(f"Silhouette Score: {silhouette:.3f} (mayor es mejor, rango: -1 a 1)")
        print(f"Davies-Bouldin Index: {davies_bouldin:.3f} (menor es mejor)")
        
        # Interpretar clusters
        print("\n--- Perfil de Clusters ---")
        cluster_profiles = self.df.groupby('cluster_kmeans')[self.feature_cols].mean()
        print(cluster_profiles)
        
        # Etiquetar clusters por nivel de riesgo
        cluster_risk = cluster_profiles['indice_aislamiento_social'].sort_values()
        risk_mapping = {
            cluster_risk.index[0]: 'Bajo Riesgo',
            cluster_risk.index[1]: 'Riesgo Moderado',
            cluster_risk.index[2]: 'Alto Riesgo',
            cluster_risk.index[3]: 'Riesgo Crítico'
        }
        
        self.df['nivel_riesgo_kmeans'] = self.df['cluster_kmeans'].map(risk_mapping)
        
        print("\n--- Distribución de Usuarios por Nivel de Riesgo ---")
        print(self.df['nivel_riesgo_kmeans'].value_counts())
        
        if visualize:
            self.visualize_clusters_pca(clusters, 'K-Means')
        
        return clusters
    
    def dbscan_clustering(self, eps=0.5, min_samples=10, visualize=True):
        """
        Sistema 2: DBSCAN para detección de anomalías
        
        Args:
            eps: Radio de vecindad
            min_samples: Mínimo de puntos para formar cluster
            visualize: Si mostrar gráficos
            
        Returns:
            Array con etiquetas de cluster (-1 = outlier)
        """
        print("\n=== DBSCAN CLUSTERING ===")
        
        dbscan = DBSCAN(eps=eps, min_samples=min_samples, metric='euclidean')
        clusters = dbscan.fit_predict(self.X_scaled)
        
        self.df['cluster_dbscan'] = clusters
        
        # Identificar outliers
        outliers = self.df[self.df['cluster_dbscan'] == -1]
        
        print(f"Número de clusters detectados: {len(set(clusters)) - (1 if -1 in clusters else 0)}")
        print(f"⚠️ Outliers detectados (usuarios en riesgo anómalo): {len(outliers)}")
        
        if len(outliers) > 0:
            print("\n--- Características de Outliers ---")
            print(outliers[self.feature_cols].describe())
        
        if visualize and len(set(clusters)) > 1:
            self.visualize_clusters_pca(clusters, 'DBSCAN')
        
        return clusters
    
    def hierarchical_clustering(self, n_clusters=4, visualize=True):
        """
        Sistema 3: Clustering Jerárquico para taxonomía de perfiles
        
        Args:
            n_clusters: Número de clusters finales
            visualize: Si mostrar dendrograma
            
        Returns:
            Array con etiquetas de cluster
        """
        print("\n=== HIERARCHICAL CLUSTERING ===")
        
        # Usar una muestra si hay muchos usuarios (dendrograma es costoso)
        if len(self.df) > 1000:
            sample_indices = np.random.choice(len(self.df), 1000, replace=False)
            X_sample = self.X_scaled[sample_indices]
            print("⚠️ Usando muestra de 1000 usuarios para dendrograma")
        else:
            X_sample = self.X_scaled
        
        # Calcular linkage
        linkage_matrix = linkage(X_sample, method='ward')
        
        if visualize:
            plt.figure(figsize=(15, 8))
            dendrogram(linkage_matrix, truncate_mode='lastp', p=30)
            plt.title('Dendrograma de Clustering Jerárquico')
            plt.xlabel('Índice de Usuario (o Cluster)')
            plt.ylabel('Distancia')
            plt.savefig('hierarchical_dendrogram.png')
            print("Dendrograma guardado en 'hierarchical_dendrogram.png'")
        
        # Aplicar clustering a todo el dataset
        linkage_full = linkage(self.X_scaled, method='ward')
        clusters = fcluster(linkage_full, t=n_clusters, criterion='maxclust')
        
        self.df['cluster_jerarquico'] = clusters
        
        print(f"\nDistribución de clusters jerárquicos:")
        print(self.df['cluster_jerarquico'].value_counts().sort_index())
        
        return clusters
    
    def gmm_clustering(self, n_components=4, visualize=True):
        """
        Sistema 4: Gaussian Mixture Models para scoring probabilístico
        
        Args:
            n_components: Número de componentes gaussianas
            visualize: Si mostrar gráficos
            
        Returns:
            Tuple (clusters, probabilidades)
        """
        print("\n=== GAUSSIAN MIXTURE MODEL ===")
        
        gmm = GaussianMixture(n_components=n_components, covariance_type='full', random_state=42)
        clusters = gmm.fit_predict(self.X_scaled)
        probs = gmm.predict_proba(self.X_scaled)
        
        self.df['cluster_gmm'] = clusters
        
        # Asignar probabilidades de cada cluster
        for i in range(n_components):
            self.df[f'prob_cluster_{i}'] = probs[:, i]
        
        # Identificar cluster de alto riesgo (el que tiene mayor índice de aislamiento)
        cluster_profiles = self.df.groupby('cluster_gmm')['indice_aislamiento_social'].mean()
        high_risk_cluster = cluster_profiles.idxmax()
        
        self.df['prob_alto_riesgo'] = probs[:, high_risk_cluster]
        
        print(f"Cluster de alto riesgo identificado: {high_risk_cluster}")
        print(f"\n--- Usuarios con mayor probabilidad de alto riesgo ---")
        print(self.df.nlargest(10, 'prob_alto_riesgo')[['user_id', 'prob_alto_riesgo', 'indice_aislamiento_social']])
        
        # BIC y AIC para evaluación
        print(f"\nBIC: {gmm.bic(self.X_scaled):.2f} (menor es mejor)")
        print(f"AIC: {gmm.aic(self.X_scaled):.2f} (menor es mejor)")
        
        if visualize:
            self.visualize_probability_distribution(probs, high_risk_cluster)
        
        return clusters, probs
    
    def ensemble_risk_score(self):
        """
        Combina resultados de todos los métodos de clustering
        en un score de riesgo unificado
        """
        print("\n=== ENSEMBLE RISK SCORING ===")
        
        # Normalizar índices de riesgo de cada método (0-1)
        # K-Means: asignar score basado en nivel de riesgo
        risk_mapping_kmeans = {
            'Bajo Riesgo': 0.1,
            'Riesgo Moderado': 0.4,
            'Alto Riesgo': 0.7,
            'Riesgo Crítico': 1.0
        }
        self.df['risk_score_kmeans'] = self.df['nivel_riesgo_kmeans'].map(risk_mapping_kmeans)
        
        # DBSCAN: outliers = alto riesgo
        self.df['risk_score_dbscan'] = np.where(self.df['cluster_dbscan'] == -1, 1.0, 0.3)
        
        # GMM: usar probabilidad directa
        self.df['risk_score_gmm'] = self.df['prob_alto_riesgo']
        
        # Índice de aislamiento normalizado
        self.df['risk_score_aislamiento'] = self.df['indice_aislamiento_social'] / 10
        
        # Score combinado (media ponderada)
        self.df['risk_score_final'] = (
            self.df['risk_score_kmeans'] * 0.3 +
            self.df['risk_score_dbscan'] * 0.2 +
            self.df['risk_score_gmm'] * 0.3 +
            self.df['risk_score_aislamiento'] * 0.2
        )
        
        # Categorizar en niveles
        self.df['nivel_riesgo_final'] = pd.cut(
            self.df['risk_score_final'],
            bins=[0, 0.3, 0.5, 0.7, 1.0],
            labels=['Bajo', 'Moderado', 'Alto', 'Crítico']
        )
        
        print("--- Distribución de Riesgo Final ---")
        print(self.df['nivel_riesgo_final'].value_counts().sort_index())
        
        print("\n--- Top 20 Usuarios en Mayor Riesgo ---")
        high_risk_users = self.df.nlargest(20, 'risk_score_final')[
            ['user_id', 'risk_score_final', 'nivel_riesgo_final', 
             'amigos_reales', 'dias_inactividad', 'indice_aislamiento_social']
        ]
        print(high_risk_users)
        
        return self.df['risk_score_final']
    
    def visualize_clusters_pca(self, clusters, method_name):
        """Visualiza clusters usando PCA para reducción a 2D"""
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(self.X_scaled)
        
        plt.figure(figsize=(12, 8))
        scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=clusters, cmap='viridis', alpha=0.6)
        plt.colorbar(scatter, label='Cluster')
        plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%} varianza)')
        plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%} varianza)')
        plt.title(f'Visualización de Clusters - {method_name}')
        plt.grid(True, alpha=0.3)
        plt.savefig(f'clusters_{method_name.lower().replace(" ", "_")}.png')
        print(f"Visualización guardada en 'clusters_{method_name.lower().replace(' ', '_')}.png'")
    
    def visualize_probability_distribution(self, probs, high_risk_cluster):
        """Visualiza distribución de probabilidades de GMM"""
        plt.figure(figsize=(12, 6))
        
        plt.subplot(1, 2, 1)
        plt.hist(probs[:, high_risk_cluster], bins=50, edgecolor='black')
        plt.xlabel('Probabilidad de Alto Riesgo')
        plt.ylabel('Frecuencia')
        plt.title('Distribución de Probabilidad de Alto Riesgo (GMM)')
        plt.grid(True, alpha=0.3)
        
        plt.subplot(1, 2, 2)
        for i in range(probs.shape[1]):
            plt.hist(probs[:, i], bins=30, alpha=0.5, label=f'Cluster {i}')
        plt.xlabel('Probabilidad')
        plt.ylabel('Frecuencia')
        plt.title('Distribución de Probabilidades - Todos los Clusters')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('gmm_probabilities.png')
        print("Distribución de probabilidades guardada en 'gmm_probabilities.png'")
    
    def save_results(self, filename='resultados_clustering.csv'):
        """Guarda resultados finales"""
        self.df.to_csv(filename, index=False)
        print(f"\n✅ Resultados guardados en: {filename}")
    
    def generate_report(self):
        """Genera reporte resumido del análisis"""
        print("\n" + "="*70)
        print(" REPORTE FINAL DE CLUSTERING - DETECCIÓN DE RIESGO PSICOSOCIAL")
        print("="*70)
        
        print(f"\nTotal de usuarios analizados: {len(self.df)}")
        
        print("\n--- Resumen por Nivel de Riesgo ---")
        risk_summary = self.df['nivel_riesgo_final'].value_counts().sort_index()
        for nivel, count in risk_summary.items():
            porcentaje = (count / len(self.df)) * 100
            print(f"  {nivel}: {count} usuarios ({porcentaje:.1f}%)")
        
        print("\n--- Usuarios Requiriendo Intervención Inmediata ---")
        critical = self.df[self.df['nivel_riesgo_final'] == 'Crítico']
        print(f"  Total: {len(critical)}")
        
        if len(critical) > 0:
            print("\n  Características promedio:")
            print(f"    - Amigos reales: {critical['amigos_reales'].mean():.1f}")
            print(f"    - Días de inactividad: {critical['dias_inactividad'].mean():.1f}")
            print(f"    - Índice de aislamiento: {critical['indice_aislamiento_social'].mean():.2f}/10")
        
        print("\n" + "="*70)


# Ejemplo de uso
if __name__ == "__main__":
    # Inicializar sistema
    clustering_system = MultiLevelClusteringSystem('features_riesgo_psicosocial.csv')
    
    # Preparar features
    clustering_system.prepare_features()
    
    # Ejecutar todos los métodos de clustering
    print("\n🔍 Ejecutando análisis multi-nivel...")
    
    clusters_kmeans = clustering_system.kmeans_clustering(n_clusters=4, visualize=True)
    clusters_dbscan = clustering_system.dbscan_clustering(eps=0.8, min_samples=15, visualize=True)
    clusters_hierarchical = clustering_system.hierarchical_clustering(n_clusters=4, visualize=True)
    clusters_gmm, probs_gmm = clustering_system.gmm_clustering(n_components=4, visualize=True)
    
    # Calcular score de riesgo combinado
    final_scores = clustering_system.ensemble_risk_score()
    
    # Guardar resultados
    clustering_system.save_results()
    
    # Generar reporte
    clustering_system.generate_report()
