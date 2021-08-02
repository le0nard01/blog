import { ThemePreference } from "lib/theme-preference";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaLinkedin } from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";

import { SiReact } from "react-icons/si";
import { VscGithubInverted } from "react-icons/vsc";
import Dark from "styles/dark.json";
import Light from "styles/light.json";
import "../styles/globals.css";

const googleFont = "https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap";

const Me = {
  //TWITTER: "https://twitter.com/garcez_allan",
  TELEGRAM: "https://t.me/le0nard01",
  GITHUB: "https://github.com/le0nard01",
  LINKEDIN: "https://www.linkedin.com/in/leonardooste/",
};

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState<"dark" | "light" | null>(() => "dark");

  useEffect(() => {
    setTheme(() => (ThemePreference.prefersDark() ? "dark" : "light"));
  }, []);

  useEffect(() => {
    if (theme === null) return;
    const root = document.querySelector(":root")! as any;
    const json = theme === "dark" ? Dark : Light;
    ThemePreference.setCss(json, root);
    ThemePreference.saveTheme(theme);
  }, [theme]);

  const themeColor = useMemo(() => (theme === "dark" ? Dark.primary.DEFAULT : Light.primary.DEFAULT), []);

  const toggle = useCallback(() => {
    setTheme((p) => (p === "dark" ? "light" : "dark"));
  }, []);

  return (
    <main className="w-full container mx-auto md:px-6 px-4 block md:max-w-6xl">
      <Head>
        <title>Garcez Blog</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1" />
        <meta name="theme-color" content="#21272d" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link href={googleFont} rel="stylesheet" />
        <link rel="preload" href={googleFont} as="style" onLoad={(e) => ((e.target as any).rel = "stylesheet")} />
        <meta
          name="description"
          content="Amante da lógica, estudos e artigos sobre OpenStack, Criptografia, Machine Learning entre outros."
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="keywords" content="C++,Python,Openstack,Kubernetes,Machine Learning,Automation,Data Engineer" />
        <meta name="telegram:creator" content="@le0nard01" />
        <meta name="theme-color" content={themeColor} />
      </Head>
      <header className="w-full flex flex-wrap gap-y-8 justify-center items-center mb-8 mt-2 text-lg">
        <nav className="w-full mx-auto py-2 flex flex-row justify-between items-center">
          <Link href="/">
            <a href="/">
              <span className="flex items-center gap-x-2">
                <SiReact className="inline-block" />
                Garcez Blog
              </span>
            </a>
          </Link>
          <span className="flex gap-x-4">
            <button onClick={toggle} className="bg-transparent cursor-pointer mb-1">
              {theme === "dark" && <img width="24px" height="24px" alt="light mode icon" src="/sun.svg" />}
              {theme === "light" && <img width="24px" height="24px" alt="dark mode icon" src="/moon.svg" />}
            </button>
          </span>
        </nav>
      </header>
      <div className="w-full">
        <Component {...pageProps} />
      </div>
      <footer className="mb-2">
        <div className="mt-8 mb-4 text-lg flex flex-row justify-center font-bold gap-x-4">
          <a href={Me.GITHUB} className="cursor-pointer" title="My Github">
            <span className="sr-only">My Github</span>
            <VscGithubInverted />
          </a>
          <a
            href={Me.LINKEDIN}
            title="My Linkedin"
            className="cursor-pointer transition-colors duration-500 hover:text-linkedin"
          >
            <span className="sr-only">My Linkedin</span>
            <FaLinkedin />
          </a>
          <a
            href={Me.TELEGRAM}
            title="My telegram"
            className="cursor-pointer transition-colors duration-500 hover:text-telegram"
          >
            <span className="sr-only">My Telegram</span>

            <FaTelegramPlane />
          </a>
        </div>
        <div className="w-full block text-xs text-center">
          Sun/Moon icons made by{" "}
          <a href="https://www.freepik.com" title="Freepik" className="text-primary-link hover:underline italic">
            Freepik
          </a>{" "}
          from{" "}
          <a href="https://www.flaticon.com/" title="Flaticon" className="text-primary-link hover:underline italic">
            www.flaticon.com
          </a>{" "}
          <b className="mx-2">|</b> Brand Icons by{" "}
          <a className="text-primary-link hover:underline italic" href="https://react-icons.github.io/react-icons/">
            react-icons
          </a>
        </div>
      </footer>
    </main>
  );
}

export default MyApp;
