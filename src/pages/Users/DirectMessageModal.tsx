import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../context/AuthContext";

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // The talent or employer to message
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({ isOpen, onClose, user }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_URL}/contact/direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId || user.user?.id,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send direct message");
      }

      showToast("Message sent successfully!", "success");
      onClose();
      setMessage("");
      navigate("/direct-messages");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const recipientName = user?.fullName || user?.companyName || "User";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="text-xl font-bold mb-4">Direct Message to {recipientName}</h2>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Type your first message to ${recipientName}...`}
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSend} disabled={loading || !message.trim()}>
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </Modal>
  );
};
