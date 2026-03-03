const PATH = {
    home:"/",
    login:"/login",

    stacks:"/stacks",
    stacksMore:"/stacks/:stackId",
    stacksMoreByGroupMore:"/stacks/:stackId/:groupId",
    stacksMoreByGroupUpdate:"/stacks/:stackId/:groupId/update",
    stacksCreate:"/stacks/create",
    stacksUpdate:"/stacks/:stackId/update",
    stacksGroupCreate:"/stacks/:stackId/create",
    stacksStudentCreate:"/stacks/:stackId/:groupId/create",

    groups:"/groups",
    groupsMore:"/groups/:groupId",
    teachersGroupCreate:"/teachers/:teacherId/create",
    teachersGroupMore:"/teachers/:teacherId/:groupId",
    teachersGroupUpdate:"/teachers/:teacherId/:groupId/update",
    groupsUpdate:"/groups/:groupId/update",
    groupsCreate:"/groups/create",
    groupStudentCreate:"/groups/:groupId/create",

    teachers:"/teachers",
    teachersMore:"/teachers/:teacherId",
    teachersUpdate:"/teachers/:teacherId/update",
    teachersCreate:"/teachers/create",
    teacherStudentCreate:"/teachers/:teacherId/:groupId/create",

    rooms:"/rooms",
    roomsMore:"/rooms/:id",
    roomsUpdate:"/rooms/:id/update",
    roomsCreate:"/rooms/create",

    students:"/students",
    studentsMore:"/students/:studentId",
    studentsUpdate:"/students/:studentId/update",
    studentsCreate:"/students/create",
    groupStudentMore: "/groups/:groupId/:studentId",
    groupStudentUpdate: "/groups/:groupId/create",

    users:"/users",
    usersMore:"/users/:id",
    usersUpdate:"/users/:id/update",
    usersCreate:"/users/create",

    notFound:"*"
}

export default PATH