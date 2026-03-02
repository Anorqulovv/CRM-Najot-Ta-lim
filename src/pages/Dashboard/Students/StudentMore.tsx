import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Delete, Enrollments, GetAll, GetById } from "../../../service";
import { QueryPATH } from "../../../components";
import { Button, Modal } from "antd";
import { ArrowLeftOutlined, DeleteFilled, EditFilled, UsergroupAddOutlined } from "@ant-design/icons";

const TeachersMore = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [cookies] = useCookies(["token"]);
  const [delModal, setDelModal] = useState<boolean>(false);
  const [addGroup, setAddGroup] = useState<boolean>(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Stack Get By Id
  const { data: moreInfo = {}, isLoading } = GetById(
    studentId,
    cookies.token,
    QueryPATH.teachersMore,
    "/students",
  );
  // Stack Delete
  const { mutate: DeleteStack, isPending } = Delete(
    cookies.token,
    `/students/${studentId}`,
    navigate,
    queryClient,
    QueryPATH.students,
  );

  const { data: groups = [] } = GetAll(
    QueryPATH.groups,
    [],
    cookies.token,
    "/groups",
    {},
    navigate
  );

  const { mutate: AddGroup, isPending: isPendingEnroll } = Enrollments(
    cookies.token,
    `/enrollments`,
    navigate,
    queryClient,
    QueryPATH.students,
    QueryPATH.studentsMore
  );

  function handleAddGroup() {
    if (!studentId || !groupId) return;
    AddGroup({ studentId: Number(studentId), groupId });
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => navigate(-1)}
            type="dashed"
            icon={<ArrowLeftOutlined />}
          ></Button>
          <h2 className="font-bold text-[25px]">
            {isLoading
              ? "Loading..."
              : `${moreInfo.firstName} ${moreInfo.lastName}`}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAddGroup(true)}
            className="bg-blue-500!"
            type="primary"
            size="large"
            icon={<UsergroupAddOutlined />}
          ></Button>
          <Button
            onClick={() => setDelModal(true)}
            className="bg-red-500!"
            type="primary"
            size="large"
            icon={<DeleteFilled />}
          ></Button>
          <Button
            onClick={() => navigate("update")}
            size="large"
            type="primary"
            icon={<EditFilled />}
          >
            Tahrirlash
          </Button>
        </div>
      </div>
      <div className="flex justify-center gap-5 mt-5">
        {/* LEFT */}
        <div className="w-[50%] space-y-3 p-5 rounded-xl border border-slate-500">
          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">#ID:</span>{" "}
            <strong>{moreInfo?.id ?? "—"}</strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Ismi:</span>{" "}
            <strong>{moreInfo?.firstName ?? "—"}</strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Familiyasi:</span>{" "}
            <strong>{moreInfo?.lastName ?? "—"}</strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Rasmi:</span>{" "}
            <strong>{moreInfo?.image ? moreInfo.image : "Yo‘q"}</strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Email:</span>{" "}
            <strong>{moreInfo?.email ?? "—"}</strong>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[50%] space-y-3 p-5 rounded-xl border border-slate-500">
          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Telefon Raqami:</span>{" "}
            <strong>{moreInfo?.phone ?? "—"}</strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Ustoz:</span>{" "}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <strong>{moreInfo?.teachers?.length ? moreInfo.teachers.map((t: any) => `${t.firstName} ${t.lastName}`) : "Yo'q"} </strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Yo‘nalishi:</span>{" "}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <strong>{moreInfo?.stacks?.length ? moreInfo.stacks.map((s: any) => s.name).join(", ") : "Yo'q"} </strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Yaratilgan vaqt:</span>{" "}
            <strong>{moreInfo?.createdAt}</strong>
          </div>

          <div className="text-[18px] font-bold">
            <span className="text-[#8f5c28]">Yangilangan vaqt:</span>{" "}
            <strong>{moreInfo?.updatedAt}</strong>
          </div>
        </div>
      </div>
      <Modal
        confirmLoading={isPending}
        onOk={() => DeleteStack()}
        okText="O'chirish"
        cancelText="Bekor qilish"
        open={delModal}
        onCancel={() => setDelModal(false)}
        title="O'chirmoqchimisiz?"
      ></Modal>
      <Modal
        confirmLoading={isPendingEnroll}
        onOk={handleAddGroup}
        okText="Qo'shish"
        cancelText="Bekor qilish"
        open={addGroup}
        onCancel={() => setAddGroup(false)}
        title="Qaysi guruhga biriktiramiz?"
      >
        <div className="space-y-2">
          <div className="font-medium">Guruh tanlang:</div>
          <select className="w-full border rounded-lg p-2" value={groupId || ""} onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Tanlang</option>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default TeachersMore;
