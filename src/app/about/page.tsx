import {
  Mail,
  Github,
  Twitter,
  Linkedin,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <header
        className="mb-20 h-110 rounded-xl p-4 flex flex-col justify-end"
        style={{
          backgroundImage: `url(/next-blog/images/coding.gif)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-stone-100"
          style={{ textShadow: "2px 2px 4px rgba(255, 0, 0, 1)" }}
        >
          About Me.
        </h1>
        <p
          className="text-lg text-stone-100 leading-relaxed max-w-2xl"
          style={{ textShadow: "2px 2px 2px rgba(0,0,0,.8)" }}
        >
          我是一名具有5年经验的前端开发人员。我具有<strong>Vue2/3</strong>
          多年开发经验，熟练掌握<strong>React</strong>、
          <strong>TypeScript</strong>、<strong>Nodejs（express/Koa）</strong>、
          <strong>前端工程化&CI/CD</strong>
          。并不断学习，致力于成为更好的前端（全栈）开发人员。
        </p>

        <div className="flex flex-wrap gap-6 mt-8">
          <a
            href="mailto:sxchen136@gmail.com"
            className="flex items-center gap-2 text-sm font-medium text-stone-100 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,.6)" }}
          >
            <Mail className="w-4 h-4" />
            chensxyouxiang@163.com
          </a>
          <div
            className="flex items-center gap-2 text-sm font-medium text-stone-100"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,.6)" }}
          >
            <MapPin className="w-4 h-4" />
            Guangzhou China
          </div>
        </div>
      </header>

      <section className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600 mb-10">
          Experience
        </h2>
        <div className="space-y-12">
          <div className="relative pl-8 border-l border-stone-100 dark:border-stone-900">
            <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                致力于成为：全栈开发工程师（AI）
              </h3>
              <span className="text-sm font-mono text-stone-400 dark:text-stone-600">
                2026.4 — （广州）
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 font-medium mb-4">
              👉<a href="https://chens-x.github.io/next-blog/posts/ragFundation">NextJS博客 + RAG问答系统</a>
            </p>
            <div className="text-stone-500 dark:text-stone-500 text-sm leading-relaxed">
              <p>
                <strong>🤖职责：</strong>
                整个系统架构选定，实现，维护等。
              </p>
              <strong>
                <a href="https://chens-x.github.io/next-blog/posts/ragFundation">👉点击链接查看</a>
              </strong>
              
            </div>
          </div>
          <div className="relative pl-8 border-l border-stone-100 dark:border-stone-900">
            <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                前端开发工程师
              </h3>
              <span className="text-sm font-mono text-stone-400 dark:text-stone-600">
                2022.4 — 2025.5（北京）
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 font-medium mb-4">
              toB/toC 大型PC端项目
            </p>
            <div className="text-stone-500 dark:text-stone-500 text-sm leading-relaxed">
              <p>
                <strong>职责：</strong>
                主要负责公司前端项目的开发，涵盖需求评审，技术选型，开发，维护。另外还负责协助他人前端开发、排查问题等。
              </p>
              <strong>主要项目：</strong>
              <ul className="pl-6 flex flex-col gap-1">
                <p>
                  <strong>北京公交可视化大屏系统PC端：</strong>
                  服务于公交各数据可视化大屏项目。涵盖了线路、状态、里程、班次等众多数据的可视化展示。基于Vue3.x+ElementPlus开发。
                </p>
                <p>
                  <strong>公交稽查检查系统PC&H5端：</strong>
                  服务于集团人员及车辆检查稽查功能，基于Vue3.x+ElementPlus，集成大文件上传，稽查审批工作流等功能。基于minemap地图框架和实现稽查人员实时位置可视化功能。移动端基于原生H5开发。
                </p>
                <p>
                  <strong>智慧加燃系统PC端：</strong>
                  公交充电加油统计系统，基于Vue2.x+ElementUI开发，集成minemap地图三方库+Echarts图表库开发。
                </p>
              </ul>
            </div>
          </div>

          <div className="relative pl-8 border-l border-stone-100 dark:border-stone-900">
            <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                前端开发工程师
              </h3>
              <span className="text-sm font-mono text-stone-400 dark:text-stone-600">
                2021.7 — 2022.3（北京）
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 font-medium mb-4">
              电商H5 & 微信小程序
            </p>
            <div className="text-stone-500 dark:text-stone-500 text-sm leading-relaxed">
              <p>
                <strong>职责：</strong>
                主要负责公司微信小程序项目的开发，涵盖需求评审，技术选型，开发，维护。另外还有PC端中台项目的开发，移动端H5项目开发。
              </p>
              <strong>主要项目：</strong>
              <ul className="pl-6 flex flex-col gap-1">
                <p>
                  <strong>华图小店小程序&H5端：</strong>
                  类电商项目，实现在线课程建立、推广、售卖、售后等功能。微信小程序原生开发，Vue3.x+VantUI
                  库开发。接入神策数据实现数据埋点功能；接入智齿客服实现客服功能。
                </p>
                <p>
                  <strong>华图教育+ 小程序：</strong>
                  华图课程在线观看小程序。微信小程序原生开发。
                </p>
              </ul>
            </div>
          </div>
          <div className="relative pl-8 border-l border-stone-100 dark:border-stone-900">
            <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                移动端开发工程师
              </h3>
              <span className="text-sm font-mono text-stone-400 dark:text-stone-600">
                2016.7 — 2021.4（广州）
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 font-medium mb-4">
              Hybrid App
            </p>
            <div className="text-stone-500 dark:text-stone-500 text-sm leading-relaxed">
              <p>
                <strong>职责：</strong>
                主要负责IOS原生插件开发。另外还有简单的前端小页面开发，项目部署CI/CD等
              </p>
              <strong>主要项目：</strong>
              <ul className="pl-6 flex flex-col gap-1">
                <p>
                  <strong>Sal PIXIE app&Sal PIXIE Plus app：</strong>
                  智能家居app，蓝牙&网关通信，远程遥控家具。使用Parse作为后台数据管理。封装原生iOS
                  Socket 插件实现局域网交互。
                </p>
                <p>
                  <strong>一尺台灯app&小程序：</strong>
                  使用Vue2.x+VantUI+微信小程序开发。封装IOS原生蓝牙插件，实现移动端与台灯互联操控等功能
                </p>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600 mb-10">
          Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4">
              Frontend
            </h3>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />{" "}
                Vue2/3
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />{" "}
                React / Next.js
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />{" "}
                TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />{" "}
                Tailwind CSS
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4">
              Backend & Tools
            </h3>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />{" "}
                Node.js / Express
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />{" "}
                MySQL
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />{" "}
                Git / CI/CD
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600 mb-10">
          Education
        </h2>
        <div className="space-y-8">
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                电子科学与技术专业
              </h3>
              <span className="text-xs font-mono text-stone-400 dark:text-stone-600">
                2012 — 2016
              </span>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-500">
              广东工业大学（Guangdong University of Technology）
            </p>
          </div>
        </div>
      </section>

      <footer className="pt-12 border-t border-stone-100 dark:border-stone-900">
        <div className="flex gap-6">
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_PAGE || ""}
            target="_blank"
            className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          {/* <a
            href="#"
            className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a> */}
        </div>
      </footer>
    </div>
  );
}
