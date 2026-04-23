import { useState } from "react";

const AdminNews = () => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    date: ""
  });

  const [image, setImage] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    if (image) data.append("image", image);

    await fetch("http://localhost:5000/api/news", {
      method: "POST",
      body: data
    });

    alert("News Added!");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Add News</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input name="title" placeholder="Title" onChange={handleChange} className="w-full p-2 border" />
        <textarea name="content" placeholder="Content" onChange={handleChange} className="w-full p-2 border" />
        <input name="excerpt" placeholder="Excerpt" onChange={handleChange} className="w-full p-2 border" />
        <input name="category" placeholder="Category" onChange={handleChange} className="w-full p-2 border" />
        <input type="date" name="date" onChange={handleChange} className="w-full p-2 border" />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button className="bg-green-700 text-white px-4 py-2">
          Add News
        </button>
      </form>
    </div>
  );
};

export default AdminNews;