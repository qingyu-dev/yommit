<p align="center">
  <img src="assets/icon.png" alt="Yommit 标志" width="128" height="128" />
</p>

<h1 align="center">Yommit</h1>

<p align="center">
  使用 AI 根据暂存区 Git 变更生成 Gitmoji 风格的提交信息。
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

<p align="center">
  <a href="#安装">安装</a> ·
  <a href="#使用方式">使用方式</a> ·
  <a href="#配置">配置</a>
</p>

Yommit 是一个 VS Code 插件，可以根据当前 Git 暂存区变更生成 Gitmoji 风格的提交信息。

它会读取当前暂存区 diff，把变更摘要发送给阿里云百炼 OpenAI 兼容模型，并把生成结果写回 VS Code Source Control 的提交输入框。

## 灵感来源

本项目受到 [carloscuesta/gitmoji](https://github.com/carloscuesta/gitmoji) 启发。Gitmoji 提供了一套清晰、直观的 Git 提交消息 emoji 指南。

## 功能

- 根据暂存区 Git 变更生成提交信息。
- 将生成结果直接写入 VS Code Source Control 提交输入框。
- 使用简洁的 Gitmoji 格式。
- 使用 VS Code SecretStorage 保存阿里云 API Key。
- 支持中文和英文提交摘要。
- 默认使用 `qwen3.6-flash`，适合快速、低成本的轻量生成场景。

示例输出：

```text
✨ 添加提交信息生成入口
🐛 修复空暂存区提示
♻️ 拆分提交生成用例
```

## 使用方式

1. 在 VS Code 中打开一个 Git 仓库。
2. 使用 `git add` 或 Source Control 面板暂存变更。
3. 运行 `Yommit: Set Aliyun API Key`，输入你的阿里云百炼 API Key。
4. 点击 Source Control 标题栏中的 sparkle 按钮。
5. 检查生成的 commit message，然后提交。

也可以从命令面板运行 `Yommit: Generate Commit Message`。

## 安装

构建本地 VSIX 安装包：

```bash
npm install
npm run package
```

安装到 VS Code：

```bash
code --install-extension yommit-0.0.1.vsix --force
```

## 配置

| 配置项            | 默认值                                              | 说明                              |
| ----------------- | --------------------------------------------------- | --------------------------------- |
| `yommit.model`    | `qwen3.6-flash`                                     | 阿里云百炼模型名称。              |
| `yommit.baseUrl`  | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 阿里云百炼 OpenAI 兼容接口地址。  |
| `yommit.language` | `zh`                                                | 提交摘要语言，支持 `zh` 或 `en`。 |

API Key 会保存在 VS Code SecretStorage 中，不会写入 `settings.json`。

## 隐私与安全

Yommit 会读取当前 Git 仓库的暂存区 diff，并把这些变更内容发送到你配置的阿里云百炼 OpenAI 兼容接口，用于生成提交信息。请不要在暂存区中包含不应发送给外部模型服务的密钥、凭据、客户数据或公司敏感代码。

API Key 只通过 VS Code SecretStorage 保存在本机。项目不会把 API Key 写入 `settings.json`，也不会主动记录或上传 API Key。

## 命令

| 命令                              | 说明                         |
| --------------------------------- | ---------------------------- |
| `Yommit: Generate Commit Message` | 根据暂存区变更生成提交信息。 |
| `Yommit: Set Aliyun API Key`      | 保存或替换阿里云 API Key。   |
| `Yommit: Clear Aliyun API Key`    | 删除已保存的阿里云 API Key。 |

## 开发

开发和贡献说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。

常用检查命令：

```bash
npm run format:check
npm run lint
npm test
```

构建本地 VSIX：

```bash
npm run package
```

## 架构

项目使用轻量 DDD 风格结构：

```text
src/
├─ application/     # 用例和端口
├─ domain/          # Prompt、Gitmoji 和提交消息规则
├─ infrastructure/  # VS Code、Git CLI、SecretStorage 和阿里云适配器
└─ extension.ts     # 命令注册和依赖装配
```

这样可以让领域规则独立于 VS Code API 和外部模型服务。

## 注意事项

- 插件只读取暂存区变更。如果没有暂存 diff，会提示先执行 `git add`。
- 大 diff 会在发送给模型前被截断。
- 生成请求可以从 VS Code 进度通知中取消，网络请求超过 45 秒会自动中止。
- 如果 VS Code Git SCM 输入框不可用，生成结果会被复制到剪贴板。
