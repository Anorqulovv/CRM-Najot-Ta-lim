import { Select } from "antd";
import { type FC } from "react";
import { GetAll } from "../service";
import { useCookies } from "react-cookie";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface SelectType {
    extraClass?: string;
    value: number | null;
    setValue: (value: any, option?: any) => void;
    queryKey: string;
    URL: "/directions" | "/teachers" | "/students" | "/groups" | "/users" | "/supports" | "/branches";
    placeholder: string;
    disabled?: boolean;
    params?: any;
    transformData?: (data: any[]) => { value: number; label: string }[];
}

const hasDirection = (item: any, directionId?: number | string | null) => {
    if (!directionId) return true;

    const id = Number(directionId);

    if (Number(item.directionId) === id) return true;

    if (Array.isArray(item.directionIds)) {
        return item.directionIds.map(Number).includes(id);
    }

    if (Array.isArray(item.directions)) {
        return item.directions.some((d: any) => Number(d?.id ?? d) === id);
    }

    return false;
};

const CustomSelect: FC<SelectType> = ({
    extraClass,
    setValue,
    value,
    queryKey,
    URL,
    placeholder,
    disabled,
    params,
    transformData,
}) => {
    const [cookies] = useCookies(["accessToken"]);
    const currentUser = useCurrentUser();

    const isSupport = currentUser?.role === "SUPPORT";
    const isTeacher = currentUser?.role === "TEACHER";

    const directionId = params?.directionId ? Number(params.directionId) : null;

    /*
      Muhim:
      /teachers va /supports uchun backendga directionId yubormaymiz.
      Chunki ko'p yo'nalishli ustoz/supportlarda backend faqat directionId ni tekshirsa,
      2-yo'nalishdagi odamlar selectda chiqmay qoladi.
      Hamma ro'yxatni olib, frontendda directionId yoki directionIds bo'yicha filter qilamiz.
    */
    const requestParams =
        URL === "/teachers" || URL === "/supports"
            ? { ...params, directionId: undefined }
            : params;

    const { data = [] } = GetAll(
        queryKey,
        [requestParams, directionId],
        cookies.accessToken,
        URL,
        requestParams
    );

    const filteredData = (() => {
        let list = data;

        if ((URL === "/teachers" || URL === "/supports") && directionId) {
            list = list.filter((item: any) => hasDirection(item, directionId));
        }

        if (URL === "/groups") {
            if (isSupport) return list.filter((g: any) => Number(g.supportId) === Number(currentUser?.id));
            if (isTeacher) return list.filter((g: any) => Number(g.teacherId) === Number(currentUser?.id));
        }

        if (URL === "/students") {
            if (isSupport) return list.filter((s: any) => Number(s.group?.supportId) === Number(currentUser?.id));
            if (isTeacher) return list.filter((s: any) => Number(s.group?.teacherId) === Number(currentUser?.id));
        }

        return list;
    })();

    const list = transformData
        ? transformData(filteredData)
        : filteredData.map((item: any) => {
            let label = item.name;

            if (URL === "/teachers" || URL === "/students" || URL === "/users" || URL === "/supports") {
                if (item.fullName) {
                    label = item.fullName;
                } else if (item.firstName || item.lastName) {
                    label = `${item.firstName || ""} ${item.lastName || ""}`.trim();
                } else {
                    label = "Noma'lum";
                }
            }

            return {
                ...item,
                value: item.id,
                label: label || "Noma'lum",
            };
        });

    return (
        <Select
            disabled={disabled}
            value={value}
            onChange={(val, option) => setValue(val, option)}
            className={extraClass}
            style={{ width: "290px" }}
            allowClear
            size="large"
            showSearch
            optionFilterProp="label"
            placeholder={placeholder}
            options={list}
        />
    );
};

export default CustomSelect;
