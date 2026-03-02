import { Select } from "antd"
import { type Dispatch, type FC, type SetStateAction } from "react"
import { GetAll } from "../service"
import { useCookies } from "react-cookie"

interface SelectType {
    extraClass?: string,
    value: number | null,
    setValue: Dispatch<SetStateAction<number | null>>,
    queryKey: string,
    URL: "/stacks" | "/teachers" | "/students" | "/rooms" | "/groups" | "/users",
    placeholder:string,
    disabled?:boolean,
    params?:any
}

const CustomSelect: FC<SelectType> = ({ extraClass, setValue, value, queryKey, URL, placeholder, disabled, params }) => {
    const [cookies] = useCookies(['token'])
    function handleChange(e: number) {
        setValue(e)
    }
    const { data = [] } = GetAll(queryKey, [params], cookies.token, URL, params)
    const list = data ? data.map((item: any) => {
        const data = {
            value: item.id,
            label: (URL == "/students" || URL == "/teachers" || URL == "/users") ? `${item.firstName} ${item.lastName}` : item.name
        }
        return data
    }) : []
    return (
        <Select
            disabled={disabled}
            value={value}
            onChange={handleChange}
            className={`${extraClass} w-100!`}
            allowClear
            size="large"
            showSearch={{ optionFilterProp: 'label' }}
            placeholder={placeholder}
            options={list} />
    )
}

export default CustomSelect