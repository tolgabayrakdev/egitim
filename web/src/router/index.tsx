import { createBrowserRouter } from "react-router"
import DashboardLayout from "@/layouts/dashboard-layout"
import DashboardIndex from "@/pages/dashboard/index"
import AccountSettings from "@/pages/dashboard/settings/account-settings"
import NotificationSettings from "@/pages/dashboard/settings/notification-settings"


import SignIn from "@/pages/auth/sign-in"
import SignUp from "@/pages/auth/sign-up"
import ForgotPassword from "@/pages/auth/forgot-password"
import SubscriptionPage from "@/pages/subscription/index"
import PaymentPage from "@/pages/subscription/payment"

export const router = createBrowserRouter([
    {
        path: '/',
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <DashboardIndex />
            },
            {
                path: '/dashboard/settings/account',
                element: <AccountSettings />
            },
            {
                path: '/dashboard/settings/notifications',
                element: <NotificationSettings />
            }
        ]

    },
    {
        path: '/sign-in',
        element: <SignIn />
    },
    {
        path: '/sign-up',
        element: <SignUp />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/subscription',
        element: <SubscriptionPage />
    },
    {
        path: '/subscription/payment',
        element: <PaymentPage />
    }

])