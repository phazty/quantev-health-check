import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { User, UserRole, Invite } from "@/types/user";
import { users as seedUsers, currentUser as seedCurrentUser } from "@/data/users";

interface UserState {
  currentUser: User;
  team: User[];
  pendingInvites: Invite[];

  reassignRole: (userId: string, role: UserRole) => void;
  updateUserStatus: (userId: string, status: User["status"]) => void;
  addInvite: (invite: Invite) => void;
  removeInvite: (inviteId: string) => void;
  acceptInvite: (inviteId: string) => void;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    currentUser: seedCurrentUser,
    team: seedUsers,
    pendingInvites: [
      {
        id: "inv-001",
        email: "r.johnson@quantev.io",
        role: "operator",
        invitedBy: "Marcus Chen",
        invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "pending",
      },
    ],

    reassignRole: (userId, role) =>
      set((s) => {
        const user = s.team.find((u) => u.id === userId);
        if (user) user.role = role;
        if (s.currentUser.id === userId) s.currentUser.role = role;
      }),

    updateUserStatus: (userId, status) =>
      set((s) => {
        const user = s.team.find((u) => u.id === userId);
        if (user) user.status = status;
      }),

    addInvite: (invite) =>
      set((s) => {
        s.pendingInvites.push(invite);
      }),

    removeInvite: (inviteId) =>
      set((s) => {
        s.pendingInvites = s.pendingInvites.filter((i) => i.id !== inviteId);
      }),

    acceptInvite: (inviteId) =>
      set((s) => {
        const inv = s.pendingInvites.find((i) => i.id === inviteId);
        if (inv) inv.status = "accepted";
      }),
  }))
);
