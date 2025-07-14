import React from "react";
import { SiteLogo } from "@/components/svg";
import Link from "next/link";
 // Get user from localStorage


const horizontalHeader = () => {
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
        return "/admin/notfications";
      case "super_admin":
        return "/super-admin/notifications";
      case "parent":
        return "/parent/notifications";
      case "responsible":
        return "/manager/incidents-notifications";
      case "driver":
        return "/driver/notifications";
      default:
        return "/";
    }
  };
  
  const href = getHrefBasedOnRole();
  return (
      <div className="flex items-center lg:gap-12 gap-3 ">
        <div>
          <Link
            href={href}
            className=" text-primary flex items-center gap-2"
          >
            <SiteLogo className="h-7 w-7" />
            <span className=" text-xl font-semibold lg:inline-block hidden">
              {" "}
              Wasslni
            </span>
          </Link>
        </div>
      </div>
  );
};

export default horizontalHeader;
