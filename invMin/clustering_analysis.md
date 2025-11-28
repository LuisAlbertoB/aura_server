# Análisis y Diseño del Sistema de Clustering - Aura Platform

Este documento responde a la actividad solicitada y detalla el diseño de la libreta para el sistema de detección de riesgo psicosocial.

---

## 1. Actividad: Selección de Variables y Justificación

Para el sistema de clustering enfocado en **Aislamiento Social** y **Problemas Emocionales**, seleccionamos las siguientes variables críticas. La justificación se basa en su capacidad para reflejar desconexión y estados emocionales negativos.

### Variables Seleccionadas

1.  **`amigos_reales` (Social-Service)**
    *   **Justificación:** Es la métrica más directa de la red de apoyo del usuario. Un valor cercano a 0 indica falta de conexiones significativas, un predictor clave de aislamiento.
2.  **`conversaciones_activas` (Messaging-Service)**
    *   **Justificación:** Diferencia entre "tener seguidores" y "tener amigos". La comunicación privada bidireccional es un indicador vital de salud social.
3.  **`dias_inactividad` (Social-Service)**
    *   **Justificación:** El retraimiento social a menudo se manifiesta como abandono de plataformas digitales. Un aumento repentino indica posible crisis.
4.  **`engagement_promedio` (Social-Service)**
    *   **Justificación:** Mide la calidad de la interacción. Un usuario que publica pero no recibe feedback (likes/comments) puede sentir rechazo social.
5.  **`sentimiento_promedio` (NLP - Derivada)**
    *   **Justificación:** Variable cualitativa crítica. Detecta patrones de lenguaje negativo, tristeza o desesperanza que los números puros no ven.
6.  **`ratio_reciprocidad` (Derivada)**
    *   **Justificación:** Identifica relaciones desequilibradas (dar mucho y recibir poco, o viceversa), lo cual genera estrés psicosocial.
7.  **`variabilidad_horaria` (Temporal)**
    *   **Justificación:** Cambios en patrones de sueño (actividad nocturna) son correlatos fuertes de depresión y ansiedad.

---

## 2. Diseño del Sistema de Clustering

Se propone un sistema híbrido que utiliza los siguientes algoritmos:

### A. Algoritmos Solicitados

1.  **One Class SVM (Support Vector Machine)**
    *   **Rol:** Detección de Anomalías (Outliers).
    *   **Funcionamiento:** Aprende la "frontera" de lo que es un comportamiento "normal" (la mayoría de usuarios). Cualquier punto que caiga fuera de esta frontera se marca como anómalo.
    *   **Uso:** Identificar usuarios con comportamientos extremadamente atípicos que no encajan en ningún cluster estándar.

2.  **Random Forest (Adaptado: Isolation Forest)**
    *   **Rol:** Detección de Anomalías y Selección de Features.
    *   **Funcionamiento:** Dado que Random Forest es supervisado, para clustering utilizamos su variante **Isolation Forest** (basada en árboles). Aísla observaciones seleccionando aleatoriamente un feature y un valor de corte. Los puntos anómalos se aíslan más rápido (menos cortes).
    *   **Uso:** Generar un `anomaly_score` robusto. También podemos usar Random Forest estándar para calcular la **importancia de variables** (prediciendo una variable proxy como "actividad futura") para filtrar el ruido antes del clustering.

3.  **XGBoost (eXtreme Gradient Boosting)**
    *   **Rol:** Refinamiento Supervisado / Clasificación de Riesgo.
    *   **Funcionamiento:** Aunque es supervisado, lo integramos en una segunda etapa. Una vez que los clusters (K-Means/DBSCAN) etiquetan tentativamente a los usuarios, usamos XGBoost para aprender a predecir estas etiquetas.
    *   **Uso:** Análisis de importancia de características (SHAP values) para entender *por qué* un usuario fue clasificado en riesgo. También puede usarse en modo "Unsupervised" (generando datos sintéticos y clasificando real vs sintético) para aprender una métrica de distancia.

### B. Algoritmos Adicionales (Los "2 más")

4.  **K-Means**
    *   **Rol:** Segmentación General.
    *   **Uso:** Agrupar a la gran masa de usuarios en categorías base: "Activos", "Observadores", "En Riesgo Moderado". Es rápido y explicable.

5.  **DBSCAN (Density-Based Spatial Clustering)**
    *   **Rol:** Detección de Ruido y Clusters de Forma Irregular.
    *   **Uso:** Separar claramente el "ruido" (usuarios en crisis aguda o bots) de los grupos densos de comportamiento normal. No fuerza a todos los puntos a pertenecer a un cluster.

---

## 3. Métricas y Correlaciones

### ¿Qué métricas deben priorizar?
Dado que es un problema de **Detección de Riesgo (Anomalías)** donde el costo de no detectar a alguien en peligro (Falso Negativo) es muy alto:

1.  **Recall (Sensibilidad):** Prioridad #1. Queremos detectar al mayor número posible de usuarios en riesgo, incluso si eso significa tener algunos Falsos Positivos (que serán filtrados por revisión humana).
2.  **Silhouette Score:** Para evaluar la cohesión de los clusters generados (qué tan bien definidos están los grupos).
3.  **Davies-Bouldin Index:** Para medir la separación entre clusters.

### ¿Cuál método es más sensible a las correlaciones?
**Mutual Information (Información Mutua)** y **Spearman**.

*   **Por qué:** En el comportamiento humano, las relaciones raramente son lineales (ej. tener 0 amigos es malo, tener 5 es bueno, pero tener 500 no es "100 veces mejor" que 5).
    *   **Pearson** solo ve líneas rectas.
    *   **Spearman** ve relaciones monótonas (curvas).
    *   **Mutual Information** detecta cualquier tipo de dependencia, incluso oscilatoria o compleja. Para este caso, **Mutual Information** es el más robusto.

---

## 4. Tarea: Diseño de la Libreta (Notebook)

### Diagrama de Flujo del Proceso

```mermaid
graph TD
    A[Ingesta de Datos SQL] --> B[Preprocesamiento y Limpieza]
    B --> C[Ingeniería de Features (Ratios, NLP)]
    C --> D[Normalización (StandardScaler)]
    
    D --> E{Ensamble de Clustering}
    
    E --> F[Modelo 1: K-Means (Segmentación)]
    E --> G[Modelo 2: Isolation Forest (Anomalías)]
    E --> H[Modelo 3: DBSCAN (Densidad)]
    
    F --> I[Votación / Scoring Combinado]
    G --> I
    H --> I
    
    I --> J[Cálculo de Score de Anomalía Final]
    J --> K[Clasificación Final: Bajo/Medio/Alto/Crítico]
    K --> L[Exportación de Reporte]
```

### Elaboración de Modelos Ensamblados (3 Enfoques)

Para mejorar la robustez, no confiaremos en un solo algoritmo. Usaremos un **Ensamble de Clustering**:

#### Enfoque 1: Votación Mayoritaria (Hard Voting)
Ejecutamos K-Means, DBSCAN y One-Class SVM en paralelo.
*   Si K-Means lo pone en el cluster de "menor actividad".
*   Si DBSCAN lo marca como "ruido" (-1).
*   Si One-Class SVM lo marca como "outlier".
*   **Regla:** Si 2 de 3 modelos indican riesgo, el usuario se etiqueta como "Alto Riesgo".

#### Enfoque 2: Filtrado Secuencial (Pipeline)
1.  Primero corremos **Isolation Forest** para eliminar/detectar los casos extremos (anomalías severas). Estos se separan inmediatamente para revisión urgente.
2.  Con los datos restantes (usuarios "normales"), corremos **K-Means** para segmentarlos en perfiles de comportamiento (ej. "Sociales", "Voyeurs", "Creadores").
3.  Esto evita que los outliers distorsionen los centroides de K-Means.

#### Enfoque 3: Promedio de Probabilidades (Soft Voting)
Usamos modelos que entreguen probabilidades o distancias continuas (GMM y Distancia a Centroide de K-Means).
*   Normalizamos la distancia de cada punto a su centroide (0 a 1).
*   Obtenemos la probabilidad de pertenencia de GMM.
*   **Score Final** = Promedio ponderado de ambas métricas.

### Métrica de Severidad de Anomalía

Para determinar qué tan anómalo es un punto (Severidad), calcularemos el **`Risk_Severity_Index` (RSI)**.

$$ RSI = (w_1 \cdot D_{kmeans}) + (w_2 \cdot S_{iso}) + (w_3 \cdot P_{gmm}) $$

Donde:
*   $D_{kmeans}$: Distancia euclidiana al centroide del cluster más cercano (normalizada). Cuanto más lejos, más atípico.
*   $S_{iso}$: Score de anomalía del Isolation Forest (donde valores más negativos indican mayor anomalía). Invertimos la escala para que mayor sea más riesgo.
*   $P_{gmm}$: (1 - Probabilidad) de pertenencia al cluster asignado por Gaussian Mixture Models.
*   $w$: Pesos asignados según la confianza en cada modelo (ej. 0.4, 0.4, 0.2).

**Consideraciones para calcular este número:**
1.  **Escalado:** Es vital que todos los componentes estén en la misma escala (0 a 1) antes de promediar.
2.  **Contexto:** Un RSI alto no siempre es "malo" (puede ser un influencer viral). Se debe cruzar con variables de "sentimiento" (NLP) para confirmar si la anomalía es negativa.
3.  **Calibración:** Los pesos ($w$) deben ajustarse empíricamente revisando los Falsos Positivos iniciales.
