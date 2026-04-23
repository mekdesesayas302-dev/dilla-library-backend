import { useEffect, useState } from "react";
import { Trash2, MailOpen, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);

  // ✅ FETCH DATA
  useEffect(() => {
    fetch("http://localhost:5000/api/contact")
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  // ✅ DELETE
  const deleteMessage = async (id) => {
    await fetch(`http://localhost:5000/api/contact/${id}`, {
      method: "DELETE"
    });

    setMessages(messages.filter(m => m._id !== id));
  };

  // ✅ MARK READ
  const toggleRead = async (msg) => {
    await fetch(`http://localhost:5000/api/contact/${msg._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !msg.read })
    });

    setMessages(
      messages.map(m =>
        m._id === msg._id ? { ...m, read: !m.read } : m
      )
    );
  };

  return (
    <div>
      <Navbar />

      <div className="max-w-5xl mx-auto py-10 px-4">
        <h2 className="text-3xl font-bold mb-6">Contact Messages</h2>

        {messages.length === 0 ? (
          <p>No messages</p>
        ) : (
          <div className="space-y-6">

            {messages.map(msg => (
              <Card
                key={msg._id}
                className={msg.read ? "" : "border-yellow-400 bg-yellow-50"}
              >
                <CardContent className="p-5 space-y-2">

                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{msg.name}</h3>
                      <p className="text-sm text-gray-500">{msg.email}</p>
                    </div>

                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-semibold">{msg.subject}</p>

                  <p className="text-gray-600">{msg.message}</p>

                  {/* ACTIONS */}
                  <div className="flex gap-3 pt-2">

                    <Button onClick={() => toggleRead(msg)}>
                      {msg.read ? <MailOpen /> : <Mail />}
                    </Button>

                    <Button
                      onClick={() => deleteMessage(msg._id)}
                      className="bg-red-600 text-white"
                    >
                      <Trash2 />
                    </Button>

                  </div>

                </CardContent>
              </Card>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;