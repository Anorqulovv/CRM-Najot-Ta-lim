const PATH = {
  home: "/",
  login: "/login",

  // Directions / Stacks
  directions: "/directions",
  directionsCreate: "/directions/create",
  directionsMore: "/directions/:id",
  directionsUpdate: "/directions/:id/update",

  // Groups
  groups: "/groups",
  groupsMore: "/groups/:groupId",
  groupsCreate: "/groups/create",
  groupsUpdate: "/groups/:groupId/update",
  groupsCreateByDirections: "/directions/:id/create",
  groupsMoreByDirections: "/directions/:id/:groupId",
  groupsUpdateMoreByDirections: "/directions/:id/:groupId/update",
  groupsCreateByTeachers: "/teachers/:teacherId/create",
  groupsMoreByTeachers: "/teachers/:teacherId/:groupId",               // TO'G'RILANDI
  groupsMoreUpdateByTeachers: "/teachers/:teacherId/:groupId/update",  // TO'G'RILANDI
  groupCreateBySupportTeacher: "/support/:supportId/create",
  groupMoreBySupportTeacher: "/support/:supportId/:groupId",           // TO'G'RILANDI (avval /create edi)

  // Teachers
  teachers: "/teachers",
  teachersMore: "/teachers/:teacherId",
  teachersCreate: "/teachers/create",
  teachersUpdate: "/teachers/:teacherId/update",

  // Students
  students: "/students",
  studentsMore: "/students/:studentId",
  studentsCreate: "/students/create",
  studentsUpdate: "/students/:studentId/update",
  studentsParents: "/students/parents",
  studentsCreateByTeachers: "/teachers/:teacherId/:groupId/create",
  studentCreateByDirections: "/directions/:id/:groupId/create",
  studentCreateByGroups: "/groups/:groupId/create",

  // Tests
  tests: "/tests",
  testsCreate: "/tests/create",
  testsUpdate: "/tests/:testId/update",
  testsMore: "/tests/:testId",
  testsTake: "/tests/:testId/take",

  // Support
  support: "/support",
  supportCreate: "/support/create",
  supportMore: "/support/:supportId",
  supportUpdate: "/support/:supportId/update",

  // Notifications
  notifications: "/notifications",

  // Attendance
  attendance: "/attendance",

  // Users (faqat Superadmin)
  users: "/users",
  usersMore: "/users/:userId",
  usersCreate: "/users/create",
  usersUpdate: "/users/:userId/update",

  // Profile
  profile: "/profile",
  parentResults: "/parent/results",

  // Branches (Filiallar)
  branches: "/branches",
  branchesCreate: "/branches/create",
  branchesMore: "/branches/:branchId",
  branchesUpdate: "/branches/:branchId/update",

  notFound: "*",
};

export default PATH;