-- Tester la requête pour récupérer les factures avec le total payé
SELECT i.*,
       CONCAT(p.first_name, ' ', p.last_name) as patient_name,
       p.patient_number,
       COALESCE(SUM(pay.amount), 0) as total_paid
FROM invoices i
JOIN patients p ON i.patient_id = p.id
LEFT JOIN payments pay ON i.id = pay.invoice_id
GROUP BY i.id
ORDER BY i.created_at DESC;
