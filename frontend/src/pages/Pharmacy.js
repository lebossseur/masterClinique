import React, { useState, useEffect } from 'react';
import { pharmacyService, patientService } from '../services/api';
import {
  FaPlus, FaPills, FaExclamationTriangle, FaBoxOpen,
  FaArrowUp, FaArrowDown, FaHistory, FaTruck, FaSearch,
  FaEdit, FaTrash, FaEye, FaTimes, FaChartLine
} from 'react-icons/fa';

const Pharmacy = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [loading, setLoading] = useState(false);

  // Données
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [stockExits, setStockExits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [medicationTypes, setMedicationTypes] = useState([]);
  const [storageTypes, setStorageTypes] = useState([]);
  const [packagingTypes, setPackagingTypes] = useState([]);

  // Point de Vente (POS)
  const [cart, setCart] = useState([]);
  const [posSearchTerm, setPosSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [posPatients, setPosPatients] = useState([]);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);
  const [showStockExitModal, setShowStockExitModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Formulaires
  const [productForm, setProductForm] = useState({
    name: '', code: '', category_id: '', medication_type_id: '',
    storage_type_id: '', packaging_type_id: '', description: '',
    manufacturer: '', dosage: '', unit: 'unité',
    unit_price: '', selling_price: '', quantity_in_stock: 0,
    reorder_level: 10, expiry_date: '', batch_number: '',
    requires_prescription: false
  });

  const [stockEntryForm, setStockEntryForm] = useState({
    entry_number: '', entry_type: 'PURCHASE', supplier_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    invoice_number: '', notes: '', items: []
  });

  const [stockExitForm, setStockExitForm] = useState({
    exit_number: '', exit_type: 'SALE', patient_id: '',
    exit_date: new Date().toISOString().split('T')[0],
    reason: '', notes: '', items: []
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '', contact_person: '', phone: '', email: '', address: '', notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);

  // Rapports de ventes
  const [salesReport, setSalesReport] = useState(null);
  const [reportStartDate, setReportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Premier jour du mois
    return date.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);

  useEffect(() => {
    loadReferenceData();
    loadData();
  }, [activeTab]);

  const loadReferenceData = async () => {
    try {
      const [categoriesRes, medTypesRes, storageTypesRes, packagingTypesRes, suppliersRes] = await Promise.all([
        pharmacyService.getCategories(),
        pharmacyService.getMedicationTypes(),
        pharmacyService.getStorageTypes(),
        pharmacyService.getPackagingTypes(),
        pharmacyService.getAllSuppliers()
      ]);

      setCategories(categoriesRes.data.data);
      setMedicationTypes(medTypesRes.data.data);
      setStorageTypes(storageTypesRes.data.data);
      setPackagingTypes(packagingTypesRes.data.data);
      setSuppliers(suppliersRes.data.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const [productsRes, outOfStockRes] = await Promise.all([
        pharmacyService.getAllProducts(),
        pharmacyService.getOutOfStock()
      ]);
      setProducts(productsRes.data.data);
      setOutOfStockProducts(outOfStockRes.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pos') {
        // Charger les produits pour le POS
        await loadProducts();
      } else if (activeTab === 'products') {
        const [productsRes, lowStockRes, expiredRes, outOfStockRes] = await Promise.all([
          pharmacyService.getAllProducts(),
          pharmacyService.getLowStock(),
          pharmacyService.getExpiredProducts(),
          pharmacyService.getOutOfStock()
        ]);
        setProducts(productsRes.data.data);
        setLowStockProducts(lowStockRes.data.data);
        setExpiredProducts(expiredRes.data.data);
        setOutOfStockProducts(outOfStockRes.data.data);
      } else if (activeTab === 'entries') {
        const response = await pharmacyService.getAllStockEntries();
        setStockEntries(response.data.data);
      } else if (activeTab === 'exits') {
        const response = await pharmacyService.getAllStockExits();
        setStockExits(response.data.data);
      } else if (activeTab === 'reports') {
        await loadSalesReport();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    try {
      const response = await pharmacyService.getSalesReport(reportStartDate, reportEndDate);
      setSalesReport(response.data.data);
    } catch (error) {
      console.error('Error loading sales report:', error);
      alert('Erreur lors du chargement du rapport de ventes');
    }
  };

  const generateNumber = (type) => {
    const timestamp = Date.now();
    const prefix = type === 'entry' ? 'ENT' : 'SOR';
    return `${prefix}-${timestamp}`;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await pharmacyService.updateProduct(editingProduct.id, productForm);
        alert('Produit mis à jour avec succès');
      } else {
        await pharmacyService.createProduct(productForm);
        alert('Produit créé avec succès');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '', code: '', category_id: '', medication_type_id: '',
        storage_type_id: '', packaging_type_id: '', description: '',
        manufacturer: '', dosage: '', unit: 'unité',
        unit_price: '', selling_price: '', quantity_in_stock: 0,
        reorder_level: 10, expiry_date: '', batch_number: '',
        requires_prescription: false
      });
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de l\'enregistrement du produit');
    }
  };

  const handleCreateStockEntry = async (e) => {
    e.preventDefault();
    if (stockEntryForm.items.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    const total_amount = stockEntryForm.items.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0);

    try {
      await pharmacyService.createStockEntry({
        ...stockEntryForm,
        total_amount
      });
      alert('Entrée de stock enregistrée avec succès');
      setShowStockEntryModal(false);
      setStockEntryForm({
        entry_number: '', entry_type: 'PURCHASE', supplier_id: '',
        entry_date: new Date().toISOString().split('T')[0],
        invoice_number: '', notes: '', items: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating stock entry:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleCreateStockExit = async (e) => {
    e.preventDefault();
    if (stockExitForm.items.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    const total_amount = stockExitForm.items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);

    try {
      await pharmacyService.createStockExit({
        ...stockExitForm,
        total_amount
      });
      alert('Sortie de stock enregistrée avec succès');
      setShowStockExitModal(false);
      setStockExitForm({
        exit_number: '', exit_type: 'SALE', patient_id: '',
        exit_date: new Date().toISOString().split('T')[0],
        reason: '', notes: '', items: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating stock exit:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await pharmacyService.createSupplier(supplierForm);
      alert('Fournisseur créé avec succès');
      setShowSupplierModal(false);
      setSupplierForm({
        name: '', contact_person: '', phone: '', email: '', address: '', notes: ''
      });
      loadReferenceData();
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Erreur lors de la création du fournisseur');
    }
  };

  const addItemToEntry = () => {
    const selectedProduct = products.find(p => p.id === parseInt(document.getElementById('entry-product').value));
    if (!selectedProduct) return;

    const quantity = parseInt(document.getElementById('entry-quantity').value);
    const unit_cost = parseFloat(document.getElementById('entry-unit-cost').value);

    if (!quantity || !unit_cost) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const item = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      product_code: selectedProduct.code,
      quantity,
      unit_cost,
      total_cost: quantity * unit_cost,
      batch_number: document.getElementById('entry-batch').value,
      expiry_date: document.getElementById('entry-expiry').value
    };

    setStockEntryForm({
      ...stockEntryForm,
      items: [...stockEntryForm.items, item]
    });

    // Reset fields
    document.getElementById('entry-product').value = '';
    document.getElementById('entry-quantity').value = '';
    document.getElementById('entry-unit-cost').value = '';
    document.getElementById('entry-batch').value = '';
    document.getElementById('entry-expiry').value = '';
  };

  const addItemToExit = () => {
    const selectedProduct = products.find(p => p.id === parseInt(document.getElementById('exit-product').value));
    if (!selectedProduct) return;

    const quantity = parseInt(document.getElementById('exit-quantity').value);

    if (!quantity) {
      alert('Veuillez remplir la quantité');
      return;
    }

    if (quantity > selectedProduct.quantity_in_stock) {
      alert('Stock insuffisant !');
      return;
    }

    const unit_price = stockExitForm.exit_type === 'SALE' ? selectedProduct.selling_price : 0;

    const item = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      product_code: selectedProduct.code,
      quantity,
      unit_price,
      total_price: quantity * unit_price,
      batch_number: document.getElementById('exit-batch').value,
      expiry_date: document.getElementById('exit-expiry').value
    };

    setStockExitForm({
      ...stockExitForm,
      items: [...stockExitForm.items, item]
    });

    // Reset fields
    document.getElementById('exit-product').value = '';
    document.getElementById('exit-quantity').value = '';
    document.getElementById('exit-batch').value = '';
    document.getElementById('exit-expiry').value = '';
  };

  const searchPatients = async (query) => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }
    try {
      const response = await patientService.search(query);
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Point de Vente Functions
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.quantity_in_stock) {
        alert('Stock insuffisant !');
        return;
      }
      const newQuantity = existingItem.quantity + 1;
      const newTotalPrice = Math.round(newQuantity * existingItem.unit_price * 100) / 100;

      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: newQuantity, total_price: newTotalPrice }
          : item
      ));
    } else {
      if (product.quantity_in_stock <= 0) {
        alert('Produit en rupture de stock !');
        return;
      }
      const unitPrice = parseFloat(product.selling_price);
      const totalPrice = Math.round(1 * unitPrice * 100) / 100;

      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: 1,
        unit_price: unitPrice,
        total_price: totalPrice,
        batch_number: product.batch_number,
        expiry_date: product.expiry_date
      }]);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > product.quantity_in_stock) {
      alert('Stock insuffisant !');
      return;
    }

    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newTotalPrice = Math.round(newQuantity * item.unit_price * 100) / 100;
        return { ...item, quantity: newQuantity, total_price: newTotalPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPatient(null);
    setAmountPaid('');
    setPosSearchTerm('');
  };

  const calculateTotal = () => {
    const total = cart.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    return Math.round(total * 100) / 100; // Arrondi à 2 décimales
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    const change = paid - total;
    return Math.round(change * 100) / 100; // Arrondi à 2 décimales
  };

  const searchPosPatients = async (query) => {
    if (query.length < 2) {
      setPosPatients([]);
      return;
    }
    try {
      const response = await patientService.search(query);
      setPosPatients(response.data.data);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      alert('Le panier est vide !');
      return;
    }

    if (paymentMethod === 'CASH' && calculateChange() < 0) {
      alert('Montant payé insuffisant !');
      return;
    }

    try {
      const total = calculateTotal();
      const change = calculateChange();

      const exitData = {
        exit_number: `SALE-${Date.now()}`,
        exit_type: 'SALE',
        patient_id: selectedPatient?.id,
        exit_date: new Date().toISOString().split('T')[0],
        total_amount: total,
        reason: `Vente caisse - ${paymentMethod}`,
        notes: paymentMethod === 'CASH' ? `Montant payé: ${parseFloat(amountPaid).toFixed(2)} FCFA, Monnaie: ${change.toFixed(2)} FCFA` : '',
        items: cart
      };

      await pharmacyService.createStockExit(exitData);
      alert('Vente enregistrée avec succès !');

      // Rafraîchir les produits pour mettre à jour les stocks
      await loadProducts();
      clearCart();
    } catch (error) {
      console.error('Error completing sale:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement de la vente');
    }
  };

  const posFilteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(posSearchTerm.toLowerCase()) ||
     p.code.toLowerCase().includes(posSearchTerm.toLowerCase())) &&
    p.is_active && p.quantity_in_stock > 0
  );

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: '0.5rem' }}>
          Gestion de la Pharmacie
        </h1>
        <p style={{ marginBottom: 0, color: 'var(--secondary-color)', fontSize: '1rem', fontWeight: 500 }}>
          Gestion complète des médicaments et des stocks
        </p>
      </div>

      {outOfStockProducts.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaExclamationTriangle style={{ fontSize: '1.5rem' }} />
          <div>
            <strong>ALERTE RUPTURE DE STOCK!</strong>
            <span style={{ marginLeft: '0.5rem' }}>{outOfStockProducts.length} produit(s) en rupture de stock</span>
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
          <FaExclamationTriangle /> {lowStockProducts.length} produit(s) en stock faible
        </div>
      )}

      {expiredProducts.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <FaExclamationTriangle /> {expiredProducts.length} produit(s) périmé(s)
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #e5e7eb',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('pos')}
          className={activeTab === 'pos' ? 'tab-active' : 'tab'}
        >
          <FaBoxOpen /> Caisse
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={activeTab === 'products' ? 'tab-active' : 'tab'}
          style={{ position: 'relative' }}
        >
          <FaPills /> Médicaments
          {outOfStockProducts.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {outOfStockProducts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('entries')}
          className={activeTab === 'entries' ? 'tab-active' : 'tab'}
        >
          <FaArrowUp /> Entrées de Stock
        </button>
        <button
          onClick={() => setActiveTab('exits')}
          className={activeTab === 'exits' ? 'tab-active' : 'tab'}
        >
          <FaArrowDown /> Sorties de Stock
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={activeTab === 'suppliers' ? 'tab-active' : 'tab'}
        >
          <FaTruck /> Fournisseurs
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={activeTab === 'reports' ? 'tab-active' : 'tab'}
        >
          <FaChartLine /> Rapports
        </button>
      </div>

      {/* ONGLET CAISSE / POINT DE VENTE */}
      {activeTab === 'pos' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            {/* Section Produits */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Rechercher un médicament par nom ou code..."
                  value={posSearchTerm}
                  onChange={(e) => setPosSearchTerm(e.target.value)}
                  style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
                  autoFocus
                />
              </div>

              <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--dark-text)' }}>Produits disponibles</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {posFilteredProducts.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--secondary-color)', padding: '2rem' }}>
                      Aucun produit disponible
                    </p>
                  ) : (
                    posFilteredProducts.slice(0, 20).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        style={{
                          padding: '1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'white',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-color)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--dark-text)', fontSize: '0.95rem' }}>{product.name}</strong>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                          Code: {product.code}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                          Stock: <span style={{ color: product.quantity_in_stock <= product.reorder_level ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 'bold' }}>
                            {product.quantity_in_stock}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {parseFloat(product.selling_price || 0).toFixed(2)} FCFA
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Section Panier & Paiement */}
            <div>
              <div className="card" style={{ position: 'sticky', top: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--dark-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Panier ({cart.length})</span>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <FaTrash /> Vider
                    </button>
                  )}
                </h3>

                {/* Patient Selection */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                    Patient (optionnel)
                  </label>
                  {!selectedPatient ? (
                    <>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Rechercher un patient..."
                        onChange={(e) => searchPosPatients(e.target.value)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      {posPatients.length > 0 && (
                        <div style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          backgroundColor: 'white'
                        }}>
                          {posPatients.map(patient => (
                            <div
                              key={patient.id}
                              style={{
                                padding: '0.75rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f3f4f6',
                                transition: 'background 0.2s'
                              }}
                              onClick={() => {
                                setSelectedPatient(patient);
                                setPosPatients([]);
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                              <strong>{patient.first_name} {patient.last_name}</strong>
                              <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)' }}>
                                {patient.patient_number}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{selectedPatient.first_name} {selectedPatient.last_name}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)' }}>
                          {selectedPatient.patient_number}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="btn btn-sm btn-danger"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: cart.length > 0 ? '0.5rem' : 0
                }}>
                  {cart.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary-color)' }}>
                      Panier vide
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.75rem',
                          borderBottom: index < cart.length - 1 ? '1px solid #f3f4f6' : 'none',
                          backgroundColor: 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{item.product_name}</strong>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--danger-color)',
                              cursor: 'pointer',
                              fontSize: '1.2rem'
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            style={{
                              width: '30px',
                              height: '30px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '5px',
                              background: 'white',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(item.product_id, parseInt(e.target.value) || 0)}
                            style={{
                              width: '60px',
                              textAlign: 'center',
                              padding: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '5px'
                            }}
                          />
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            style={{
                              width: '30px',
                              height: '30px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '5px',
                              background: 'white',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            +
                          </button>
                          <span style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
                            x {parseFloat(item.unit_price).toFixed(2)} FCFA
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {parseFloat(item.total_price).toFixed(2)} FCFA
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span>TOTAL:</span>
                    <span style={{ color: 'var(--primary-color)' }}>
                      {calculateTotal().toFixed(2)} FCFA
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                    Mode de paiement
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => setPaymentMethod('CASH')}
                      className={paymentMethod === 'CASH' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                      style={{ padding: '0.75rem' }}
                    >
                      Espèces
                    </button>
                    <button
                      onClick={() => setPaymentMethod('CARD')}
                      className={paymentMethod === 'CARD' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                      style={{ padding: '0.75rem' }}
                    >
                      Carte
                    </button>
                    <button
                      onClick={() => setPaymentMethod('MOBILE')}
                      className={paymentMethod === 'MOBILE' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                      style={{ padding: '0.75rem' }}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Amount Paid for Cash */}
                {paymentMethod === 'CASH' && cart.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                      Montant payé
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Entrez le montant..."
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      style={{ fontSize: '1.2rem', padding: '1rem' }}
                    />
                    {amountPaid && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: calculateChange() >= 0 ? '#d1fae5' : '#fee2e2',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}>
                        Monnaie à rendre: {calculateChange().toFixed(2)} FCFA
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Sale Button */}
                <button
                  onClick={completeSale}
                  disabled={cart.length === 0}
                  className="btn btn-success"
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Valider la vente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET PRODUITS */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Rechercher un médicament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button className="btn btn-primary" onClick={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}>
              <FaPlus /> Nouveau Médicament
            </button>
          </div>

          {/* Section Rupture de Stock */}
          {outOfStockProducts.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#fef2f2', border: '2px solid var(--danger-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: '8px' }}>
                <FaExclamationTriangle style={{ fontSize: '1.5rem' }} />
                <h3 style={{ margin: 0, color: 'white' }}>PRODUITS EN RUPTURE DE STOCK ({outOfStockProducts.length})</h3>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Prix de Vente</th>
                      <th>Niveau de réapprovisionnement</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStockProducts.map((product) => (
                      <tr key={product.id} style={{ backgroundColor: '#fee2e2' }}>
                        <td><strong>{product.code}</strong></td>
                        <td>
                          <strong style={{ color: 'var(--danger-color)' }}>{product.name}</strong>
                          {product.dosage && <div style={{ fontSize: '0.85rem', color: '#666' }}>{product.dosage}</div>}
                        </td>
                        <td>{product.category_name || '-'}</td>
                        <td>{product.selling_price?.toLocaleString()} FCFA</td>
                        <td>
                          <span className="badge badge-warning">
                            Réappro: {product.reorder_level} {product.unit}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setEditingProduct(product);
                              setProductForm(product);
                              setShowProductModal(true);
                            }}
                          >
                            <FaEdit /> Commander
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Conservation</th>
                    <th>Emballage</th>
                    <th>Stock</th>
                    <th>Prix Vente</th>
                    <th>Péremption</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="10" style={{ textAlign: 'center' }}>Chargement...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr><td colSpan="10" style={{ textAlign: 'center' }}>Aucun médicament trouvé</td></tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} style={{ backgroundColor: product.quantity_in_stock === 0 ? '#fee2e2' : 'inherit' }}>
                        <td>{product.code}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {product.quantity_in_stock === 0 && (
                              <FaExclamationTriangle style={{ color: 'var(--danger-color)', fontSize: '1rem' }} />
                            )}
                            <div>
                              <strong style={{ color: product.quantity_in_stock === 0 ? 'var(--danger-color)' : 'inherit' }}>
                                {product.name}
                              </strong>
                              {product.dosage && <div style={{ fontSize: '0.85rem', color: '#666' }}>{product.dosage}</div>}
                            </div>
                          </div>
                        </td>
                        <td>{product.medication_type || '-'}</td>
                        <td>{product.storage_type || '-'}</td>
                        <td>{product.packaging_type || '-'}</td>
                        <td>
                          {product.quantity_in_stock === 0 ? (
                            <span className="badge badge-danger" style={{ fontSize: '0.9rem' }}>
                              RUPTURE
                            </span>
                          ) : (
                            <span style={{
                              color: product.quantity_in_stock <= product.reorder_level ? 'var(--warning-color)' : 'inherit',
                              fontWeight: product.quantity_in_stock <= product.reorder_level ? 'bold' : 'normal'
                            }}>
                              {product.quantity_in_stock} {product.unit}
                            </span>
                          )}
                        </td>
                        <td>{product.selling_price?.toLocaleString()} FCFA</td>
                        <td style={{
                          color: product.expiry_date && new Date(product.expiry_date) <= new Date() ? 'var(--danger-color)' : 'inherit'
                        }}>
                          {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : '-'}
                        </td>
                        <td>
                          <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {product.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setEditingProduct(product);
                              setProductForm(product);
                              setShowProductModal(true);
                            }}
                            style={{ marginRight: '0.5rem' }}
                          >
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET ENTRÉES DE STOCK */}
      {activeTab === 'entries' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Entrées de Stock</h2>
            <button className="btn btn-success" onClick={() => {
              setStockEntryForm({
                ...stockEntryForm,
                entry_number: generateNumber('entry'),
                items: []
              });
              setShowStockEntryModal(true);
            }}>
              <FaPlus /> Nouvelle Entrée
            </button>
          </div>

          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>N° Entrée</th>
                    <th>Type</th>
                    <th>Fournisseur</th>
                    <th>Date</th>
                    <th>N° Facture</th>
                    <th>Montant Total</th>
                    <th>Créé par</th>
                    <th>Articles</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center' }}>Chargement...</td></tr>
                  ) : stockEntries.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center' }}>Aucune entrée de stock</td></tr>
                  ) : (
                    stockEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td><strong>{entry.entry_number}</strong></td>
                        <td>
                          <span className="badge badge-info">
                            {entry.entry_type === 'PURCHASE' ? 'Achat' :
                             entry.entry_type === 'ORDER' ? 'Commande' :
                             entry.entry_type === 'DONATION' ? 'Don' : entry.entry_type}
                          </span>
                        </td>
                        <td>{entry.supplier_name || '-'}</td>
                        <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                        <td>{entry.invoice_number || '-'}</td>
                        <td>{entry.total_amount?.toLocaleString()} FCFA</td>
                        <td>{entry.created_by_name}</td>
                        <td>{entry.items_count} article(s)</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET SORTIES DE STOCK */}
      {activeTab === 'exits' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Sorties de Stock</h2>
            <button className="btn btn-danger" onClick={() => {
              setStockExitForm({
                ...stockExitForm,
                exit_number: generateNumber('exit'),
                items: []
              });
              setShowStockExitModal(true);
            }}>
              <FaPlus /> Nouvelle Sortie
            </button>
          </div>

          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>N° Sortie</th>
                    <th>Type</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Montant Total</th>
                    <th>Raison</th>
                    <th>Créé par</th>
                    <th>Articles</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center' }}>Chargement...</td></tr>
                  ) : stockExits.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center' }}>Aucune sortie de stock</td></tr>
                  ) : (
                    stockExits.map((exit) => (
                      <tr key={exit.id}>
                        <td><strong>{exit.exit_number}</strong></td>
                        <td>
                          <span className={`badge ${
                            exit.exit_type === 'SALE' ? 'badge-success' :
                            exit.exit_type === 'EXPIRED' ? 'badge-danger' :
                            exit.exit_type === 'DONATION' ? 'badge-info' : 'badge-warning'
                          }`}>
                            {exit.exit_type === 'SALE' ? 'Vente' :
                             exit.exit_type === 'EXPIRED' ? 'Périmé' :
                             exit.exit_type === 'DONATION' ? 'Don' :
                             exit.exit_type === 'DAMAGED' ? 'Endommagé' : exit.exit_type}
                          </span>
                        </td>
                        <td>{exit.patient_name || '-'}</td>
                        <td>{new Date(exit.exit_date).toLocaleDateString()}</td>
                        <td>{exit.total_amount?.toLocaleString()} FCFA</td>
                        <td>{exit.reason || '-'}</td>
                        <td>{exit.created_by_name}</td>
                        <td>{exit.items_count} article(s)</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET FOURNISSEURS */}
      {activeTab === 'suppliers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Fournisseurs</h2>
            <button className="btn btn-primary" onClick={() => setShowSupplierModal(true)}>
              <FaPlus /> Nouveau Fournisseur
            </button>
          </div>

          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Personne de contact</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Adresse</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Aucun fournisseur</td></tr>
                  ) : (
                    suppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td><strong>{supplier.name}</strong></td>
                        <td>{supplier.contact_person || '-'}</td>
                        <td>{supplier.phone || '-'}</td>
                        <td>{supplier.email || '-'}</td>
                        <td>{supplier.address || '-'}</td>
                        <td>
                          <span className={`badge ${supplier.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {supplier.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET RAPPORTS */}
      {activeTab === 'reports' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Filtres de rapport</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group">
                <label>Date de début</label>
                <input
                  type="date"
                  className="form-input"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Date de fin</label>
                <input
                  type="date"
                  className="form-input"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={loadSalesReport}
                style={{ height: 'fit-content' }}
              >
                <FaSearch /> Générer le rapport
              </button>
            </div>
          </div>

          {salesReport && (
            <>
              {/* Statistiques */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid var(--primary-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                    TOTAL VENTES
                  </h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                    {salesReport.statistics.total_sales}
                  </p>
                </div>
                <div className="card" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid var(--success-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                    MONTANT TOTAL
                  </h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)', margin: 0 }}>
                    {salesReport.statistics.total_amount.toFixed(2)} FCFA
                  </p>
                </div>
                <div className="card" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid var(--warning-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                    VENTE MOYENNE
                  </h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)', margin: 0 }}>
                    {salesReport.statistics.average_sale.toFixed(2)} FCFA
                  </p>
                </div>
              </div>

              {/* Produits les plus vendus */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Top 10 Produits</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Code</th>
                        <th>Catégorie</th>
                        <th>Quantité vendue</th>
                        <th>Montant total</th>
                        <th>Nb. ventes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.top_products.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>Aucune vente</td></tr>
                      ) : (
                        salesReport.top_products.map((product, index) => (
                          <tr key={product.product_id}>
                            <td><strong>{product.product_name}</strong></td>
                            <td>{product.product_code}</td>
                            <td>{product.category_name || '-'}</td>
                            <td>{product.total_quantity}</td>
                            <td><strong>{parseFloat(product.total_amount).toFixed(2)} FCFA</strong></td>
                            <td>{product.sales_count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ventes par jour */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Ventes par jour</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Nombre de ventes</th>
                        <th>Montant total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.daily_sales.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>Aucune vente</td></tr>
                      ) : (
                        salesReport.daily_sales.map((day) => (
                          <tr key={day.date}>
                            <td><strong>{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
                            <td>{day.sales_count}</td>
                            <td><strong>{parseFloat(day.total_amount).toFixed(2)} FCFA</strong></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Liste détaillée des ventes */}
              <div className="card">
                <h2 style={{ marginBottom: '1rem' }}>Détail des ventes</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>N° Vente</th>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Vendeur</th>
                        <th>Montant</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.sales.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>Aucune vente</td></tr>
                      ) : (
                        salesReport.sales.map((sale) => (
                          <tr key={sale.id}>
                            <td><strong>{sale.exit_number}</strong></td>
                            <td>{new Date(sale.exit_date).toLocaleDateString('fr-FR')}</td>
                            <td>{sale.patient_name || <span style={{ color: 'var(--secondary-color)' }}>Client anonyme</span>}</td>
                            <td>{sale.sold_by_name || '-'}</td>
                            <td><strong>{parseFloat(sale.total_amount).toFixed(2)} FCFA</strong></td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setShowSaleDetailModal(true);
                                }}
                              >
                                <FaEye /> Détails
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!salesReport && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <FaChartLine style={{ fontSize: '4rem', color: 'var(--secondary-color)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.2rem', color: 'var(--secondary-color)' }}>
                Sélectionnez une période et cliquez sur "Générer le rapport"
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DÉTAIL DE VENTE */}
      {showSaleDetailModal && selectedSale && (
        <div className="modal-overlay" onClick={() => setShowSaleDetailModal(false)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détail de la vente {selectedSale.exit_number}</h2>
              <button className="close-btn" onClick={() => setShowSaleDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ color: 'var(--secondary-color)', marginBottom: '0.25rem' }}>Date</p>
                  <p style={{ fontWeight: 'bold' }}>{new Date(selectedSale.exit_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--secondary-color)', marginBottom: '0.25rem' }}>Patient</p>
                  <p style={{ fontWeight: 'bold' }}>{selectedSale.patient_name || 'Client anonyme'}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--secondary-color)', marginBottom: '0.25rem' }}>Vendeur</p>
                  <p style={{ fontWeight: 'bold' }}>{selectedSale.sold_by_name || '-'}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--secondary-color)', marginBottom: '0.25rem' }}>Mode de paiement</p>
                  <p style={{ fontWeight: 'bold' }}>{selectedSale.reason}</p>
                </div>
              </div>

              {selectedSale.notes && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--secondary-color)', marginBottom: '0.25rem' }}>Notes</p>
                  <p style={{ margin: 0 }}>{selectedSale.notes}</p>
                </div>
              )}

              <h3 style={{ marginBottom: '1rem' }}>Produits vendus</h3>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.product_name}</strong><br/><small>{item.product_code}</small></td>
                      <td>{item.quantity}</td>
                      <td>{parseFloat(item.unit_price).toFixed(2)} FCFA</td>
                      <td><strong>{parseFloat(item.total_price).toFixed(2)} FCFA</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>TOTAL:</td>
                    <td style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                      {parseFloat(selectedSale.total_amount).toFixed(2)} FCFA
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRODUIT */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Modifier le médicament' : 'Nouveau médicament'}</h2>
              <button className="close-btn" onClick={() => setShowProductModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.code}
                    onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    className="form-input"
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  >
                    <option value="">Sélectionner...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type de médicament</label>
                  <select
                    className="form-input"
                    value={productForm.medication_type_id}
                    onChange={(e) => setProductForm({ ...productForm, medication_type_id: e.target.value })}
                  >
                    <option value="">Sélectionner...</option>
                    {medicationTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type de conservation</label>
                  <select
                    className="form-input"
                    value={productForm.storage_type_id}
                    onChange={(e) => setProductForm({ ...productForm, storage_type_id: e.target.value })}
                  >
                    <option value="">Sélectionner...</option>
                    {storageTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type d'emballage</label>
                  <select
                    className="form-input"
                    value={productForm.packaging_type_id}
                    onChange={(e) => setProductForm({ ...productForm, packaging_type_id: e.target.value })}
                  >
                    <option value="">Sélectionner...</option>
                    {packagingTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fabricant</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.manufacturer}
                    onChange={(e) => setProductForm({ ...productForm, manufacturer: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.dosage}
                    onChange={(e) => setProductForm({ ...productForm, dosage: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Unité</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Prix d'achat *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={productForm.unit_price}
                    onChange={(e) => setProductForm({ ...productForm, unit_price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prix de vente *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock initial</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.quantity_in_stock}
                    onChange={(e) => setProductForm({ ...productForm, quantity_in_stock: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Seuil de réapprovisionnement</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.reorder_level}
                    onChange={(e) => setProductForm({ ...productForm, reorder_level: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Date de péremption</label>
                  <input
                    type="date"
                    className="form-input"
                    value={productForm.expiry_date}
                    onChange={(e) => setProductForm({ ...productForm, expiry_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>N° de lot</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.batch_number}
                    onChange={(e) => setProductForm({ ...productForm, batch_number: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.requires_prescription}
                      onChange={(e) => setProductForm({ ...productForm, requires_prescription: e.target.checked })}
                    />
                    {' '}Nécessite une ordonnance
                  </label>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ENTRÉE DE STOCK */}
      {showStockEntryModal && (
        <div className="modal-overlay" onClick={() => setShowStockEntryModal(false)}>
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle Entrée de Stock</h2>
              <button className="close-btn" onClick={() => setShowStockEntryModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateStockEntry}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label>N° d'entrée *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stockEntryForm.entry_number}
                    onChange={(e) => setStockEntryForm({ ...stockEntryForm, entry_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type d'entrée *</label>
                  <select
                    className="form-input"
                    value={stockEntryForm.entry_type}
                    onChange={(e) => setStockEntryForm({ ...stockEntryForm, entry_type: e.target.value })}
                    required
                  >
                    <option value="PURCHASE">Achat</option>
                    <option value="ORDER">Commande</option>
                    <option value="DONATION">Don</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fournisseur</label>
                  <select
                    className="form-input"
                    value={stockEntryForm.supplier_id}
                    onChange={(e) => setStockEntryForm({ ...stockEntryForm, supplier_id: e.target.value })}
                  >
                    <option value="">Sélectionner...</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date d'entrée *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={stockEntryForm.entry_date}
                    onChange={(e) => setStockEntryForm({ ...stockEntryForm, entry_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>N° de facture</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stockEntryForm.invoice_number}
                    onChange={(e) => setStockEntryForm({ ...stockEntryForm, invoice_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stockEntryForm.notes}
                    onChange={(e) => setStockEntryForm({ ...stockEntryForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginBottom: '1rem' }}>Articles</h3>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                  <div className="form-group">
                    <label>Produit</label>
                    <select id="entry-product" className="form-input">
                      <option value="">Sélectionner...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name} ({product.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantité</label>
                    <input type="number" id="entry-quantity" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Coût unitaire</label>
                    <input type="number" step="0.01" id="entry-unit-cost" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>N° de lot</label>
                    <input type="text" id="entry-batch" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Date péremption</label>
                    <input type="date" id="entry-expiry" className="form-input" />
                  </div>
                  <button type="button" className="btn btn-primary" onClick={addItemToEntry}>
                    <FaPlus />
                  </button>
                </div>
              </div>

              {stockEntryForm.items.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '0.5rem' }}>Produit</th>
                        <th style={{ padding: '0.5rem' }}>Quantité</th>
                        <th style={{ padding: '0.5rem' }}>Coût unitaire</th>
                        <th style={{ padding: '0.5rem' }}>Total</th>
                        <th style={{ padding: '0.5rem' }}>Lot</th>
                        <th style={{ padding: '0.5rem' }}>Péremption</th>
                        <th style={{ padding: '0.5rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockEntryForm.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '0.5rem' }}>{item.product_name}</td>
                          <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                          <td style={{ padding: '0.5rem' }}>{item.unit_cost} FCFA</td>
                          <td style={{ padding: '0.5rem' }}><strong>{item.total_cost} FCFA</strong></td>
                          <td style={{ padding: '0.5rem' }}>{item.batch_number || '-'}</td>
                          <td style={{ padding: '0.5rem' }}>
                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                const newItems = stockEntryForm.items.filter((_, i) => i !== index);
                                setStockEntryForm({ ...stockEntryForm, items: newItems });
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                        <td colSpan="3" style={{ padding: '0.5rem', textAlign: 'right' }}>TOTAL:</td>
                        <td style={{ padding: '0.5rem' }}>
                          {stockEntryForm.items.reduce((sum, item) => sum + item.total_cost, 0).toLocaleString()} FCFA
                        </td>
                        <td colSpan="3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockEntryModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer l'entrée
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SORTIE DE STOCK */}
      {showStockExitModal && (
        <div className="modal-overlay" onClick={() => setShowStockExitModal(false)}>
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle Sortie de Stock</h2>
              <button className="close-btn" onClick={() => setShowStockExitModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateStockExit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label>N° de sortie *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stockExitForm.exit_number}
                    onChange={(e) => setStockExitForm({ ...stockExitForm, exit_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type de sortie *</label>
                  <select
                    className="form-input"
                    value={stockExitForm.exit_type}
                    onChange={(e) => setStockExitForm({ ...stockExitForm, exit_type: e.target.value })}
                    required
                  >
                    <option value="SALE">Vente</option>
                    <option value="EXPIRED">Périmé</option>
                    <option value="DONATION">Don</option>
                    <option value="DAMAGED">Endommagé</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                {stockExitForm.exit_type === 'SALE' && (
                  <div className="form-group">
                    <label>Patient</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Rechercher un patient..."
                      onChange={(e) => searchPatients(e.target.value)}
                    />
                    {patients.length > 0 && (
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', marginTop: '0.25rem', maxHeight: '150px', overflowY: 'auto' }}>
                        {patients.map(patient => (
                          <div
                            key={patient.id}
                            style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                            onClick={() => {
                              setStockExitForm({ ...stockExitForm, patient_id: patient.id });
                              setPatients([]);
                            }}
                          >
                            {patient.first_name} {patient.last_name} ({patient.patient_number})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label>Date de sortie *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={stockExitForm.exit_date}
                    onChange={(e) => setStockExitForm({ ...stockExitForm, exit_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Raison</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stockExitForm.reason}
                    onChange={(e) => setStockExitForm({ ...stockExitForm, reason: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={stockExitForm.notes}
                    onChange={(e) => setStockExitForm({ ...stockExitForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginBottom: '1rem' }}>Articles</h3>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                  <div className="form-group">
                    <label>Produit</label>
                    <select id="exit-product" className="form-input">
                      <option value="">Sélectionner...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.code}) - Stock: {product.quantity_in_stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantité</label>
                    <input type="number" id="exit-quantity" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>N° de lot</label>
                    <input type="text" id="exit-batch" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Date péremption</label>
                    <input type="date" id="exit-expiry" className="form-input" />
                  </div>
                  <button type="button" className="btn btn-primary" onClick={addItemToExit}>
                    <FaPlus />
                  </button>
                </div>
              </div>

              {stockExitForm.items.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '0.5rem' }}>Produit</th>
                        <th style={{ padding: '0.5rem' }}>Quantité</th>
                        <th style={{ padding: '0.5rem' }}>Prix unitaire</th>
                        <th style={{ padding: '0.5rem' }}>Total</th>
                        <th style={{ padding: '0.5rem' }}>Lot</th>
                        <th style={{ padding: '0.5rem' }}>Péremption</th>
                        <th style={{ padding: '0.5rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockExitForm.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '0.5rem' }}>{item.product_name}</td>
                          <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                          <td style={{ padding: '0.5rem' }}>{item.unit_price} FCFA</td>
                          <td style={{ padding: '0.5rem' }}><strong>{item.total_price} FCFA</strong></td>
                          <td style={{ padding: '0.5rem' }}>{item.batch_number || '-'}</td>
                          <td style={{ padding: '0.5rem' }}>
                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                const newItems = stockExitForm.items.filter((_, i) => i !== index);
                                setStockExitForm({ ...stockExitForm, items: newItems });
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                        <td colSpan="3" style={{ padding: '0.5rem', textAlign: 'right' }}>TOTAL:</td>
                        <td style={{ padding: '0.5rem' }}>
                          {stockExitForm.items.reduce((sum, item) => sum + item.total_price, 0).toLocaleString()} FCFA
                        </td>
                        <td colSpan="3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockExitModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer la sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOURNISSEUR */}
      {showSupplierModal && (
        <div className="modal-overlay" onClick={() => setShowSupplierModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouveau Fournisseur</h2>
              <button className="close-btn" onClick={() => setShowSupplierModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateSupplier}>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Personne de contact</label>
                <input
                  type="text"
                  className="form-input"
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSupplierModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
