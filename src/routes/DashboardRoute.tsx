import { Route, Routes } from "react-router-dom"
import { PATH } from "../components"
import { DashboardHome, Groups, GroupsCrud, GroupsMore, NotFound, Rooms, Stacks, StacksCrud, StacksMore, Students, Teachers, Users } from "../pages"
import { Header, Sitebar } from "../modules"
import { useContext, useEffect, useState } from "react"
import { Context } from "../context/Context"
import { GetMe } from "../service"
import { useCookies } from "react-cookie"
import TeachersMore from "../pages/Dashboard/Teachers/TeachersMore"
import TeachersCrud from "../pages/Dashboard/Teachers/TeachersCrud"
import StudentCrud from "../pages/Dashboard/Students/StudentCrud"
import StudentMore from "../pages/Dashboard/Students/StudentMore"
import RoomsCrud from "../pages/Dashboard/Rooms/RoomsCrud"

const DashboardRoute = () => {
    const [cookies] = useCookies(['token'])
    const {collapse} = useContext(Context)
    const {data:userInfo = {}} = GetMe(cookies.token) 
    const [routeList, setRouteList] = useState([
        { id: 1, path: PATH.home, element: <DashboardHome /> },

        { id: 2, path: PATH.stacks, element: <Stacks /> },
        { id: 3, path: PATH.stacksCreate, element: <StacksCrud /> },
        { id: 4, path: PATH.stacksMore, element: <StacksMore /> },
        { id: 5, path: PATH.stacksUpdate, element: <StacksCrud /> },
        { id: 6, path: PATH.stacksStudentCreate, element: <StudentCrud/> },

        { id: 7, path: PATH.groups, element: <Groups title={"Guruxlar"}/> },
        { id: 8, path: PATH.groupsMore, element: <GroupsMore/> },
        { id: 9, path: PATH.groupsCreate, element: <GroupsCrud/> },
        { id: 10, path: PATH.groupsUpdate, element: <GroupsCrud/> },
        { id: 11, path: PATH.stacksGroupCreate, element: <GroupsCrud /> },
        { id: 12, path: PATH.stacksMoreByGroupMore, element: <GroupsMore/> },
        { id: 13, path: PATH.groupStudentCreate, element: <StudentCrud /> },
        { id: 14, path: PATH.stacksStudentCreate, element: <StudentCrud/> },

        { id: 15, path: PATH.teachers, element: <Teachers title="Ustozlar" /> },
        { id: 16, path: PATH.teachersMore, element: <TeachersMore /> },
        { id: 17, path: PATH.teachersUpdate, element: <TeachersCrud /> },
        { id: 18, path: PATH.teachersCreate, element: <TeachersCrud /> },
        { id: 19, path: PATH.teachersGroupCreate, element: <GroupsCrud /> },
        { id: 20, path: PATH.teachersGroupMore, element: <GroupsMore /> },
        { id: 21, path: PATH.teachersGroupUpdate, element: <GroupsCrud /> },
        { id: 22, path: PATH.teacherStudentCreate, element: <StudentCrud /> },

        { id: 23, path: PATH.students, element: <Students title="O'quvchilar" /> },
        { id: 24, path: PATH.studentsMore, element: <StudentMore /> },
        { id: 25, path: PATH.studentsCreate, element: <StudentCrud /> },
        { id: 26, path: PATH.studentsUpdate, element: <StudentCrud /> },

        { id: 27, path: PATH.rooms, element: <Rooms title="Xonalar" /> },
        { id: 28, path: PATH.roomsCreate, element: <RoomsCrud /> },
        { id: 29, path: PATH.roomsUpdate, element: <RoomsCrud /> },


        { id: 99, path: PATH.notFound, element: <NotFound /> },
        
    ])
    useEffect(() => {
        if(userInfo.role == "super_admin"){
            const data = { id: routeList[routeList.length - 1].id + 1, path: PATH.users, element: <Users /> }
            setRouteList(last => [...last, data])
        }
    },[userInfo])
    return (
        <div className="flex">
            <Sitebar/>
            <div className={`${collapse ? "w-full" : "w-[80%]"} duration-300 h-screen overflow-y-auto`}>
                <Header/>
                <Routes>{routeList.map(item => <Route key={item.id} path={item.path} element={item.element} />)}</Routes>
            </div>
        </div>
    )
}

export default DashboardRoute