<p align="center">
  <img src="https://raw.githubusercontent.com/qingyu-dev/yommit/main/assets/icon.png" alt="Yommit 标志" width="128" height="128" />
</p>

<h1 align="center">Yommit</h1>

<p align="center">
  使用 DeepSeek 或阿里云百炼，根据暂存区 Git 变更生成提交信息，并自由组合 Gitmoji 和 Conventional Commit 前缀。
</p>

<p align="center">
  <a href="https://github.com/qingyu-dev/yommit/blob/main/README.md">English</a> | 简体中文
</p>

<p align="center">
  <a href="#安装">安装</a> ·
  <a href="#使用方式">使用方式</a> ·
  <a href="#配置">配置</a>
</p>

Yommit 是一个 VS Code 插件，可以根据当前 Git 暂存区变更生成提交信息。

它会读取当前暂存区 diff，把变更摘要发送给当前配置的 DeepSeek 或阿里云百炼 OpenAI 兼容模型，并把生成结果写回 VS Code Source Control 的提交输入框。

## 灵感来源

本项目受到 [carloscuesta/gitmoji](https://github.com/carloscuesta/gitmoji) 启发。Gitmoji 提供了一套清晰、直观的 Git 提交消息 emoji 指南。

## 功能

- 根据暂存区 Git 变更生成提交信息。
- 将生成结果直接写入 VS Code Source Control 提交输入框。
- 支持纯摘要、仅 Gitmoji、仅 Conventional Commit 前缀，或两者同时启用。
- 使用 VS Code SecretStorage 分别保存 DeepSeek 和阿里云 API Key。
- 支持中文和英文提交摘要。
- 可选择是否启用 Gitmoji 和 Conventional Commit type。
- 默认使用 DeepSeek，也支持切换到阿里云百炼。

示例输出：

```text
✨ 添加提交信息生成入口
✨ feat: 添加提交信息生成入口
🐛 修复空暂存区提示
♻️ 拆分提交生成用例
```

## 使用方式

1. 在 VS Code 中打开一个 Git 仓库。
2. 使用 `git add` 或 Source Control 面板暂存变更。
3. 保持默认 `yommit.provider = DeepSeek`，或切换为 `Alibaba (China)`。
4. 运行 `Yommit: Set API Key`，输入当前 provider 对应的 API Key。
5. 点击 Source Control 标题栏中的 sparkle 按钮。
6. 检查生成的 commit message，然后提交。

也可以从命令面板运行 `Yommit: Generate Commit Message`。

## 安装

可直接在 VS Code 插件市场安装：

1. 打开 VS Code 的扩展视图。
2. 搜索 `Yommit`。
3. 点击 `Install` 安装。

## 配置

| 配置项                       | 默认值          | 说明                                          |
| ---------------------------- | --------------- | --------------------------------------------- |
| `yommit.provider`            | `DeepSeek`      | 模型提供商：`DeepSeek` 或 `Alibaba (China)`。 |
| `yommit.model`               | provider 默认值 | 可选的模型覆盖值。                            |
| `yommit.language`            | `zh`            | 提交摘要语言，支持 `zh` 或 `en`。             |
| `yommit.useGitmoji`          | `true`          | 是否在提交信息开头添加 Gitmoji。              |
| `yommit.useConventionalType` | `false`         | 是否在提交信息中添加 `feat:` 这类 type。      |

provider 默认值：

| Provider          | 默认 model          |
| ----------------- | ------------------- |
| `DeepSeek`        | `deepseek-v4-flash` |
| `Alibaba (China)` | `qwen3.6-flash`     |

API Key 会保存在 VS Code SecretStorage 中，不会写入 `settings.json`。

生成格式由 Gitmoji 和 Conventional Commit type 两个开关决定，4 种组合都支持：

| Gitmoji | Conventional type | 格式                            |
| ------- | ----------------- | ------------------------------- |
| 开      | 关                | `✨ 添加提交信息生成入口`       |
| 开      | 开                | `✨ feat: 添加提交信息生成入口` |
| 关      | 关                | `添加提交信息生成入口`          |
| 关      | 开                | `feat: 添加提交信息生成入口`    |

## 隐私与安全

Yommit 会读取当前 Git 仓库的暂存区 diff，并把这些变更内容发送到你配置的 DeepSeek 或阿里云百炼接口，用于生成提交信息。请不要在暂存区中包含不应发送给外部模型服务的密钥、凭据、客户数据或公司敏感代码。

API Key 只通过 VS Code SecretStorage 保存在本机。项目不会把 API Key 写入 `settings.json`，也不会主动记录或上传 API Key。

## 命令

| 命令                              | 说明                                 |
| --------------------------------- | ------------------------------------ |
| `Yommit: Generate Commit Message` | 根据暂存区变更生成提交信息。         |
| `Yommit: Set API Key`             | 保存或替换当前 provider 的 API Key。 |
| `Yommit: Clear API Key`           | 删除当前 provider 的 API Key。       |

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
├─ infrastructure/  # VS Code、Git CLI、SecretStorage 和模型提供商适配器
└─ extension.ts     # 命令注册和依赖装配
```

这样可以让领域规则独立于 VS Code API 和外部模型服务。

## 注意事项

- 插件只读取暂存区变更。如果没有暂存 diff，会提示先执行 `git add`。
- 大 diff 会在发送给模型前被截断。
- 生成请求可以从 VS Code 进度通知中取消，网络请求超过 45 秒会自动中止。
- 如果 VS Code Git SCM 输入框不可用，生成结果会被复制到剪贴板。
