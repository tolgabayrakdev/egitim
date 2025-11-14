import { createBrowserRouter } from "react-router"
import DashboardLayout from "@/layouts/dashboard-layout"
import DashboardIndex from "@/pages/dashboard/index"
import AccountSettings from "@/pages/dashboard/settings/account-settings"
import NotificationSettings from "@/pages/dashboard/settings/notification-settings"
import Invitations from "@/pages/dashboard/invitations"

import SignIn from "@/pages/auth/sign-in"
import SignUp from "@/pages/auth/sign-up"
import ForgotPassword from "@/pages/auth/forgot-password"
import AcceptInvitation from "@/pages/auth/accept-invitation"
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
            },
            {
                path: '/dashboard/invitations',
                element: <Invitations />
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
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/accept-invitation',
        element: <AcceptInvitation />
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