"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import lightImage from "@/public/images/error/light-403.png";
import darkImage from "@/public/images/error/dark-403.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";

const ErrorPage = () => {
  const { theme } = useTheme();
  const [href, setHref] = useState("/");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') return;

      const parsedUser = JSON.parse(userStr);
      const role = parsedUser?.role?.toLowerCase();

      let redirectHref = '/';
      switch (role) {
        case 'admin':
          redirectHref = '/admin';
          break;
        case 'super_admin':
          redirectHref = '/super-admin';
          break;
        case 'parent':
          redirectHref = '/parent';
          break;
        case 'responsible':
          redirectHref = '/manager';
          break;
        case 'driver':
          redirectHref = '/driver';
          break;
        default:
          redirectHref = '/';
      }

      setHref(redirectHref);
    } catch (err) {
      console.error('Erreur lors de la récupération de l&apos;utilisateur :', err);
    }
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto flex justify-center items-center p-10">
      <div className="w-full flex flex-col items-center">
        <div className="max-w-[542px]">
          <Image
            src={theme === "dark" ? darkImage : lightImage}
            alt="Image d'erreur"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-16 text-center">
          <div className="text-xl md:text-4xl lg:text-5xl font-semibold text-default-900">
            Oups ! Vous n&apos;avez pas l&apos;autorisation .
          </div>
          <div className="mt-3 text-default-600 text-sm md:text-base">
            Il est possible que cette page ait été supprimée, renommée ou qu&apos;elle soit temporairement indisponible.
          </div>
          <Button asChild className="mt-9 md:min-w-[300px]" size="lg">
            <Link href={href}>Aller à la page d&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
