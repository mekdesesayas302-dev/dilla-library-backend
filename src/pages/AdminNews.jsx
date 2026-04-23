import { useEffect, useState } from "react";

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    date: ""
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // FETCH NEWS
  const fetchNews = () => {
    fetch("http://localhost:5000/api/news")
      .then(res => res.json())
      .then(data => setNews(data));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // IMAGE PREVIEW
  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // SUBMIT (ADD / UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (image) formData.append("image", image);

    const url = editingId
      ? `http://localhost:5000/api/news/${editingId}`
      : "http://localhost:5000/api/news";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: formData
    });

    resetForm();
    fetchNews();
  };

  // EDIT
  const handleEdit = (item) => {
    setForm(item);
    setPreview(item.image);
    setEditingId(item.id);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this news?")) return;

    await fetch(`http://localhost:5000/api/news/${id}`, {
      method: "DELETE"
    });

    fetchNews();
  };

  // RESET
  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      date: ""
    });
    setImage(null);
    setPreview(null);
    setEditingId(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin News Dashboard</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border" required />
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" className="w-full p-2 border" />
        <input name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Excerpt" className="w-full p-2 border" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border" />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full p-2 border" />

        {/* IMAGE */}
        <input type="file" onChange={handleImage} />

        {/* PREVIEW */}
        {preview && (
          <img src={preview} alt="preview" className="w-40 h-40 object-cover" />
        )}

        <div className="flex gap-3">
          <button className="bg-green-700 text-white px-4 py-2">
            {editingId ? "Update News" : "Add News"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* NEWS LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {news.map(item => (
          <div key={item.id} className="border p-4 shadow">
            <img
              src={item.image}
              className="w-full h-48 object-cover mb-3"
            />

            <h2 className="font-bold text-lg">{item.title}</h2>
            <p className="text-sm text-gray-500">{item.category}</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleEdit(item)}
                className="bg-blue-600 text-white px-3 py-1"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-600 text-white px-3 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNews;