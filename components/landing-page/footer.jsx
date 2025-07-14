"use client"
import Image from "next/image";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { Button } from "@/components/ui/button";
import footerImage from "@/public/images/landing-page/footer.png"
import facebook from "@/public/images/social/facebook-1.png"
import dribble from "@/public/images/social/dribble-1.png"
import linkedin from "@/public/images/social/linkedin-1.png"
import github from "@/public/images/social/github-1.png"
import behance from "@/public/images/social/behance-1.png"
import twitter from "@/public/images/social/twitter-1.png"
import youtube from "@/public/images/social/youtube.png"

const Footer = () => {
  const socials = [
    {
      icon: facebook,
      href: "https://www.facebook.com/Codeshaperbd/"
    },
    {
      icon: github,
      href: "https://github.com/Codeshaper-bd"
    },
    {
      icon: linkedin,
      href: "https://www.linkedin.com/company/codeshaper/"
    },
    {
      icon: youtube,
      href: "https://www.youtube.com/@codeshaper4181"
    },
    {
      icon: twitter,
      href: "https://twitter.com/codeshaperbd"
    },
    {
      icon: dribble,
      href: "https://dribbble.com/codeshaperbd"
    },
    {
      icon: behance,
      href: "https://www.behance.net/codeshaper"
    }
  ]
  return (
    <footer
      className=" bg-cover bg-center bg-no-repeat relative before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-default-900/90 dark:before:bg-default-100"
      style={{
        background: `url(${footerImage.src})`
      }}
    >
      <div className="py-16 2xl:py-[120px]">
        <div className="max-w-[700px] mx-auto flex flex-col items-center relative">
          <Link
            href="/"
            className="inline-flex items-center gap-4 text-primary-foreground"
          >
            <SiteLogo className="w-[50px] h-[52px]" />
            <span className="text-3xl font-semibold">Wasslni</span>
          </Link>
        </div>
      </div>
      <div className="relative bg-default-900 dark:bg-default-50 py-6">
        <div className="container flex flex-col text-center md:text-start md:flex-row gap-2">
          <p className="text-primary-foreground flex-1 text-base xl:text-lg font-medium">COPYRIGHT &copy; 2025 Wasslni. Tous droits réservés.</p>
          <p className="text-primary-foreground flex-none text-base font-medium">
            Hand-crafted & Made by {" "}
            <span className="text-primary hover:underline"> Khawla & Hajar Benchorfi</span>
             
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;