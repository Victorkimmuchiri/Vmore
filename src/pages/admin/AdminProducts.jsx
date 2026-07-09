import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { COLLECTION_PRODUCTS } from '../../data/collection_data';

const SUBCATEGORIES = {
  Jewelry: ['Brass Set', 'Beaded Set', 'Bone Set', 'Shell Set'],
  Accessories: ['Bags', 'Musical Art'],
  Textiles: ['Textile'],
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    subcategory: '',
    tag: '',
    description: '',
    material: '',
    artisan: '',
    featured: false
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(prods);
    setLoading(false);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const productData = {
        ...form,
        price: Number(form.price),
        featured: Boolean(form.featured)
      };

      if (imageUrl) {
        productData.image = imageUrl;
      } else if (!editingId) {
        productData.image = '/images/Products/brass-africa-set.jpeg'; // fallback
      }
      
      if (!editingId) {
        productData.currency = 'KSh';
        await addDoc(collection(db, 'products'), productData);
      } else {
        await updateDoc(doc(db, 'products', editingId), productData);
      }

      setForm({
        name: '',
        price: '',
        category: '',
        subcategory: '',
        tag: '',
        description: '',
        material: '',
        artisan: '',
        featured: false
      });
      setImageFile(null);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const startEdit = (product) => {
    setForm({
      name: product.name || '',
      price: product.price || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      tag: product.tag || '',
      description: product.description || '',
      material: product.material || '',
      artisan: product.artisan || '',
      featured: product.featured || false
    });
    setEditingId(product.id);
    setImageFile(null);
    window.scrollTo(0, 0);
  };

  const cancelEdit = () => {
    setForm({
      name: '',
      price: '',
      category: '',
      subcategory: '',
      tag: '',
      description: '',
      material: '',
      artisan: '',
      featured: false
    });
    setEditingId(null);
    setImageFile(null);
  };

  const handleImportCollection = async () => {
    if (!window.confirm("This will upload all collection items to your Firestore database. Continue?")) return;
    setUploading(true);
    try {
      for (const p of COLLECTION_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          name: p.name,
          price: p.price,
          currency: p.currency,
          category: p.category,
          subcategory: p.subcategory || '',
          tag: p.tag || '',
          featured: p.featured || false,
          image: p.image,
          images: p.images || [p.image],
          description: p.description,
          material: p.material || '',
          artisan: p.artisan || ''
        });
      }
      alert('Collection imported successfully!');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to import collection. Ensure your Firebase keys are valid in .env');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => {
    const nameMatch = p.name ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const catMatch = p.category ? p.category.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = nameMatch || catMatch;
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) return <div>Loading...</div>;

  const currentSubcategories = SUBCATEGORIES[form.category] || [];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Manage Products</h1>
        <button onClick={handleImportCollection} className="btn btn-outline" disabled={uploading}>
          {uploading ? 'Importing...' : 'Import Collection'}
        </button>
      </div>

      <div className="admin-card">
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form className="admin-form" onSubmit={handleSubmitProduct}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Price (KSh)</label>
              <input type="number" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value, subcategory: ''})}>
                <option value="">Select...</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Textiles">Textiles</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="form-group">
              <label>Subcategory</label>
              <select required value={form.subcategory} onChange={e=>setForm({...form,subcategory:e.target.value})}>
                <option value="">Select subcategory...</option>
                {currentSubcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Tag (e.g. Handwoven, African)</label>
              <input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Material</label>
              <input value={form.material} onChange={e=>setForm({...form,material:e.target.value})}/>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Artisan</label>
              <input value={form.artisan} onChange={e=>setForm({...form,artisan:e.target.value})}/>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.8rem' }}>
              <input 
                type="checkbox" 
                id="featured" 
                checked={form.featured} 
                onChange={e=>setForm({...form,featured:e.target.checked})}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <label htmlFor="featured" style={{ cursor: 'pointer', marginBottom: 0 }}>Featured (Homepage Carousel)</label>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          </div>

          <div className="form-group">
            <label>Image {editingId && '(Leave empty to keep current)'}</label>
            <input type="file" onChange={e=>setImageFile(e.target.files[0])}/>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-gold" disabled={uploading}>
              {uploading ? 'Processing...' : (editingId ? 'Update Product' : 'Add Product')}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={cancelEdit} disabled={uploading}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-filters" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.6rem 0.8rem',
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--cream)',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '0.6rem 0.8rem',
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--cream)',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span style={{ color: 'var(--sand)', fontSize: '0.85rem' }}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Subcategory</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td><img src={p.image} alt={p.name} style={{width:'40px',height:'40px',objectFit:'cover',borderRadius:'4px'}} /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.subcategory || '—'}</td>
                <td>{p.price}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{padding:'0.4rem 1rem'}} onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-outline" style={{padding:'0.4rem 1rem'}} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length===0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
