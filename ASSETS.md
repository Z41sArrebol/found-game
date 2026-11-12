# 影像素材

本项目使用内置 image_gen 模型生成影像，没有使用API CLI。所有投入游戏的素材均保存在项目的 `dist/assets/`，没有只引用模型默认输出目录。

完整提示词见 `image-prompts.json`。原图、档案变体与去告示变体使用内置生成或编辑模式。游戏中的维修贴纸、热点、结构示意、量帧时间轴属于界面原生内容。

资产用途

| 文件 | 用途 |
|---|---|
| room.png | 客厅与远窗原始证据，标题页背景 |
| corridor.png | 2008宾馆绿色门，带旧检查纸 |
| corridor-paused.png | 同一关联暂停后，旧检查纸不显示 |
| exterior.png | 公寓西侧无开窗的外墙 |
| clinic.png | 同机位的旧值班室档案变体 |
| ceiling.png | 从室内上方看向窗边摄影员的反常机位 |
| entrance.png | 当天真实入口，橙色测绳、外部锚点和蓝门楔 |

这些图片都是虚构游戏资产，不是现实事件影像。生成图像不承担像素级测量的充分证据，关键条件由可核对的测量记录与固定界面图示承担。

2026-11-12 按修订计划附录，使用内置 image_gen 生成/编辑以下资产。原始证据图片未覆盖。

| 文件 | 用途 |
| --- | --- |
| trace.png | 第 9 阶段墙面铅笔字与红袋的现场回传 |
| rope.png | 旧断绳的蓝色发圈、新绳的蓝色胶布 |
| cup-hand.png | 杯子测试第 3 秒起的远窗手部静帧 |
| wallpaper.png | 普通手机旅游照桌面壁纸 |
| wallpaper-stage9.png | 第 9 阶段起同一旅游照的亮窗变体 |
| street.png | safe / safe-marked 街口照片 |

壁纸变体有轻微生成纹理差异。原始调查附件固定不变，仅桌面背景随阶段切换。

2026-11-13 外墙伪通过陷阱与缩略图：

| 文件 | 用途 |
| --- | --- |
| exterior-2026.png | 2026 年 3 月物业例行巡检留影。以 exterior.png 为底重新取景并做轻微曝光/色温差，标签「设备维护 2026.03」自 entrance.png 真实像素移植（PIL 合成，脚本见 .runtime/exterior-2026.py），非模型生成 |
| System/Icons/thumbs/*.png | HC_ARCHIVE 快捷方式的照片缩略图（room/archives/entrance/green/rope/trace/ceiling/cup/exterior），160×160 居中裁剪 |

exterior-2026 与 2018 修缮前存档的差异只有取景、色温和新标签，不含空调外机等未实际改动的细节；对应台词只引用日期与修缮记录。
