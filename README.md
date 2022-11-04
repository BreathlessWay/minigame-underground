# minigame-underground

[教程地址](https://www.bilibili.com/video/BV1JL4y1M7Y4)

# Problem

1. 如果遇到使用 `nvm` + `sourcetree` + `husky` 时报 `command not found` 错误，则在**系统根目录**下创建 `.huskyrc` 文件，填入以下配置
   ```
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```
2. 开屏加载动画无法通过配置修改
   - 可以直接在 cocos 安装目录中 `find . -name "splash.png"`，将找出的 `splash.png` 都替换掉
   - 每次构建完成，手动修改，将构建输出目录下的 `splash.png` 替换掉
3. 开屏 Logo 可以在构建时，在构建配置中勾选替换插屏修改过
4. 项目=》项目设置=》适配宽度（否则渲染出的图片会很大）
