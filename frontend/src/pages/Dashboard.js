import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountingService, patientService, appointmentService, admissionService, pharmacyService, medicalRecordService } from '../services/api';
import { FaMoneyBillWave, FaChartLine, FaExclamationTriangle, FaUser, FaEnvelope, FaUserTag, FaIdCard, FaUserInjured, FaCalendarCheck, FaHospital, FaPills, FaClipboardList, FaStethoscope, FaClock, FaCheckCircle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [waitingAdmissions, setWaitingAdmissions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const promises = [];

      // Charger les statistiques financières pour ADMIN et SUPERVISOR
      if (user.role_name === 'ADMIN' || user.role_name === 'SUPERVISOR') {
        promises.push(accountingService.getDashboard());
      } else {
        promises.push(Promise.resolve({ data: { data: null } }));
      }

      // Charger les autres données
      promises.push(
        patientService.getAll(),
        appointmentService.getToday(),
        admissionService.getWaiting(),
        pharmacyService.getLowStock(),
        medicalRecordService.getAllConsultations()
      );

      const [statsRes, patientsRes, appointmentsRes, admissionsRes, lowStockRes, consultationsRes] = await Promise.all(promises);

      setStats(statsRes.data.data);
      setPatients(patientsRes.data.data || []);
      setTodayAppointments(appointmentsRes.data.data || []);
      setWaitingAdmissions(admissionsRes.data.data || []);
      setLowStockProducts(lowStockRes.data.data || []);
      setConsultations(consultationsRes.data.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="page-container">Chargement...</div>;
  }

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <h1>Tableau de bord</h1>
        <p>Bienvenue, {user.last_name} {user.first_name} - {user.role_name}</p>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Patients</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#3b82f6' }}>
              <FaUserInjured />
            </div>
          </div>
          <div className="stat-card-value">{patients.length}</div>
          <div className="stat-card-subtitle">Patients enregistrés</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Rendez-vous du jour</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#10b981' }}>
              <FaCalendarCheck />
            </div>
          </div>
          <div className="stat-card-value">{todayAppointments.length}</div>
          <div className="stat-card-subtitle">Rendez-vous programmés</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Admissions en attente</span>
            <div className="stat-card-icon warning">
              <FaHospital />
            </div>
          </div>
          <div className="stat-card-value">{waitingAdmissions.length}</div>
          <div className="stat-card-subtitle">En attente</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Stock faible</span>
            <div className="stat-card-icon danger">
              <FaPills />
            </div>
          </div>
          <div className="stat-card-value">{lowStockProducts.length}</div>
          <div className="stat-card-subtitle">Produits à réapprovisionner</div>
        </div>
      </div>

      {/* Statistiques des consultations médicales */}
      <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>Consultations Médicales</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Consultations en attente</span>
            <div className="stat-card-icon warning">
              <FaClock />
            </div>
          </div>
          <div className="stat-card-value">{consultations.filter(c => c.status === 'EN_ATTENTE').length}</div>
          <div className="stat-card-subtitle">En attente de prise en charge</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Consultations en cours</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#3b82f6' }}>
              <FaStethoscope />
            </div>
          </div>
          <div className="stat-card-value">{consultations.filter(c => c.status === 'EN_COURS').length}</div>
          <div className="stat-card-subtitle">Actuellement traitées</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Consultations terminées (Aujourd'hui)</span>
            <div className="stat-card-icon success">
              <FaCheckCircle />
            </div>
          </div>
          <div className="stat-card-value">
            {consultations.filter(c => {
              if (c.status !== 'TERMINEE') return false;
              const today = new Date().toDateString();
              const consultationDate = new Date(c.updated_at).toDateString();
              return today === consultationDate;
            }).length}
          </div>
          <div className="stat-card-subtitle">Terminées aujourd'hui</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Consultations</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <FaClipboardList />
            </div>
          </div>
          <div className="stat-card-value">{consultations.length}</div>
          <div className="stat-card-subtitle">Toutes les consultations</div>
        </div>
      </div>

      {/* Statistiques financières (ADMIN/SUPERVISOR uniquement) */}
      {stats && (
        <>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>Statistiques Financières</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Revenus du jour</span>
                <div className="stat-card-icon success">
                  <FaMoneyBillWave />
                </div>
              </div>
              <div className="stat-card-value">{stats.today.income.toLocaleString()}</div>
              <div className="stat-card-subtitle">FCFA</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Dépenses du jour</span>
                <div className="stat-card-icon danger">
                  <FaChartLine />
                </div>
              </div>
              <div className="stat-card-value">{stats.today.expense.toLocaleString()}</div>
              <div className="stat-card-subtitle">FCFA</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Net du jour</span>
                <div className="stat-card-icon info">
                  <FaMoneyBillWave />
                </div>
              </div>
              <div className="stat-card-value">{stats.today.net.toLocaleString()}</div>
              <div className="stat-card-subtitle">FCFA</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Factures en attente</span>
                <div className="stat-card-icon warning">
                  <FaExclamationTriangle />
                </div>
              </div>
              <div className="stat-card-value">{stats.pending.count}</div>
              <div className="stat-card-subtitle">Total: {stats.pending.total.toLocaleString()} FCFA</div>
            </div>
          </div>

          <div className="stats-grid" style={{ marginTop: '1rem' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Revenus du mois</span>
                <div className="stat-card-icon success">
                  <FaMoneyBillWave />
                </div>
              </div>
              <div className="stat-card-value">{stats.month.income.toLocaleString()}</div>
              <div className="stat-card-subtitle">FCFA</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Dépenses du mois</span>
                <div className="stat-card-icon danger">
                  <FaChartLine />
                </div>
              </div>
              <div className="stat-card-value">{stats.month.expense.toLocaleString()}</div>
              <div className="stat-card-subtitle">FCFA</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Net du mois</span>
                <div className="stat-card-icon info">
                  <FaMoneyBillWave />
                </div>
              </div>
              <div className="stat-card-value">{stats.month.net.toLocaleString()}</div>
              <div className="stat-card-subtitle">FCFA</div>
            </div>
          </div>
        </>
      )}

      {/* Tableaux d'information */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Rendez-vous du jour */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><FaCalendarCheck /> Rendez-vous du jour</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Patient</th>
                  <th>Médecin</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                      Aucun rendez-vous aujourd'hui
                    </td>
                  </tr>
                ) : (
                  todayAppointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.appointment_time}</td>
                      <td>{appointment.patient_name}</td>
                      <td>{appointment.doctor_name || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admissions en attente */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><FaHospital /> Admissions en attente</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Motif</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {waitingAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                      Aucune admission en attente
                    </td>
                  </tr>
                ) : (
                  waitingAdmissions.slice(0, 5).map((admission) => (
                    <tr key={admission.id}>
                      <td>{admission.patient_name}</td>
                      <td>{admission.service || '-'}</td>
                      <td>{new Date(admission.admission_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Consultations récentes */}
      {consultations.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title"><FaStethoscope /> Consultations Récentes</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Motif</th>
                  <th>Médecin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {consultations.slice(0, 10).map((consultation) => (
                  <tr key={consultation.id}>
                    <td>{new Date(consultation.consultation_date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                    <td><strong>{consultation.patient_first_name} {consultation.patient_last_name}</strong></td>
                    <td>{consultation.chief_complaint}</td>
                    <td>
                      {consultation.doctor_first_name && consultation.doctor_last_name
                        ? `Dr. ${consultation.doctor_first_name} ${consultation.doctor_last_name}`
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge ${
                        consultation.status === 'EN_ATTENTE' ? 'badge-warning' :
                        consultation.status === 'EN_COURS' ? 'badge-info' :
                        'badge-success'
                      }`}>
                        {consultation.status === 'EN_ATTENTE' ? 'En attente' :
                         consultation.status === 'EN_COURS' ? 'En cours' :
                         'Terminée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock faible */}
      {lowStockProducts.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title"><FaPills /> Produits en stock faible</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Stock actuel</th>
                  <th>Seuil minimum</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 10).map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.product_name}</strong></td>
                    <td>{product.current_stock}</td>
                    <td>{product.minimum_stock}</td>
                    <td>
                      <span className={`badge ${product.current_stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {product.current_stock === 0 ? 'Rupture' : 'Stock faible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Informations de connexion */}
      <div className="info-card" style={{ marginTop: '1.5rem' }}>
        <div className="info-card-header">
          <div className="info-card-icon">
            <FaUser />
          </div>
          <h2 className="info-card-title">Informations de connexion</h2>
        </div>
        <div>
          <div className="info-item">
            <span className="info-label"><FaIdCard /> Utilisateur</span>
            <span className="info-value">{user.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FaEnvelope /> Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FaUserTag /> Rôle</span>
            <span className="info-value">{user.role_name}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FaUser /> Nom complet</span>
            <span className="info-value">{user.last_name} {user.first_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
