-- 📊 שאילתות SQL לבדיקת טבלת ai_feedback

-- ===================================
-- 1. ספירת כמות ניתוחים
-- ===================================
SELECT COUNT(*) as total_analyses
FROM ai_feedback 
WHERE feedback_type = 'team_analysis';


-- ===================================
-- 2. הצגת כל הניתוחים (סיכום)
-- ===================================
SELECT 
    af.id,
    u.username,
    u.email,
    r.name as repository,
    (af.meta_data->>'performance_score')::float as score,
    af.meta_data->>'is_best_performer' as is_best,
    af.created_at
FROM ai_feedback af
LEFT JOIN users u ON u.id = af.user_id
LEFT JOIN repositories r ON r.id = af.repository_id
WHERE af.feedback_type = 'team_analysis'
ORDER BY af.created_at DESC
LIMIT 20;


-- ===================================
-- 3. העובדים המצטיינים בלבד
-- ===================================
SELECT 
    u.username as "שם משתמש",
    u.email as "אימייל",
    r.name as "ריפוזיטורי",
    (af.meta_data->>'performance_score')::float as "ציון",
    af.created_at as "תאריך ניתוח"
FROM ai_feedback af
LEFT JOIN users u ON u.id = af.user_id
LEFT JOIN repositories r ON r.id = af.repository_id
WHERE af.feedback_type = 'team_analysis'
  AND af.meta_data->>'is_best_performer' = 'true'
ORDER BY (af.meta_data->>'performance_score')::float DESC;


-- ===================================
-- 4. ניתוח מפורט של רשומה אחת
-- ===================================
SELECT 
    af.id,
    u.username,
    u.email,
    r.name as repository,
    af.content->>'team_health' as team_health,
    af.content->>'improvement_suggestions' as suggestions,
    af.content->>'collaboration_insights' as collaboration,
    af.meta_data,
    af.created_at
FROM ai_feedback af
LEFT JOIN users u ON u.id = af.user_id
LEFT JOIN repositories r ON r.id = af.repository_id
WHERE af.feedback_type = 'team_analysis'
ORDER BY af.created_at DESC
LIMIT 1;


-- ===================================
-- 5. סטטיסטיקות כלליות
-- ===================================
SELECT 
    COUNT(*) as "כמות ניתוחים",
    COUNT(DISTINCT user_id) as "כמות עובדים",
    COUNT(DISTINCT repository_id) as "כמות ריפוזיטוריז",
    AVG((meta_data->>'performance_score')::float) as "ציון ממוצע",
    MAX((meta_data->>'performance_score')::float) as "ציון מקסימלי",
    MIN((meta_data->>'performance_score')::float) as "ציון מינימלי"
FROM ai_feedback
WHERE feedback_type = 'team_analysis';


-- ===================================
-- 6. התפלגות ציונים
-- ===================================
SELECT 
    CASE 
        WHEN (meta_data->>'performance_score')::float >= 200 THEN 'מצוין (200+)'
        WHEN (meta_data->>'performance_score')::float >= 100 THEN 'טוב (100-199)'
        WHEN (meta_data->>'performance_score')::float >= 50 THEN 'בינוני (50-99)'
        ELSE 'נמוך (0-49)'
    END as score_range,
    COUNT(*) as count
FROM ai_feedback
WHERE feedback_type = 'team_analysis'
GROUP BY score_range
ORDER BY MIN((meta_data->>'performance_score')::float) DESC;


-- ===================================
-- 7. ניתוחים אחרונים לפי ריפוזיטורי
-- ===================================
SELECT 
    r.name as repository,
    COUNT(*) as team_members,
    MAX(af.created_at) as last_analysis,
    AVG((af.meta_data->>'performance_score')::float) as avg_score
FROM ai_feedback af
LEFT JOIN repositories r ON r.id = af.repository_id
WHERE af.feedback_type = 'team_analysis'
GROUP BY r.id, r.name
ORDER BY MAX(af.created_at) DESC;


-- ===================================
-- 8. מחיקת כל הניתוחים (במקרה של בדיקה)
-- ===================================
-- DELETE FROM ai_feedback WHERE feedback_type = 'team_analysis';
-- אזהרה: זה ימחק את כל הנתונים! השתמש רק לבדיקות!
