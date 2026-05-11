import { PlusCircleOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useNavigate } from "react-router-dom"

const Caption = ({
    title,
    count,
    extraclass,
    hideCreate  // ← yangi prop
}: {
    title: string
    count: number
    extraclass?: string
    hideCreate?: boolean  // ← yangi prop type
}) => {
    const navigate = useNavigate()
    return (
        <div className="flex items-center justify-between mb-5">
            <div>
                <h1 className="font-bold text-[25px]">{title ?? ""}</h1>
                <span className="">Jami {title?.toLowerCase()} ({count ?? 0})</span>
            </div>
            {!hideCreate && (  // ← shart qo'shildi
                <Button
                    onClick={() => navigate('create')}
                    className={`${extraclass} bg-[#8f5c28]!`}
                    icon={<PlusCircleOutlined />}
                    size="large"
                    type="primary"
                >
                     Yaratish
                </Button>
            )}
        </div>
    )
}

export default Caption