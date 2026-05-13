import { Route, Routes } from "react-router-dom";
import { PATH } from "../components";
import {
  DashboardHome, Groups, GroupsCrud, GroupsMore,
  NotFound, Stacks, StacksCrud, StacksMore,
  Students, Teachers, Tests, TestsCrud, TestsMore,
  TestsTake, Support, SupportCrud, SupportMore,
  Notifications, AttendancePage,
} from "../pages";

import TeachersMore from "../pages/Dashboard/Teachers/TeachersMore";
import TeachersCrud from "../pages/Dashboard/Teachers/TeachersCrud";
import StudentCrud from "../pages/Dashboard/Students/StudentCrud";
import StudentMore from "../pages/Dashboard/Students/StudentMore";
import StudentsParents from "../pages/Dashboard/Students/StudentsParents";

import Users from "../pages/Dashboard/Users/Users";
import UsersMore from "../pages/Dashboard/Users/UsersMore";
import UserCrud from "../pages/Dashboard/Users/UsersCrud";

import { Header, Sitebar } from "../modules";
import Branches from "../pages/Dashboard/Branches/Branches";
import BranchesCrud from "../pages/Dashboard/Branches/BranchesCrud";
import Profile from "../pages/Dashboard/Profile/Profile";
import ParentResults from "../pages/Dashboard/ParentResults/ParentResults";
import { useContext, useMemo } from "react";
import { Context } from "../context/Context";
import { GetMe } from "../service";
import { useCookies } from "react-cookie";

const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  SUPPORT: "SUPPORT",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
};

const ALL_ROUTES = [
  { id: 1, path: PATH.home, element: <DashboardHome />, roles: Object.values(ROLES) },

  // Directions
  { id: 3, path: PATH.directionsCreate, element: <StacksCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 5, path: PATH.directionsUpdate, element: <StacksCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 2, path: PATH.directions, element: <Stacks />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 32, path: PATH.groupsCreateByDirections, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 35, path: PATH.studentCreateByDirections, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 34, path: PATH.groupsUpdateMoreByDirections, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 33, path: PATH.groupsMoreByDirections, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 4, path: PATH.directionsMore, element: <StacksMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  // Groups
  { id: 8, path: PATH.groupsCreate, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 9, path: PATH.groupsUpdate, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 36, path: PATH.studentCreateByGroups, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 6, path: PATH.groups, element: <Groups title="Guruhlar" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT] },
  { id: 7, path: PATH.groupsMore, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT] },

  // Teachers
  { id: 12, path: PATH.teachersCreate, element: <TeachersCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 13, path: PATH.teachersUpdate, element: <TeachersCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 37, path: PATH.groupsCreateByTeachers, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 41, path: PATH.groupsMoreUpdateByTeachers, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 39, path: PATH.studentsCreateByTeachers, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 40, path: PATH.groupsMoreByTeachers, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 10, path: PATH.teachers, element: <Teachers title="Ustozlar" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPPORT] },
  { id: 11, path: PATH.teachersMore, element: <TeachersMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPPORT] },

  // Students
  { id: 16, path: PATH.studentsCreate, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 17, path: PATH.studentsUpdate, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 43, path: PATH.studentsParents, element: <StudentsParents />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPPORT] },
  { id: 14, path: PATH.students, element: <Students />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT] },
  { id: 15, path: PATH.studentsMore, element: <StudentMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT] },

  // Tests
  { id: 19, path: PATH.testsCreate, element: <TestsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 21, path: PATH.testsUpdate, element: <TestsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 22, path: PATH.testsTake, element: <TestsTake />, roles: [ROLES.STUDENT] },
  { id: 18, path: PATH.tests, element: <Tests title="Testlar" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT, ROLES.STUDENT] },
  { id: 20, path: PATH.testsMore, element: <TestsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT, ROLES.STUDENT] },

  // Support (faqat SUPERADMIN va ADMIN boshqaradi)
  { id: 24, path: PATH.supportCreate, element: <SupportCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 26, path: PATH.supportUpdate, element: <SupportCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 38, path: PATH.groupCreateBySupportTeacher, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
  { id: 42, path: PATH.groupMoreBySupportTeacher, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 23, path: PATH.support, element: <Support title="Support" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 25, path: PATH.supportMore, element: <SupportMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  // Notifications
  { id: 27, path: PATH.notifications, element: <Notifications />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  // Attendance — ustoz ham yo'qlama qila oladi, support ko'ra oladi
  { id: 31, path: PATH.attendance, element: <AttendancePage title="Davomat" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT, ROLES.STUDENT] },

  // Users (faqat Superadmin)
  { id: 102, path: PATH.usersCreate, element: <UserCrud />, roles: [ROLES.SUPERADMIN] },
  { id: 103, path: PATH.usersUpdate, element: <UserCrud />, roles: [ROLES.SUPERADMIN] },
  { id: 100, path: PATH.users, element: <Users />, roles: [ROLES.SUPERADMIN] },
  { id: 101, path: PATH.usersMore, element: <UsersMore />, roles: [ROLES.SUPERADMIN] },

  // Branches (Filiallar) - SUPERADMIN boshqaradi, ADMIN/TEACHER/SUPPORT ko'ra oladi
  { id: 300, path: PATH.branches, element: <Branches />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 301, path: PATH.branchesCreate, element: <BranchesCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 302, path: PATH.branchesUpdate, element: <BranchesCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  { id: 200, path: PATH.profile, element: <Profile />, roles: Object.values(ROLES) },
  { id: 201, path: PATH.parentResults, element: <ParentResults />, roles: [ROLES.PARENT] },
  { id: 999, path: PATH.notFound, element: <NotFound />, roles: Object.values(ROLES) },
];

const DashboardRoute = () => {
  const [cookies] = useCookies(["accessToken"]);
  const { collapse } = useContext(Context);
  const { data: userInfo = {} } = GetMe(cookies.accessToken);

  const routeList = useMemo(() => {
    if (!userInfo?.role) return [];
    return ALL_ROUTES.filter((route) => route.roles.includes(userInfo.role));
  }, [userInfo?.role]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#1e2128" }}>
      <Sitebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <Header />
        <main style={{ flex: 1, overflowY: "auto", background: "#f2ede7" }}>
          <Routes>
            {routeList.map((item) => (
              <Route key={item.id} path={item.path} element={item.element} />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardRoute;
