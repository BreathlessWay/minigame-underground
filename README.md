# minigame-underground

# Problem

1. 如果遇到使用 `nvm` + `sourcetree` + `husky` 时报 `command not found` 错误，则在**系统根目录**下创建 `.huskyrc` 文件，填入以下配置
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
