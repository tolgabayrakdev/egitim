import { createBrowserRouter } from "react-router"
import DashboardLayout from "@/layouts/dashboard-layout"
import DashboardIndex from "@/pages/dashboard/index"
import SignIn from "@/pages/auth/sign-in"
import SignUp from "@/pages/auth/sign-up"

export const router = createBrowserRouter([
    {
        path: '/',
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <DashboardIndex />
            },
        ]

    },
    {
        path: '/sign-in',
        element: <SignIn />
    },
    {
        path: '/sign-up',
        element: <SignUp />
    }

])