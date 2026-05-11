import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { QueryPATH } from "../components";
import { instance } from "../hooks";
import { Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { type NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";

// ==================== GET ME ====================
export const GetMe = (token: string) => {
  return useQuery({
    queryKey: [QueryPATH.me],
    queryFn: () => instance(token).get("/auth/me"),
    select: (res) => res.data.data,
    enabled: !!token,
  });
};

// ==================== GET BY ID ====================
export const GetById = (
  id: string | undefined,
  token: string,
  queryPath: string,
  URL: string
) => {
  return useQuery({
    queryKey: [queryPath, id],
    queryFn: () => instance(token).get(`${URL}/${id}`).then((res) => res.data.data),
    enabled: !!id && !!token,
  });
};

// ==================== GET ALL ====================
// GetAll ga basePath parametr qo'shing:
export const GetAll = (
  queryKey: string,
  filterProps: any[],
  token: string,
  URL: string,
  params: any = {},
  navigate?: NavigateFunction,
  returnFn?: (item: any) => any,
  basePath?: string,   // ← YANGI PARAMETR
) => {
  return useQuery({
    queryKey: [queryKey, ...filterProps],
    queryFn: () =>
      instance(token)
        .get(URL, { params: params || {} })
        .then((res) => {
          const data = res.data.data || [];
          return navigate
            ? data.map((item: any, index: number) => {
              const mapped = returnFn ? returnFn(item) : item;
              mapped.key = index + 1;
              mapped.action = (
                <Button
                  onClick={() => navigate(basePath ? `${basePath}/${mapped.id}` : `${mapped.id}`)}
                  className="bg-[#8f5c28]!"
                  icon={<MoreOutlined />}
                  type="primary"
                  size="small"
                />
              );
              return mapped;
            })
            : data;
        }),
  });
};

// ==================== DELETE ====================
export const Delete = (
  token: string,
  URL: string,
  navigate?: NavigateFunction,
  queryClient?: QueryClient,
  queryKey?: string
) => {
  return useMutation({
    mutationFn: () => instance(token).delete(URL),
    onSuccess: () => {
      toast.success("O'chirildi!");
      if (queryClient && queryKey) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
      setTimeout(() => navigate?.(-1), 300);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join("\n") : msg ?? "Xatolik yuz berdi");
    },
  });
};

// ==================== CREATE ====================
export const Create = (
  token: string,
  URL: string,
  navigate: NavigateFunction,
  queryClient: QueryClient,
  queryKey: string
) => {
  return useMutation({
    mutationFn: (body: any) => instance(token).post(URL, body),
    onSuccess: () => {
      toast.success("Muvaffaqiyatli qo'shildi!");
      navigate(-1);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join("\n") : msg ?? "Xatolik yuz berdi");
    },
  });
};

// ==================== UPDATE ====================
export const Update = (
  token: string,
  URL: string,
  navigate: NavigateFunction,
  queryClient: QueryClient,
  queryKey1: string,
  queryKey2?: string
) => {
  return useMutation({
    mutationFn: (body: any) => instance(token).patch(URL, body),
    onSuccess: () => {
      toast.success("Muvaffaqiyatli yangilandi!");
      navigate(-1);
      queryClient.invalidateQueries({ queryKey: [queryKey1] });
      if (queryKey2) queryClient.invalidateQueries({ queryKey: [queryKey2] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join("\n") : msg ?? "Xatolik yuz berdi");
    },
  });
};

// ==================== ENROLLMENTS ====================
export const Enrollments = (
  token: string,
  URL: string,
  navigate: NavigateFunction,
  queryClient: QueryClient,
  queryKey: string,
  queryKey2?: string
) => {
  return useMutation({
    mutationFn: (body: any) => instance(token).post(URL, body),
    onSuccess: () => {
      toast.success("Muvaffaqiyatli qo'shildi!");
      navigate(-1);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (queryKey2) queryClient.invalidateQueries({ queryKey: [queryKey2] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join("\n") : msg ?? "Xatolik yuz berdi");
    },
  });
};