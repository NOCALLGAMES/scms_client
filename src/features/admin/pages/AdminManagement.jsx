import React, { useState } from "react";
import { FiPlus, FiShield, FiUser, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  useAdmins,
  useUpdateMember as useAdminUpdateUser,
} from "../../members/hooks/useMembers";
import ManagementDirectory from "../../../shared/components/common/ManagementDirectory";
import UserActionMenu from "../../../shared/components/common/UserActionMenu";
import UserActionForm from "../../../shared/components/common/UserActionForm";
import UserDetailsModal from "../../../shared/components/common/UserDetailsModal";
import UserEditModal from "../../../shared/components/common/UserEditModal";
import UserFinancialsModal from "../../../shared/components/common/UserFinancialsModal";

import { useConfirm } from "../../../contexts/ConfirmationContext";

const AdminManagement = () => {
  const navigate = useNavigate();
  const { data: users = [], isLoading, isError } = useAdmins();
  const updateUserMutation = useAdminUpdateUser();
  const confirm = useConfirm();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const handleUpdateRole = async (user, newRole) => {
    const isConfirmed = await confirm({
      title: "Confirm Role Change",
      message: `Are you sure you want to change ${user.name}'s role to ${newRole.replace(/_/g, " ")}?`,
      type: "warning",
      confirmLabel: "Change Role",
    });

    if (isConfirmed) {
      updateUserMutation.mutate({
        id: user.id,
        updateData: { role: newRole },
      });
    }
  };

  const handleUpdateStatus = async (user, newStatus) => {
    const isConfirmed = await confirm({
      title: "Change Account Status",
      message: `Are you sure you want to change ${user.name}'s status to ${newStatus}?`,
      type: "warning",
      confirmLabel: "Update Status",
    });

    if (isConfirmed) {
      updateUserMutation.mutate({
        id: user.id,
        updateData: { status: newStatus },
      });
    }
  };

  const columns = [
    {
      header: "Admin / Staff",
      accessor: "name",
      render: (user) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex flex-shrink-0 items-center justify-center text-purple-600 font-bold overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
            {user.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_SERVER_URL}/img/users/${user.profilePicture}`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="text-xl opacity-70" />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900 tracking-tight">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      render: (user) => (
        <div className="flex items-center text-sm text-gray-700 font-medium">
          <FiShield
            className={`mr-2 ${user.role === "super_admin" ? "text-red-500" : "text-blue-500"}`}
          />
          <span className="capitalize">{user.role.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (user) => (
        <span
          className={`px-3 py-1 inline-flex text-xs font-bold rounded-full capitalize shadow-sm border ${
            user.status === "active"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {user.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      render: (user) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Full Profile"
          >
            <FiUser size={18} />
          </button>
          <UserActionMenu
            user={user}
            onViewProfile={() => setViewingUser(user)}
            onEdit={() => setEditingUser(user)}
            onSuspend={() => handleUpdateStatus(user, "suspended")}
            onActivate={() => handleUpdateStatus(user, "active")}
            onMakeAdmin={() => handleUpdateRole(user, "super_admin")}
            onMakeStaff={() => handleUpdateRole(user, "staff")}
            onMakeMember={() => handleUpdateRole(user, "member")}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <ManagementDirectory
        title="Administrative Management"
        description="Manage system administrators, staff, and their access levels."
        primaryAction={{
          label: "Add Admin/Staff",
          icon: <FiPlus />,
          onClick: () => setIsAddFormOpen(true),
        }}
        data={users}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchKeys={["name", "email"]}
        emptyMessage="No administrative users found."
      />

      {isAddFormOpen && (
        <UserActionForm onClose={() => setIsAddFormOpen(false)} />
      )}

      {viewingUser && (
        <UserDetailsModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default AdminManagement;
