#!/bin/bash

# 打印服务平台一键启动脚本
# Mock API 已集成到 Vite，只需启动 designer

set -e  # 遇到错误立即退出

echo "🚀 启动打印服务平台开发环境..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
echo -e "${BLUE}📦 检查依赖...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js 未安装，请先安装 Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 已安装: $(node -v)${NC}"

# 检查 designer 依赖
if [ ! -d "designer/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Designer 依赖未安装，正在安装...${NC}"
    cd designer && npm install && cd ..
fi

echo -e "${GREEN}✓ 所有依赖已就绪${NC}"
echo ""

# 启动服务
echo -e "${BLUE}🔧 启动服务...${NC}"
echo ""

# 创建日志目录
mkdir -p logs

# 启动 designer（Mock API 已集成）
echo -e "${GREEN}▶ 启动前端设计器 (http://localhost:5173)${NC}"
echo -e "${BLUE}  Mock API 已集成到 Vite，无需单独启动后端${NC}"
cd designer
nohup npm run dev > ../logs/designer.log 2>&1 &
DESIGNER_PID=$!
echo "Designer PID: $DESIGNER_PID" > ../logs/designer.pid
cd ..

# 等待 designer 启动
sleep 2

echo ""
echo -e "${GREEN}✨ 开发环境启动成功！${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📍 服务地址:${NC}"
echo "   前端设计器: http://localhost:5173"
echo "   Mock API: http://localhost:5173/api/*"
echo ""
echo -e "${BLUE}📝 日志文件:${NC}"
echo "   前端日志: logs/designer.log"
echo ""
echo -e "${BLUE}🛑 停止服务:${NC}"
echo "   执行: ./stop.sh"
echo "   或按 Ctrl+C 然后执行: kill $DESIGNER_PID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 等待用户中断
trap "echo ''; echo -e '${YELLOW}🛑 正在停止服务...${NC}'; kill $DESIGNER_PID 2>/dev/null; rm -f logs/*.pid; echo -e '${GREEN}✓ 服务已停止${NC}'; exit 0" INT TERM

# 保持脚本运行
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo ""

# 实时显示日志
tail -f logs/designer.log &
TAIL_PID=$!

wait $DESIGNER_PID
