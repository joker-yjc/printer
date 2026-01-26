#!/bin/bash

# 打印服务平台停止脚本

echo "🛑 停止打印服务平台..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 从 PID 文件读取进程 ID
if [ -f "logs/server.pid" ]; then
    SERVER_PID=$(cat logs/server.pid | grep -o '[0-9]*')
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "${YELLOW}停止后端服务 (PID: $SERVER_PID)...${NC}"
        kill $SERVER_PID 2>/dev/null && echo -e "${GREEN}✓ 后端服务已停止${NC}" || echo "后端服务未运行"
    fi
    rm -f logs/server.pid
fi

if [ -f "logs/designer.pid" ]; then
    DESIGNER_PID=$(cat logs/designer.pid | grep -o '[0-9]*')
    if [ ! -z "$DESIGNER_PID" ]; then
        echo -e "${YELLOW}停止前端设计器 (PID: $DESIGNER_PID)...${NC}"
        kill $DESIGNER_PID 2>/dev/null && echo -e "${GREEN}✓ 前端设计器已停止${NC}" || echo "前端设计器未运行"
    fi
    rm -f logs/designer.pid
fi

# 清理可能残留的进程
pkill -f "vite" 2>/dev/null
pkill -f "ts-node-dev" 2>/dev/null

echo ""
echo -e "${GREEN}✨ 所有服务已停止${NC}"
