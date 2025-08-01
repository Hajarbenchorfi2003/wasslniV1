"use client";
import {Fragment} from "react"
import Image from "next/image";
import { Icon } from "@iconify/react";
import background from "@/public/images/auth/line.png";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VerfiyForm from "@/components/auth/verify-form";

const VerifyPage = () => {
  const [openVideo, setOpenVideo] = useState(false);
  return (
    <Fragment>
      <div className="min-h-screen bg-card  flex items-center  overflow-hidden w-full">
        <div className="lg-inner-column flex w-full flex-wrap justify-center overflow-y-auto">
          <div
            className="basis-1/2 bg-primary w-full relative hidden xl:flex justify-center items-center bg-gradient-to-br
          from-primary-600 via-primary-400 to-primary-600"
          >
            <Image
              src={background}
              alt="image"
              className="absolute top-0 left-0 w-full h-full"
            />
            <div className="relative z-10 backdrop-blur bg-primary-foreground/40 py-[84px] pl-[50px] pr-[136px] rounded">
              <div>
                <Button
                  className="bg-transparent hover:bg-transparent h-fit w-fit p-0"
                  onClick={() => setOpenVideo(true)}
                >
                  <Icon
                    icon="heroicons:play-solid"
                    className="text-primary-foreground h-[78px] w-[78px] -ml-2"
                  />
                </Button>

                <div className="text-6xl leading-[72px] font-semibold mt-2.5">
                  <span className="text-slate-700">
                    Unlock <br />
                    Your Project
                  </span>{' '}
                  <br />
                  <span className="text-slate-700">Performance</span>
                </div>
                <div className="mt-8 text-default-900 dark:text-slate-200  text-2xl font-medium">
                  You will never know everything. <br />
                  But you will know more...
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-screen basis-full md:basis-1/2 w-full px-4 flex justify-center items-center">
            <div className="lg:w-[480px]">
              <VerfiyForm />
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openVideo}>
        <DialogContent size="lg" className="p-0" hiddenCloseIcon>
          <Button
            size="icon"
            onClick={() => setOpenVideo(false)}
            className="absolute -top-4 -right-4 bg-default-900"
          >
            <X className="w-6 h-6" />
          </Button>
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/8D6b3McyhhU?si=zGOlY311c21dR70j"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen 
          ></iframe>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default VerifyPage;
