import { useState } from "react";

const AdminEvents = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    time: "",
    location: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    alert("Event Added!");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Add Event</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input name="title" placeholder="Title" onChange={handleChange} className="w-full p-2 border" />
        <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-2 border" />
        <input type="date" name="event_date" onChange={handleChange} className="w-full p-2 border" />
        <input name="time" placeholder="Time" onChange={handleChange} className="w-full p-2 border" />
        <input name="location" placeholder="Location" onChange={handleChange} className="w-full p-2 border" />

        <button className="bg-green-700 text-white px-4 py-2">
          Add Event
        </button>
      </form>
    </div>
  );
};

export default AdminEvents;