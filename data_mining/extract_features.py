"""
Script de Extracción de Features para Sistema de Detección de Riesgo Psicosocial
Autor: Sistema Aura - Análisis de Datos
Fecha: 2025-11-28

Este script extrae variables desde las bases de datos MySQL y PostgreSQL
para alimentar el sistema de clustering y detección de riesgo.
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from datetime import datetime, timedelta
import json

class FeatureExtractor:
    """Extrae y procesa features desde las bases de datos de Aura"""
    
    def __init__(self, mysql_uri, postgres_uri):
        """
        Args:
            mysql_uri: Conexión a MySQL (social-service, messaging-service)
            postgres_uri: Conexión a PostgreSQL (auth-service)
        """
        self.mysql_engine = create_engine(mysql_uri)
        self.postgres_engine = create_engine(postgres_uri)
        
    def extract_social_metrics(self):
        """Extrae métricas de actividad social desde user_profiles"""
        query = """
        SELECT 
            user_id,
            followers_count,
            following_count,
            posts_count,
            DATEDIFF(NOW(), last_active_at) AS dias_inactividad,
            is_verified,
            is_active,
            YEAR(NOW()) - YEAR(birth_date) AS edad,
            gender,
            CHAR_LENGTH(bio) AS longitud_bio,
            created_at
        FROM user_profiles
        WHERE is_active = true
        """
        return pd.read_sql(query, self.mysql_engine)
    
    def extract_friendship_metrics(self):
        """Extrae métricas de red de amistades"""
        query = """
        SELECT 
            COALESCE(f1.user_id, f2.user_id) AS user_id,
            COALESCE(f1.amigos_reales, 0) AS amigos_reales,
            COALESCE(f1.solicitudes_pendientes, 0) AS solicitudes_pendientes,
            COALESCE(f1.rechazos, 0) AS rechazos,
            COALESCE(f1.bloqueos, 0) AS bloqueos,
            COALESCE(f2.veces_bloqueado, 0) AS veces_bloqueado
        FROM (
            -- Como requester
            SELECT 
                requester_id AS user_id,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS amigos_reales,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) AS solicitudes_pendientes,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rechazos,
                COUNT(CASE WHEN status = 'blocked' THEN 1 END) AS bloqueos
            FROM friendships
            WHERE is_active = true
            GROUP BY requester_id
        ) f1
        FULL OUTER JOIN (
            -- Como addressee
            SELECT 
                addressee_id AS user_id,
                COUNT(CASE WHEN status = 'blocked' THEN 1 END) AS veces_bloqueado
            FROM friendships
            WHERE is_active = true
            GROUP BY addressee_id
        ) f2 ON f1.user_id = f2.user_id
        """
        return pd.read_sql(query, self.mysql_engine)
    
    def extract_community_engagement(self):
        """Extrae participación en comunidades"""
        query = """
        SELECT 
            cm.user_id,
            COUNT(DISTINCT cm.community_id) AS num_comunidades,
            AVG(c.members_count) AS tamano_promedio_comunidad,
            DATEDIFF(NOW(), MIN(cm.joined_at)) AS dias_desde_primera_union,
            DATEDIFF(NOW(), MAX(cm.joined_at)) AS dias_desde_ultima_union
        FROM community_members cm
        JOIN communities c ON cm.community_id = c.id
        WHERE c.is_active = true
        GROUP BY cm.user_id
        """
        return pd.read_sql(query, self.mysql_engine)
    
    def extract_post_metrics(self):
        """Extrae métricas de publicaciones"""
        query = """
        SELECT 
            p.user_id,
            COUNT(*) AS total_posts,
            AVG(p.likes_count) AS promedio_likes,
            AVG(p.comments_count) AS promedio_comentarios,
            AVG(p.shares_count) AS promedio_shares,
            AVG(p.likes_count + p.comments_count * 2 + p.shares_count * 3) AS engagement_promedio,
            SUM(CASE WHEN p.visibility = 'private' THEN 1 ELSE 0 END) / COUNT(*) AS ratio_posts_privados,
            STDDEV(DATEDIFF(NOW(), p.created_at)) AS variabilidad_publicacion,
            DATEDIFF(NOW(), MAX(p.created_at)) AS dias_desde_ultima_publicacion,
            COUNT(CASE WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) AS posts_ultima_semana,
            COUNT(CASE WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS posts_ultimo_mes
        FROM posts p
        WHERE p.is_active = true
        GROUP BY p.user_id
        """
        return pd.read_sql(query, self.mysql_engine)
    
    def extract_comment_metrics(self):
        """Extrae métricas de comentarios dados y recibidos"""
        query_given = """
        SELECT 
            c.user_id,
            COUNT(*) AS comentarios_realizados,
            AVG(c.likes_count) AS likes_promedio_en_comentarios,
            COUNT(DISTINCT c.post_id) AS posts_comentados
        FROM comments c
        WHERE c.is_active = true
        GROUP BY c.user_id
        """
        
        query_received = """
        SELECT 
            p.user_id,
            COUNT(c.id) AS comentarios_recibidos,
            COUNT(DISTINCT c.user_id) AS usuarios_comentadores
        FROM posts p
        LEFT JOIN comments c ON p.id = c.post_id AND c.is_active = true
        GROUP BY p.user_id
        """
        
        given = pd.read_sql(query_given, self.mysql_engine)
        received = pd.read_sql(query_received, self.mysql_engine)
        
        return pd.merge(given, received, on='user_id', how='outer').fillna(0)
    
    def extract_messaging_metrics(self):
        """Extrae métricas de mensajería"""
        query_conversations = """
        SELECT 
            user_id,
            COUNT(DISTINCT id) AS conversaciones_activas,
            AVG(unread_count) AS mensajes_sin_leer_promedio,
            SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS conversaciones_archivadas,
            SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS usuarios_bloqueados_msg,
            AVG(DATEDIFF(NOW(), last_message_at)) AS dias_desde_ultimo_mensaje
        FROM (
            SELECT 
                participant1_profile_id AS user_id,
                id,
                unread_count_1 AS unread_count,
                participant1_status AS status,
                last_message_at
            FROM conversations
            
            UNION ALL
            
            SELECT 
                participant2_profile_id AS user_id,
                id,
                unread_count_2 AS unread_count,
                participant2_status AS status,
                last_message_at
            FROM conversations
        ) all_conversations
        GROUP BY user_id
        """
        
        query_messages = """
        SELECT 
            sender_profile_id AS user_id,
            COUNT(*) AS mensajes_enviados,
            AVG(CHAR_LENGTH(content)) AS longitud_promedio_mensaje,
            SUM(CASE WHEN is_edited THEN 1 ELSE 0 END) / COUNT(*) AS ratio_mensajes_editados,
            SUM(CASE WHEN is_deleted THEN 1 ELSE 0 END) / COUNT(*) AS ratio_mensajes_eliminados
        FROM messages
        WHERE is_deleted = false
        GROUP BY sender_profile_id
        """
        
        conv = pd.read_sql(query_conversations, self.mysql_engine)
        msgs = pd.read_sql(query_messages, self.mysql_engine)
        
        return pd.merge(conv, msgs, on='user_id', how='outer').fillna(0)
    
    def extract_preferences(self):
        """Extrae preferencias e intereses"""
        query_prefs = """
        SELECT 
            user_id,
            JSON_LENGTH(preferences) AS num_preferencias
        FROM user_preferences
        """
        
        query_interests = """
        SELECT 
            user_id,
            COUNT(*) AS num_intereses
        FROM interests
        GROUP BY user_id
        """
        
        prefs = pd.read_sql(query_prefs, self.mysql_engine)
        interests = pd.read_sql(query_interests, self.mysql_engine)
        
        return pd.merge(prefs, interests, on='user_id', how='outer').fillna(0)
    
    def extract_temporal_patterns(self):
        """Extrae patrones temporales de actividad"""
        query = """
        SELECT 
            user_id,
            COUNT(DISTINCT DATE(created_at)) AS dias_con_actividad,
            DATEDIFF(NOW(), MIN(created_at)) AS dias_totales_en_plataforma,
            STDDEV(HOUR(created_at)) AS variabilidad_horaria,
            AVG(HOUR(created_at)) AS hora_promedio_actividad,
            SUM(CASE WHEN HOUR(created_at) BETWEEN 0 AND 5 THEN 1 ELSE 0 END) / COUNT(*) AS ratio_actividad_nocturna
        FROM posts
        GROUP BY user_id
        """
        return pd.read_sql(query, self.mysql_engine)
    
    def calculate_derived_features(self, df):
        """Calcula features derivadas a partir de las básicas"""
        
        # Índice de Aislamiento Social (0-10)
        df['indice_aislamiento_social'] = (
            np.where(df['amigos_reales'] == 0, 10, 10 / np.log(df['amigos_reales'] + 1)) +
            np.where(df['conversaciones_activas'] == 0, 10, 10 / np.log(df['conversaciones_activas'] + 1)) +
            np.where(df['num_comunidades'] == 0, 10, 10 / np.log(df['num_comunidades'] + 1)) +
            (100 - df['engagement_promedio'].clip(upper=100)) / 10 +
            np.minimum(df['dias_inactividad'] / 10, 10)
        ) / 5
        
        # Ratio de Reciprocidad Social
        df['ratio_reciprocidad_comentarios'] = np.where(
            df['comentarios_realizados'] == 0,
            0,
            df['comentarios_recibidos'] / df['comentarios_realizados']
        )
        
        # Score de Decaimiento de Actividad
        df['ratio_decay_actividad'] = np.where(
            df['posts_ultimo_mes'] == 0,
            0,
            df['posts_ultima_semana'] / df['posts_ultimo_mes']
        )
        
        # Índice de Conflicto Social
        df['indice_conflicto_social'] = (
            df['rechazos'] * 2 + 
            df['bloqueos'] * 3 + 
            df['veces_bloqueado'] * 2 +
            df['usuarios_bloqueados_msg'] * 1.5
        )
        
        # Ratio de Actividad vs Tiempo en Plataforma
        df['ratio_actividad_diaria'] = np.where(
            df['dias_totales_en_plataforma'] == 0,
            0,
            df['dias_con_actividad'] / df['dias_totales_en_plataforma']
        )
        
        return df
    
    def extract_all_features(self):
        """Ejecuta todas las extracciones y combina en un único DataFrame"""
        print("Extrayendo métricas sociales...")
        social = self.extract_social_metrics()
        
        print("Extrayendo métricas de amistades...")
        friendships = self.extract_friendship_metrics()
        
        print("Extrayendo engagement en comunidades...")
        communities = self.extract_community_engagement()
        
        print("Extrayendo métricas de posts...")
        posts = self.extract_post_metrics()
        
        print("Extrayendo métricas de comentarios...")
        comments = self.extract_comment_metrics()
        
        print("Extrayendo métricas de mensajería...")
        messaging = self.extract_messaging_metrics()
        
        print("Extrayendo preferencias e intereses...")
        preferences = self.extract_preferences()
        
        print("Extrayendo patrones temporales...")
        temporal = self.extract_temporal_patterns()
        
        # Merge all dataframes
        print("Combinando todas las features...")
        df = social
        for dataset in [friendships, communities, posts, comments, messaging, preferences, temporal]:
            df = pd.merge(df, dataset, on='user_id', how='left')
        
        # Rellenar NaN con 0 (usuarios sin actividad en ciertas áreas)
        df = df.fillna(0)
        
        # Calcular features derivadas
        print("Calculando features derivadas...")
        df = self.calculate_derived_features(df)
        
        print(f"Extracción completada. Total de usuarios: {len(df)}")
        print(f"Total de features: {len(df.columns)}")
        
        return df
    
    def save_to_csv(self, df, filename='features_riesgo_psicosocial.csv'):
        """Guarda el dataset en CSV"""
        df.to_csv(filename, index=False)
        print(f"Dataset guardado en: {filename}")


# Ejemplo de uso
if __name__ == "__main__":
    # Configurar conexiones
    MYSQL_URI = "mysql+pymysql://posts_user:posts123@localhost/posts_dev_db"
    POSTGRES_URI = "postgresql://user:password@localhost/auth_db"
    
    # Inicializar extractor
    extractor = FeatureExtractor(MYSQL_URI, POSTGRES_URI)
    
    # Extraer todas las features
    df_features = extractor.extract_all_features()
    
    # Mostrar estadísticas descriptivas
    print("\n=== ESTADÍSTICAS DESCRIPTIVAS ===")
    print(df_features.describe())
    
    # Identificar usuarios en alto riesgo (preliminar)
    alto_riesgo = df_features[
        (df_features['indice_aislamiento_social'] > 6) |
        (df_features['amigos_reales'] == 0) |
        (df_features['dias_inactividad'] > 60)
    ]
    print(f"\n⚠️ Usuarios identificados en alto riesgo: {len(alto_riesgo)}")
    
    # Guardar dataset
    extractor.save_to_csv(df_features)
