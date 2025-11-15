"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Form submission logic here
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Ad Soyad *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-posta *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Konu *
        </label>
        <input
          type="text"
          id="subject"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Mesaj *
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
      >
        {isSubmitting ? "Gönderiliyor..." : "Gönder"}
        {!isSubmitting && <Send className="w-5 h-5" />}
      </button>
    </form>
  );
}

