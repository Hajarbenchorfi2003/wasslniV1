"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import Link from "next/link";

const ProfileInfo = () => {
  // Get user from localStorage
  const getUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') return null;
      return JSON.parse(userStr);
    } catch (err) {
      console.error('Failed to parse user:', err);
      return null;
    }
  };

  const user = getUser();
  
  const getHrefBasedOnRole = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case "admin":
        return "/admin/";
      case "super_admin":
        return "/super-admin/";
      case "parent":
        return "/parent/";
      case "responsible":
        return "/manager/";
      case "driver":
        return "/driver/";
      default:
        return "/";
    }
  };

  const href = getHrefBasedOnRole();
  const profile = `${href}/profile`;
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to home page
  };

  const getInitials = () => {
    return user?.fullname 
      ? user.fullname.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'US';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <Avatar>
            <AvatarFallback>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium text-default-800 capitalize">
              {user?.fullname || "User"}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {[
            {
              name: "profile",
              icon: "heroicons:user",
              href:  profile,
            },
            {
              name: "Billing",
              icon: "heroicons:megaphone",
              href: href
            },
          ].map((item, index) => (
            <Link
              href={item.href}
              key={`info-menu-${index}`}
              className="cursor-pointer"
            >
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                <Icon icon={item.icon} className="w-4 h-4" />
                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={logout}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;