import { Select } from "antd";
import { type Dispatch, type FC, type SetStateAction } from "react";
import { GetAll } from "../service";
import { useCookies } from "react-cookie";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface SelectType {
    extraClass?: string;
    value: number | null;
    setValue: Dispatch<SetStateAction<number | null>>;
    queryKey: string;
    URL: "/directions" | "/teachers" | "/students" | "/groups" | "/users" | "/supports" | "/branches";
    placeholder: string;
    disabled?: boolean;
    params?: any;
    transformData?: (data: any[]) => { value: number; label: string }[];
}

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

    const handleChange = (e: number) => {
        setValue(e);
    };

    const { data = [] } = GetAll(queryKey, [params], cookies.accessToken, URL, params);

    const filteredData = (() => {
        if (URL === "/groups") {
            if (isSupport) return data.filter((g: any) => g.supportId === currentUser?.id);
            if (isTeacher) return data.filter((g: any) => g.teacherId === currentUser?.id);
        }
        if (URL === "/students") {
            if (isSupport) return data.filter((s: any) => s.group?.supportId === currentUser?.id);
            if (isTeacher) return data.filter((s: any) => s.group?.teacherId === currentUser?.id);
        }
        return data;
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
                value: item.id,
                label: label || "Noma'lum",
            };
        });

    return (
        <Select
            disabled={disabled}
            value={value}
            onChange={handleChange}
            className={extraClass}
            style={{ width: '290px' }}
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