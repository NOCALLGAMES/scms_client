import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    getMembers,
    getAllUsers,
    getPendingUsers,
    getMemberProfile,
    updateMember,
    approveMember,
    rejectMember,
    adminCreateUser,
    getUserFinancials,
    getAdmins
} from "../services/memberService";

export const useMembers = (params = {}) => {
    return useQuery({
        queryKey: ["members", params],
        queryFn: () => getMembers(params),
    });
};

export const useAllUsers = (params = {}) => {
    return useQuery({
        queryKey: ["users", params],
        queryFn: () => getAllUsers(params),
    });
};

export const useMemberProfile = (id) => {
    return useQuery({
        queryKey: ["member-profile", id],
        queryFn: () => getMemberProfile(id),
        enabled: !!id,
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updateData }) => updateMember(id, updateData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["member-profile", data.id] });
            toast.success("Member updated successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Update failed");
        }
    });
};

export const useApproveMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["pending-registrations"] });
            toast.success("Member approved successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Approval failed");
        }
    });
};

export const useRejectMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }) => rejectMember(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["pending-registrations"] });
            toast.success("Registration rejected successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Rejection failed");
        }
    });
};

export const usePendingRegistrations = () => {
    return useQuery({
        queryKey: ["pending-registrations"],
        queryFn: getPendingUsers,
    });
};

export const useAdmins = () => {
    return useQuery({
        queryKey: ["admins"],
        queryFn: getAdmins,
    });
};

export const useAdminCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminCreateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User created successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Creation failed");
        }
    });
};

export const useUserFinancials = (userId) => {
    return useQuery({
        queryKey: ["user-financials", userId],
        queryFn: () => getUserFinancials(userId),
        enabled: !!userId,
    });
};
