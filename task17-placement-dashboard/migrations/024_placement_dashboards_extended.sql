-- Extended View for detailed multi-tenant institutional stats 
CREATE OR REPLACE VIEW view_college_placement_analytics AS
SELECT 
  c.id AS college_id,
  c.name AS college_name,
  COUNT(DISTINCT s.id) AS total_students,
  COUNT(DISTINCT a.id) AS total_applications,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'shortlisted') AS total_shortlists,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('offer_generated', 'signed')) AS total_offers,
  COALESCE(MAX(o.ctc_paise), 0) AS highest_package_paise,
  COALESCE(AVG(o.ctc_paise) FILTER (WHERE a.status IN ('offer_generated', 'signed')), 0)::BIGINT AS average_package_paise
FROM platform_colleges c
LEFT JOIN students s ON s.college_id = c.id
LEFT JOIN applications a ON a.student_id = s.id
LEFT JOIN hr_offers o ON o.application_id = a.id
GROUP BY c.id, c.name;