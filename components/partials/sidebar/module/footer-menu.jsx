"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "@/components/svg";
import { getUser } from "@/utils/auth";// adapte le chemin si besoin

const FooterMenu = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
  }, []);

  const getInitials = () => {
    if (!user?.fullname) return "US";
    return user.fullname
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="space-y-5 flex flex-col items-center justify-center pb-6">
      {/* Avatar */}
      <Avatar className="w-9 h-9">
        {user?.image ? (
          <AvatarImage src={user.image} alt={user.fullname} />
        ) : (
          <AvatarFallback>{getInitials()}</AvatarFallback>
        )}
      </Avatar>
    </div>
  );
};

export default FooterMenu;
