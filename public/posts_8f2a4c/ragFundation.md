---
title: "🎇喜讯：静态博客装上AI大脑（集成RAG）"
date: "2026-04-10"
description: "花了些时间研究，前台NextJS，后台RAG为NodeJS + Qdrant + Ollama + Langchain🤖"
headerImage: "https://pic1.imgdb.cn/item/69d92179e80dabf2eace98d7.jpg"
thumbnail: "https://pic1.imgdb.cn/item/69d92179e80dabf2eace98d7.jpg"
sticky: true
---

## RAG with LangChain + DeepSeek：为我的静态博客装上AI大脑
> 能够生存下来的，不是最强壮的物种，也不是最聪明的物种，而是对变化反应最快的物种。—— 查尔斯·达尔文

作为一名前端人，在这个AI时代，不管自己如何宽慰自己，不焦虑是假的。所以，学点AI知识吧，肯定有用的。

### 🧩 项目架构与技术栈
整个项目采用前后端分离的架构，既保证了前端的快速访问，又赋予后端灵活的AI能力。

**前端：[NextBlog](https://chens-x.github.io/next-blog/)**
+ 框架: Next.js (SSG模式)
+ 部署: GitHub Pages
+ 特点: 全静态站点，加载迅速，免费托管。但通过集成AI助手，静态页面拥有了动态交互的灵魂。

**后端：RAG服务**
+ 核心框架: Node.js
+ AI编排: LangChain.js — 像乐高一样，将向量化、检索、模型调用等环节无缝串联。
+ 向量数据库: Qdrant — 高性能的向量检索引擎，负责存储和检索文章的“语义指纹”。
+ 本地模型服务: Ollama — 管理 nomic-embed-text 模型，为本地文本生成高质量的向量表示。
+ 大语言模型: DeepSeek API — 基于云端强大的生成能力，结合检索到的上下文，给出高质量的、类人化的回答。

**基础设施：自动化与稳定性**
+ CI/CD: GitHub Actions — 代码推送后自动构建镜像、推送到阿里云ACR、并在服务器上完成部署，实现全自动化流程。
+ 部署环境: 阿里云 ECS + Docker (Compose) + Nginx — 容器化部署确保环境一致性，Nginx提供反向代理与SSL支持。
+ 数据同步: GitHub Webhook — 每当博客文章更新，Webhook会触发后端同步脚本，自动更新向量库，确保知识的“保鲜”。

### ✨ 核心工作流：从文章到答案
1. 知识入库: 通过 /sync 接口，系统拉取GitHub仓库中最新的Markdown文章，利用LangChain进行智能分块，再调用Ollama的 nomic-embed-text 模型生成向量，最终存入Qdrant向量数据库。
2. 用户提问: 前端通过WebSocket与后端建立持久连接，发送用户问题。
3. 检索增强: 后端将问题向量化，在Qdrant中检索最相关的Top-K文章片段。
4. 生成回答: 将检索到的片段作为“参考资料”和对话历史，一并发送给云端DeepSeek API进行流式生成。最终，答案通过WebSocket逐字返回到前端，实现打字机效果。

### 🚀 亮点与特色
+ 真正的“智能”问答：基于语义理解而非关键词匹配，即使用户的问题与文章不完全一致，也能找到相关内容。
+ “记忆”永不丢失：对话历史被持久化在前端本地存储中，刷新页面依然可追溯；向量知识库与Git仓库同步，更新即生效。
+ 实时流式体验：通过WebSocket + SSE技术，答案以流式方式返回，用户无需等待完整生成，体验如同与真人对话。
+ 完全自动化运维：从代码提交到服务更新，全由GitHub Actions自动完成。服务器重启后，依靠Docker的restart: unless-stopped策略和系统服务，整个RAG服务会自动恢复运行，无需人工介入。
+ 低成本的私有化方案：个人级服务器 + 免费的开源软件 + 按量付费的DeepSeek API，实现了成本可控、数据可控的私有知识库。

### 🎯 展望与优化
目前系统已稳定运行，未来计划在以下方面继续探索：
+ 引入Rerank模型：进一步提升检索结果的精准度。
+ 支持多格式文档：不仅限于Markdown，扩展对PDF、Word等常见格式的支持。
+ 优化提示词工程：探索更高效的上下文组织方式，让AI的回答更贴合博客风格。

### 💎 写在最后
这套RAG系统不仅是一次技术实践，更是对知识传播形态的探索。它让我看到，一个由个人维护的静态博客，同样可以拥有智能、敏捷的AI大脑。
