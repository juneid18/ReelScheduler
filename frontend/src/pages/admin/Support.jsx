import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getSupportTickets();
      setTickets(res.data.tickets || []);
    } catch {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id) => {
    const response = prompt('Enter your response:');
    if (!response) return;
    try {
      await adminService.respondToTicket(id, response);
      toast.success('Response sent');
      fetchTickets();
    } catch {
      toast.error('Failed to respond');
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this ticket?')) return;
    try {
      await adminService.respondToTicket(id, '[Closed]');
      toast.success('Ticket closed');
      fetchTickets();
    } catch {
      toast.error('Failed to close ticket');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Support Tickets</h1>
      {loading ? (
        <div className="text-gray-500">Loading tickets...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4">No tickets found.</td></tr>
              ) : tickets.map(ticket => (
                <tr key={ticket._id} className="border-t">
                  <td className="px-4 py-2">{ticket.user?.email || 'Unknown'}</td>
                  <td className="px-4 py-2">{ticket.subject}</td>
                  <td className="px-4 py-2">{ticket.message}</td>
                  <td className="px-4 py-2">{ticket.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="text-blue-600 hover:underline" onClick={() => handleRespond(ticket._id)}>Respond</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleClose(ticket._id)}>Close</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 