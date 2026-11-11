# daedalOS 桌面替换记录

用户明确要求按 https://dustinbrett.com 的完整桌面效果制作。本轮直接采用 Dustin Brett 的 daedalOS 源码，不再维护自制桌面壳。

## 来源

- 上游 https://github.com/DustinBrett/daedalOS
- 获取时 main 的 commit 为 ed9c7a54cc50a6e9125333743164830ad56779a5
- 源码位于 desktop/，保留原 LICENSE、README 和 public/CREDITS.md。
- 上游包配置另存 desktop/package.upstream.json。git 网络连接失败后，通过 GitHub 官方 API 的文件树与 raw.githubusercontent.com 获取文件。
- Burn-My-Windows 的窗口关闭效果资源来自 Schneegans/Burn-My-Windows，保留其 LICENSE。使用本地 vendor 目录，避免安装时依赖 git 代理。
- UTIF 使用 npm 官方仓库的 3.x 版本，其他桌面依赖沿用上游范围，并由 package-lock.json 锁定。

## 实现边界

开始菜单、任务栏、右键菜单、文件系统、文件管理器、桌面图标、窗口拖动缩放、最小化最大化、窗口动画和动态银河壁纸均来自 daedalOS。

游戏应用只提供各自窗口中的内容。没有把旧的假桌面整体嵌入一个窗口，也没有 iframe 引用作者的远程演示站。case 下的应用程序文件通过 HTTP 提供，不列入玩家的虚拟文件系统；玩家在硬盘中看到的是调查资料目录。

新增 CaseChat、CaseReader、CaseSearch、CaseNotes、CaseSpace 五个原生进程。窗口内通过同源 iframe 隔离内容 CSS，避免破坏桌面；窗口与任务栏由 daedalOS 渲染。

HC_ARCHIVE 是原生虚拟文件系统中的目录，资料使用原生快捷方式打开对应调查应用。现场回传在剧情达到相应节点后写入 IndexedDB 中的虚拟目录。游戏进度和各应用通过同源存储事件同步。

系统字体保留 Segoe UI，并增加 Noto Sans SC、微软雅黑中文回退。桌面主要小字从12px调到13px；调查正文16px、聊天15px，并保留行距和阅读留白。

默认关闭原版 AI 按钮。游戏不会调用真实摄像头、麦克风或读取玩家真实文件。

## 目录与命令

- desktop/ 为桌面源码；desktop/public/case/ 为无桌面壳的游戏应用内容。
- dist/ 保留上一版玩法原型，便于回查剧情逻辑；默认启动入口不再使用它。
- 修改游戏内容后运行 node scripts/integrate-daedalos.mjs，同步到桌面应用。
- 修改 public 下的文件后，先运行 npm --prefix desktop run build:prebuild 重新生成文件系统索引。
- npm run dev:desktop 启动开发环境，端口4179。
- npm run build:desktop 构建静态桌面到 desktop/out/。
- npm start 或双击启动游戏.cmd，运行静态桌面，端口4178。

构建采用 Next.js 自带的生产优化和静态导出；上游额外对所有第三方脚本再次执行 Terser 的步骤保留为 build:minify 命令，但不放在默认构建中。构建并发限制为2，减少在本机与其他应用争用内存。

上游公开资源已完整获取，包括大体积模拟器资源。分段续传的三份大文件已按 Git blob SHA-1 与上游逐一核对。原生代码只修改了集成点、中文字体和少量默认尺寸，桌面交互代码保留上游实现。

上游含多种模拟器和第三方应用，本轮验收重点是桌面及游戏所需应用，不宣称所有第三方游戏、模拟器和外部网站均逐项测试过。
