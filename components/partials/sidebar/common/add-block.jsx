"use client";
import React from "react";
import { cn } from "@/lib/utils";

import { Icon } from "@iconify/react";
import Image from "next/image";
import thumbnail from "@/public/images/all-img/bus.png";

const AddBlock = ({
  className,
  image = thumbnail,
  title = "Suivi des présences",
  desc = "Vous pouvez désormais suivre en temps réel la présence de votre enfant dans le bus scolaire grâce à Wasslni.",
}) => {
  return (
    <div
      className={cn(
        "bg-primary dark:bg-default-400 text-primary-foreground pt-5 pb-4 px-4 rounded m-3 hidden xl:block",
        className
      )}
    >
      <div className="text-base font-semibold text-primary-foreground">
        {title}
      </div>
      <div className="text-sm text-primary-foreground">{desc}</div>
      <div className="mt-4 relative">
        <Image src={image} alt="illustration wasslni" className="w-full h-full" />
      </div>
    </div>
  );
};

export default AddBlock;
