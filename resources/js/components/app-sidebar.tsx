import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, History, Users, UserCog, KeyRound, User, Tags, Map, FileText, Folder, BookOpen } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Log Activity',
        href: '/activity-logs',
        icon: History,
    },
    {
        title: 'Users Management',
        href: '',
        icon: Users,
        children: [
            {
                title: 'Roles',
                href: '/roles',
                icon: UserCog,
            },
            {
                title: 'Permissions',
                href: '/permissions',
                icon: KeyRound,
            },
            {
                title: 'User',
                href: '/users',
                icon: User,
            },
        ],
    },
    {
        title: 'Category',
        href: '/category',
        icon: Tags,
    },
    {
        title: 'Virtual Tour',
        href: '/virtual-tour',
        icon: Map,
    },
    {
        title: 'Article',
        href: '/article',
        icon: FileText,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}