# Sistema de Detección de Riesgo Psicosocial - Aura Platform

## 📋 Descripción

Sistema de minería de datos y machine learning para detección temprana de aislamiento social, problemas emocionales y riesgo de abuso de sustancias en jóvenes usuarios de la plataforma Aura.

## 🎯 Objetivos

- Identificar usuarios en riesgo de aislamiento social
- Detectar señales tempranas de problemas emocionales (depresión, ansiedad)
- Identificar patrones de comportamiento asociados al abuso de sustancias
- Facilitar intervenciones preventivas tempranas

## 📂 Estructura del Proyecto

```
data_mining/
├── extract_features.py          # Extracción de variables desde BD
├── clustering_system.py         # Sistema de clustering multi-nivel
├── README.md                    # Este archivo
└── requirements.txt             # Dependencias Python
```

## 🚀 Instalación

### Requisitos Previos
- Python 3.10+
- Acceso a bases de datos MySQL y PostgreSQL de Aura
- 8GB RAM mínimo (16GB recomendado)

### Instalación de Dependencias

```bash
pip install -r requirements.txt
```

## 📊 Variables de Entrada

El sistema extrae **45+ variables** en 7 categorías:

1. **Actividad Social**: followers_count, following_count, posts_count, dias_inactividad
2. **Red de Amistades**: amigos_reales, solicitudes_pendientes, rechazos, bloqueos
3. **Participación en Comunidades**: num_comunidades,  tamano_promedio_comunidad
4. **Comportamiento de Contenido**: engagement_promedio, ratio_posts_privados
5. **Interacción**: comentarios_realizados, comentarios_recibidos, likes
6. **Comunicación**: conversaciones_activas, mensajes_enviados, usuarios_bloqueados
7. **Features Derivadas**: indice_aislamiento_social, ratio_reciprocidad, ratio_decay

Ver documento completo: `data_mining_social_isolation.md`

## 🔧 Uso

### 1. Extracción de Features

```bash
python extract_features.py
```

Este script:
- Conecta a las bases de datos de Aura
- Extrae variables de social-service, messaging-service, auth-service
- Calcula features derivadas (índices de riesgo)
- Genera CSV: `features_riesgo_psicosocial.csv`

**Configuración de conexión** (editar en `extract_features.py`):
```python
MYSQL_URI = "mysql+pymysql://user:password@host/posts_dev_db"
POSTGRES_URI = "postgresql://user:password@host/auth_db"
```

### 2. Análisis de Clustering

```bash
python clustering_system.py
```

Este script ejecuta **5 algoritmos de clustering**:

1. **K-Means**: Segmentación en 4 niveles (Bajo, Moderado, Alto, Crítico)
2. **DBSCAN**: Detección de anomalías (outliers = usuarios en riesgo crítico)
3. **Hierarchical**: Taxonomía de perfiles
4. **Gaussian Mixture Model**: Scoring probabilístico (0-1)
5. **Ensemble**: Combinación de todos los métodos

**Outputs:**
- `resultados_clustering.csv`: Dataset con todos los clusters y scores
- `kmeans_elbow.png`: Gráfico del método del codo
- `clusters_*.png`: Visualizaciones de clusters
- `gmm_probabilities.png`: Distribución de probabilidades

## 📈 Métricas y KPIs

### Métricas de Precisión del Modelo
- **Silhouette Score**: Calidad de clustering (0.3 - 0.7 típico)
- **Davies-Bouldin Index**: Separación de clusters (menor es mejor)
- **AIC/BIC**: Selección de número de clusters (GMM)

### KPIs de Negocio
- % usuarios en alto riesgo detectados
- Tasa de intervención temprana
- Reducción de churn en usuarios de riesgo
- Mejora en métricas sociales post-intervención

## 🔍 Interpretación de Resultados

### Índice de Aislamiento Social (0-10)
- **0-3**: Bajo riesgo - Usuario conectado y activo
- **3-6**: Riesgo moderado - Monitoreo recomendado
- **6-8**: Alto riesgo - Intervención sugerida
- **8-10**: Riesgo crítico - Intervención inmediata

### Niveles de Riesgo (Ensemble)
```python
# Usuarios en riesgo crítico requieren intervención inmediata
critical_users = df[df['nivel_riesgo_final'] == 'Crítico']

# Usuarios con probabilidad >75% de alto riesgo (GMM)
high_prob_risk = df[df['prob_alto_riesgo'] > 0.75]

# Outliers detectados por DBSCAN (comportamientos anómalos)
anomalous = df[df['cluster_dbscan'] == -1]
```

## 🎨 Visualizaciones Generadas

1. **Método del Codo** (`kmeans_elbow.png`): Determinación de K óptimo
2. **Clusters PCA** (`clusters_*.png`): Visualización 2D de clusters
3. **Distribución GMM** (`gmm_probabilities.png`): Probabilidades de riesgo

## 🛡️ Consideraciones Éticas

> **IMPORTANTE**: Este sistema maneja información sensible de salud mental.

### Principios Éticos Fundamentales

1. **Consentimiento Informado**: Los usuarios deben saber que existe este sistema
2. **Privacidad**: Datos anonimizados, cifrado end-to-end
3. **No Estigmatización**: Intervenciones discretas y respetuosas
4. **Precisión**: Revisión humana de todas las alertas críticas
5. **Opt-out**: Usuarios pueden desactivar el sistema

### Protocolo de Intervención

```
1. Detección automática → 2. Revisión manual (psicólogo) → 
3. Contacto discreto → 4. Ofrecimiento de apoyo → 5. Seguimiento
```

**Nunca:**
- ❌ Etiquetar públicamente a usuarios
- ❌ Compartir información sin autorización
- ❌ Diagnosticar sin profesional capacitado
- ❌ Forzar intervenciones

## 📚 Documentación Adicional

- **Análisis completo del backend**: `analisis_backend_aura.md`
- **Diseño del sistema de minería de datos**: `data_mining_social_isolation.md`

## 🔬 Métodos de Correlación

El sistema utiliza un **enfoque híbrido**:

1. **Spearman**: Relaciones monotónicas no lineales (más sensible que Pearson)
2. **Mutual Information**: Dependencias complejas, funciona con categóricas
3. **Random Forest Importance**: Detecta interacciones entre variables

**Recomendación**: Usar los 3 métodos en fase exploratoria para máxima sensibilidad.

## 📞 Contacto y Soporte

Para dudas sobre la implementación o interpretación de resultados:
- Equipo de Data Science: [correo]
- Equipo Psicosocial: [correo]

## 📄 Licencia

Este código es confidencial y de uso exclusivo para la plataforma Aura.

---

**Última actualización**: 2025-11-28  
**Versión**: 1.0.0  
**Autor**: Sistema Aura - Equipo de Análisis de Datos
