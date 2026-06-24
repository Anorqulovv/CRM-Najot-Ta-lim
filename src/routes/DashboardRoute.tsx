import { Route, Routes } from "react-router-dom";
import { PATH } from "../components";
import { lazy, Suspense, useContext, useMemo } from "react";
import { Context } from "../context/Context";
import { GetMe } from "../service";
import { useCookies } from "react-cookie";
import { Header, Sitebar } from "../modules";
import { Spin } from "antd";

const DashboardHome = lazy(() => import("../pages/Dashboard/Home"));
const Stacks = lazy(() => import("../pages/Dashboard/Stacks/Stacks"));
const StacksCrud = lazy(() => import("../pages/Dashboard/Stacks/StacksCrud"));
const StacksMore = lazy(() => import("../pages/Dashboard/Stacks/StacksMore"));
const Groups = lazy(() => import("../pages/Dashboard/Groups/Groups"));
const GroupsCrud = lazy(() => import("../pages/Dashboard/Groups/GroupsCrud"));
const GroupsMore = lazy(() => import("../pages/Dashboard/Groups/GroupsMore"));
const Teachers = lazy(() => import("../pages/Dashboard/Teachers/Teachers"));
const TeachersCrud = lazy(() => import("../pages/Dashboard/Teachers/TeachersCrud"));
const TeachersMore = lazy(() => import("../pages/Dashboard/Teachers/TeachersMore"));
const Students = lazy(() => import("../pages/Dashboard/Students/Students"));
const StudentCrud = lazy(() => import("../pages/Dashboard/Students/StudentCrud"));
const StudentMore = lazy(() => import("../pages/Dashboard/Students/StudentMore"));
const StudentsParents = lazy(() => import("../pages/Dashboard/Students/StudentsParents"));
const Tests = lazy(() => import("../pages/Dashboard/Tests/Tests"));
const TestsCrud = lazy(() => import("../pages/Dashboard/Tests/TestsCrud"));
const TestsMore = lazy(() => import("../pages/Dashboard/Tests/TestsMore"));
const TestsTake = lazy(() => import("../pages/Dashboard/Tests/TestsTake"));
const Support = lazy(() => import("../pages/Dashboard/Support/Support"));
const SupportCrud = lazy(() => import("../pages/Dashboard/Support/SupportCrud"));
const SupportMore = lazy(() => import("../pages/Dashboard/Support/SupportMore"));
const Notifications = lazy(() => import("../pages/Dashboard/Notifications/Notifications"));
const AttendancePage = lazy(() => import("../pages/Dashboard/Attendance/Attendance"));
const NotFound = lazy(() => import("../pages/NotFound"));

const Users = lazy(() => import("../pages/Dashboard/Users/Users"));
const UsersMore = lazy(() => import("../pages/Dashboard/Users/UsersMore"));
const UserCrud = lazy(() => import("../pages/Dashboard/Users/UsersCrud"));

const Branches = lazy(() => import("../pages/Dashboard/Branches/Branches"));
const BranchesCrud = lazy(() => import("../pages/Dashboard/Branches/BranchesCrud"));
const BranchesMore = lazy(() => import("../pages/Dashboard/Branches/BranchesMore"));
const Profile = lazy(() => import("../pages/Dashboard/Profile/Profile"));
const ParentResults = lazy(() => import("../pages/Dashboard/ParentResults/ParentResults"));
const Activity = lazy(() => import("../pages/Dashboard/Activity/Activity"));

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
  { id: 32, path: PATH.groupsCreateByDirections, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 35, path: PATH.studentCreateByDirections, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 34, path: PATH.groupsUpdateMoreByDirections, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 33, path: PATH.groupsMoreByDirections, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 4, path: PATH.directionsMore, element: <StacksMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  // Groups
  { id: 8, path: PATH.groupsCreate, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 9, path: PATH.groupsUpdate, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 36, path: PATH.studentCreateByGroups, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 6, path: PATH.groups, element: <Groups title="Guruhlar" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT] },
  { id: 7, path: PATH.groupsMore, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT] },

  // Teachers
  { id: 12, path: PATH.teachersCreate, element: <TeachersCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 13, path: PATH.teachersUpdate, element: <TeachersCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 37, path: PATH.groupsCreateByTeachers, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 41, path: PATH.groupsMoreUpdateByTeachers, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 39, path: PATH.studentsCreateByTeachers, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 40, path: PATH.groupsMoreByTeachers, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 10, path: PATH.teachers, element: <Teachers title="Ustozlar" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPPORT] },
  { id: 11, path: PATH.teachersMore, element: <TeachersMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPPORT] },

  // Students
  { id: 16, path: PATH.studentsCreate, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 17, path: PATH.studentsUpdate, element: <StudentCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
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
  { id: 38, path: PATH.groupCreateBySupportTeacher, element: <GroupsCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 42, path: PATH.groupMoreBySupportTeacher, element: <GroupsMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 23, path: PATH.support, element: <Support title="Support" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 25, path: PATH.supportMore, element: <SupportMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  // Notifications
  { id: 27, path: PATH.notifications, element: <Notifications />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  // Attendance — ustoz ham yo'qlama qila oladi, support ko'ra oladi
  { id: 31, path: PATH.attendance, element: <AttendancePage title="Davomat" />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPPORT, ROLES.STUDENT] },

  // Activity (faqat Superadmin)
  { id: 90, path: PATH.activity, element: <Activity />, roles: [ROLES.SUPERADMIN] },

  // Users (faqat Superadmin)
  { id: 102, path: PATH.usersCreate, element: <UserCrud />, roles: [ROLES.SUPERADMIN] },
  { id: 103, path: PATH.usersUpdate, element: <UserCrud />, roles: [ROLES.SUPERADMIN] },
  { id: 100, path: PATH.users, element: <Users />, roles: [ROLES.SUPERADMIN] },
  { id: 101, path: PATH.usersMore, element: <UsersMore />, roles: [ROLES.SUPERADMIN] },

  // Branches (Filiallar) - SUPERADMIN boshqaradi, ADMIN/TEACHER/SUPPORT ko'ra oladi
  { id: 300, path: PATH.branches, element: <Branches />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 301, path: PATH.branchesCreate, element: <BranchesCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 302, path: PATH.branchesUpdate, element: <BranchesCrud />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { id: 303, path: PATH.branchesMore, element: <BranchesMore />, roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },

  { id: 200, path: PATH.profile, element: <Profile />, roles: Object.values(ROLES) },
  { id: 201, path: PATH.parentResults, element: <ParentResults />, roles: [ROLES.PARENT] },
  { id: 999, path: PATH.notFound, element: <NotFound />, roles: Object.values(ROLES) },
];

const DashboardRoute = () => {
  const [cookies] = useCookies(["accessToken"]);
  const { collapse, setCollapse } = useContext(Context);
  const { data: userInfo = {} } = GetMe(cookies.accessToken);

  const routeList = useMemo(() => {
    if (!userInfo?.role) return [];
    return ALL_ROUTES.filter((route) => route.roles.includes(userInfo.role));
  }, [userInfo?.role]);

  return (
    <div className="crm-layout">
      {collapse && <div className="crm-mobile-overlay" onClick={() => setCollapse(false)} />}
      <Sitebar />
      <div className="crm-main">
        <Header />
        <main className="crm-content">
          <Suspense
            fallback={
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              {routeList.map((item) => (
                <Route key={item.id} path={item.path} element={item.element} />
              ))}
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardRoute;
