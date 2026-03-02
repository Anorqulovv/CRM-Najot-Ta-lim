import { Input } from "antd";
import { Caption, CustomSelect, CustomTable, QueryPATH } from "../../../components";
import { useState, type FC } from "react";
import { GetAll } from "../../../service";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { debounce } from "../../../hooks";

interface TeacherType {
  title: string;
  stackPropId?: number | null;
}

const Teachers: FC<TeacherType> = ({ title, stackPropId }) => {
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();

  const columns = [
    { title: "ID", dataIndex: "key" },
    { title: "Ismi", dataIndex: "firstName" },
    { title: "Familiyasi", dataIndex: "lastName" },
    { title: "Email", dataIndex: "email" },
    { title: "Telefon raqami", dataIndex: "phone" },
    { title: "Yo'nalish", dataIndex: "stackName" },
    { title: "Batafsil", dataIndex: "action" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function returnFn(value: any) {
    value.key = value.id;
    value.stackName = value?.stack?.name ?? "➖";
  }

  // Search
  const [search, setSearch] = useState<string>("");
  const name = debounce(search, 1000);

  const [stackId, setStackId] = useState<number | null>(
    stackPropId ? Number(stackPropId) : null
  );

  const { data: teachers = [], isPending } = GetAll(
    QueryPATH.teachers,
    [name, stackId],
    cookies.token,
    "/teachers",
    { name, stackId },
    navigate,
    returnFn
  );

  return (
    <div className="p-5">
      <Caption title={title} count={teachers.length} />

      <div className="flex items-center gap-5 my-5">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          className="w-100!"
          size="large"
          allowClear
          placeholder="Qidirish..."
        />

        <CustomSelect
          disabled={stackPropId ? true : false}
          placeholder="Yonalish tanlang"
          URL="/stacks"
          queryKey={QueryPATH.stacks}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setValue={(v: any) => setStackId(v ? Number(v) : null)}
          value={stackId}
        />
      </div>

      <CustomTable loading={isPending} columns={columns} data={teachers} />
    </div>
  );
};

export default Teachers;