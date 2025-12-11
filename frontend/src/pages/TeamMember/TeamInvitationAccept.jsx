import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

function TeamInvitationAccept() {
  const { teamMemberId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      toast.error("You must be logged in to accept an invitation.");
      navigate("/login");
      return;
    }
    const acceptInvite = async () => {
      setLoading(true);
      try {
        await api.post("/users/team/accept", { teamMemberId });
        setAccepted(true);
        toast.success("Invitation accepted! You are now a team member.");
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to accept invitation."
        );
      } finally {
        setLoading(false);
      }
    };
    acceptInvite();
  }, [teamMemberId, currentUser, navigate]);

  if (loading) return <div className="p-8 text-center">Accepting invitation...</div>;
  if (accepted)
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Invitation Accepted!</h2>
        <p>You are now a member of the team.</p>
      </div>
    );
  return null;
}

export default TeamInvitationAccept;
