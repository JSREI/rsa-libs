# RSA 加密/解密工具

一个基于React和TypeScript的RSA加密/解密工具，支持PEM、Base64和Hex格式的密钥。

## 功能特点

- **多种密钥格式支持**：支持PEM、Base64和Hex三种编码格式
- **自动格式识别**：粘贴密钥时自动识别其编码格式
- **密钥对验证**：验证公钥和私钥是否匹配
- **数据本地存储**：使用localStorage存储表单数据，页面刷新后不丢失
- **美观的UI界面**：使用Tailwind CSS构建的现代化界面

## 在线演示

访问 [https://jsrei.github.io/rsa-libs](https://jsrei.github.io/rsa-libs) 查看在线演示。

## 本地开发

### 环境要求

- Node.js 16+
- npm 8+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 构建生产版本

```bash
npm run build
```

## 部署

该项目使用GitHub Actions自动部署到GitHub Pages。每当主分支有更新时，会自动触发构建和部署流程。

## 技术栈

- React 18
- TypeScript 4
- Tailwind CSS 3
- GitHub Actions (CI/CD)

## 贡献

欢迎提交Pull Request或创建Issue。

## 许可证

MIT
