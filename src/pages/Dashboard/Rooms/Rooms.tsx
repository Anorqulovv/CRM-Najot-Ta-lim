import { Button, Input, Modal} from "antd";
import { Caption, CustomTable, QueryPATH } from "../../../components";
import { useState, type FC } from "react";
import { Delete, GetAll } from "../../../service";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { debounce } from "../../../hooks";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";

interface RoomsType {
  title: string;
}

const Rooms: FC<RoomsType> = ({ title}) => {
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [delModal, setDelModal] = useState<boolean>(false)
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const columns = [
    { title: "ID", dataIndex: "key" },
    { title: "Nomi", dataIndex: "name" },
    { title: "Sig'imi", dataIndex: "capacity" },
    { title: "Yaratilgan vaqti", dataIndex: "createdAt" },
    { title: "Yangilangan vaqti", dataIndex: "updatedAt" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { title: "Action", key: "action", render: (_: any, row: any) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/rooms/${row.id}/update`)}>Update</Button>
          <Button icon={<DeleteOutlined />} onClick={() => (setDelModal(true), setSelectedId(row.id))}>Delete</Button>
        </>
      ),
    },
  ];
  
  // Search
  const [search, setSearch] = useState<string>("");
  const name = debounce(search, 1000);

  const { data: rooms = [], isPending } = GetAll(
    QueryPATH.rooms,
    [name],
    cookies.token,
    "/rooms",
    { name },
    navigate
  );

  const deleteUrl = selectedId ? `/rooms/${selectedId}` : "";
  const { mutate: DeleteRoom, isPending: deleteLoading } = Delete(
  cookies.token,
  deleteUrl,
  undefined,
  queryClient,    
  QueryPATH.rooms  
  );

  return (
    <div className="p-5">
      <Caption title={title} count={5} />

      <div className="flex items-center gap-5 my-5">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          className="w-100!"
          size="large"
          allowClear
          placeholder="Qidirish..."
        />
      </div>

      <CustomTable loading={isPending} columns={columns} data={rooms} />
      <Modal
        confirmLoading={deleteLoading}
        onOk={() => DeleteRoom()}
        okText="O'chirish"
        cancelText="Bekor qilish"
        open={delModal}
        onCancel={() => setDelModal(false)}
        title="O'chirmoqchimisiz?"
      ></Modal>
    </div>

    
  );
};

export default Rooms;