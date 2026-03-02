import { PlusCircleOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useNavigate } from "react-router-dom"

const Caption = ({ title, count }: { title: string, count: number }) => {
    const navigate = useNavigate()
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-bold text-[25px]">{title ?? ""}</h1>
                <span className="">{title?.toLowerCase()} ({count ?? 0})</span>
            </div>
            <Button onClick={() => navigate('create')} className="bg-[#8f5c28]!" icon={<PlusCircleOutlined />} size="large" type="primary">Yaratish</Button>
        </div>
    )
}

export default Caption