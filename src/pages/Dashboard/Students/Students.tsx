import { Input } from "antd";
import { Caption, CustomSelect, CustomTable, QueryPATH } from "../../../components";
import { useState, type FC } from "react";
import { GetAll } from "../../../service";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { debounce } from "../../../hooks";

interface StudentType {
  title: string;
  stackPropId?: number | null;
  teacherPropId?: number | null; 
}

const Students: FC<StudentType> = ({ title, stackPropId, teacherPropId }) => {
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();

  const columns = [
    { title: "ID", dataIndex: "key" },
    { title: "Ismi", dataIndex: "firstName" },
    { title: "Familiyasi", dataIndex: "lastName" },
    { title: "Email", dataIndex: "email" },
    { title: "Telefon raqami", dataIndex: "phone" },
    { title: "Guruh", dataIndex: "groupName" },
    { title: "Batafsil", dataIndex: "action" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function returnFn(value: any) {
  value.key = value.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value.stackName = value?.stacks?.length ? value.stacks.map((s: any) => s.name) : "➖";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value.groupName = value?.groups?.length ? value.groups.map((g: any) => g.name) : "➖";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value.teacherIds = value?.groups?.length ? value.groups.map((g: any) => g.teacherId) : "➖";
}

  // Search
  const [search, setSearch] = useState<string>("");
  const name = debounce(search, 1000);

  const [stackId, setStackId] = useState<number | null>(
    stackPropId ? Number(stackPropId) : null
  );

  const [teacherId, setTeacherId] = useState<number | null>(
    teacherPropId ? Number(teacherPropId) : null
  );

  const { data: teachers = [], isPending } = GetAll(
    QueryPATH.students,
    [name, stackId, teacherId],
    cookies.token,
    "/students",
    { name, stackId, teacherId },
    navigate,
    returnFn
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

        <CustomSelect
          disabled={stackPropId ? true : false}
          placeholder="Yonalish tanlang"
          URL="/stacks"
          queryKey={QueryPATH.stacks}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setValue={(v: any) => setStackId(v ? Number(v) : null)}
          value={stackId}
        />

        <CustomSelect
          disabled={teacherPropId ? true : false}
          placeholder="Ustoz tanlang"
          URL="/teachers"
          queryKey={QueryPATH.teachers}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setValue={(v: any) => setTeacherId(v ? Number(v) : null)}
          value={teacherId}
        />
      </div>

      <CustomTable loading={isPending} columns={columns} data={teachers} />
    </div>
  );
};

export default Students;