import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "./providers";
import Script from "next/script";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CounselConnect - Online Counseling Platform",
  description: "Connect with professional counselors for secure online therapy sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LanguageProvider>
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
              <Script
                id="chatbase-script"
                strategy="lazyOnload"
              >
                {`
                  (function(){
                    if(!window.chatbase||window.chatbase("getState")!=="initialized"){
                      window.chatbase=(...arguments)=>{
                        if(!window.chatbase.q){window.chatbase.q=[]}
                        window.chatbase.q.push(arguments)
                      };
                      window.chatbase=new Proxy(window.chatbase,{
                        get(target,prop){
                          if(prop==="q"){return target.q}
                          return(...args)=>target(prop,...args)
                        }
                      })
                    }
                    const onLoad=function(){
                      const script=document.createElement("script");
                      script.src="https://www.chatbase.co/embed.min.js";
                      script.id="756dze57UieZJ4O8e5WaK";
                      script.domain="www.chatbase.co";
                      document.body.appendChild(script)
                    };
                    if(document.readyState==="complete"){
                      onLoad()
                    }else{
                      window.addEventListener("load",onLoad)
                    }
                  })();
                `}
              </Script>
            </main>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
