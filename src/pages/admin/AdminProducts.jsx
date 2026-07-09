import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { PINTEREST_PRODUCTS } from '../../data/pinterest_data';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
        price: Number(form.price)
      };

      if (imageUrl) {
        productData.image = imageUrl;
      } else if (!editingId) {
        productData.image = '/images/logo.jpg';
      }
      
      if (!editingId) {
        productData.currency = 'KSh';
        productData.featured = false;
        await addDoc(collection(db, 'products'), productData);
      } else {
        await updateDoc(doc(db, 'products', editingId), productData);
      }

      setForm({ name: '', price: '', category: '', description: '' });
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
      description: product.description || ''
    });
    setEditingId(product.id);
    setImageFile(null);
    window.scrollTo(0, 0);
  };

  const cancelEdit = () => {
    setForm({ name: '', price: '', category: '', description: '' });
    setEditingId(null);
    setImageFile(null);
  };

  const handleSeed = async () => {
    if (!window.confirm("This will upload all Demo items to your database. Continue?")) return;
    setUploading(true);
    try {
      for (const p of PINTEREST_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          name: p.name,
          price: p.price,
          currency: p.currency,
          category: p.category,
          tag: p.tag,
          featured: p.featured,
          image: p.image,
          images: p.images,
          description: p.description,
          material: p.material,
          artisan: p.artisan
        });
      }
      alert('Seeded successfully!');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to seed. Ensure your Firebase keys are valid in .env');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Manage Products</h1>
        <button onClick={handleSeed} className="btn btn-outline" disabled={uploading}>
          {uploading ? 'Processing...' : 'Seed Demo Data'}
        </button>
      </div>

      <div className="admin-card">
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form className="admin-form" onSubmit={handleSubmitProduct}>
          <div className="form-group"><label>Name</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div className="form-group"><label>Price (KSh)</label><input type="number" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
          <div className="form-group"><label>Category</label>
            <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              <option value="">Select...</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Textiles">Textiles</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="form-group"><label>Description</label><textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div className="form-group"><label>Image {editingId && '(Leave empty to keep current)'}</label><input type="file" onChange={e=>setImageFile(e.target.files[0])}/></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><img src={p.image} alt={p.name} style={{width:'40px',height:'40px',objectFit:'cover',borderRadius:'4px'}} /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{padding:'0.4rem 1rem'}} onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-outline" style={{padding:'0.4rem 1rem'}} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length===0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
