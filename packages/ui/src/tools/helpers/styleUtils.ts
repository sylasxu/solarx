// 样式处理工具// 响应式快捷生成器
export const responsive = (values: Record<string, any>) => {
  return Object.entries(values).map(([breakpoint, value]) => ({
    [breakpoint]: value,
  }));
};

// 使用示例
//   css(responsive({
//     base: { flexDirection: 'column' },
//     md: { flexDirection: 'row' }
//   }))
