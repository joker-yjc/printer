# 需求文档：SDK 自定义 Pipe 适配器

## 1. 需求背景

当前 SDK 的 pipe 系统采用全局注册表模式（`pipes/registry.ts`），所有管道执行器在模块加载时注册到全局 `Map` 中。外部使用者无法在不修改 SDK 源码的情况下扩展或替换管道行为。

当用户克隆本项目后，若默认管道（date、currency、money 等）不满足业务需求，需要一种**非侵入式**的扩展机制，允许在调用 SDK 时传入自定义管道执行器。

## 2. 核心需求

1. **允许调用者传入自定义管道执行器**，在 SDK 实例化时注入
2. **自定义管道与内置管道共存**，优先级自定义 > 内置（可覆盖）
3. **实例级别隔离**，不同实例可配置不同管道，互不干扰
4. **向后兼容**，不传 `customPipes` 时行为不变

## 3. 使用场景

```ts
// 场景一：新增自定义管道
const sdk = createPrintSDK({
  customPipes: [
    {
      type: 'phoneMask',
      label: '手机号掩码',
      execute: (value) => String(value).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  ]
})

// 场景二：覆盖内置管道
const sdk = createPrintSDK({
  customPipes: [
    {
      type: 'date',  // 覆盖内置 DatePipe
      label: '自定义日期格式化',
      execute: (value, options) => { /* 自定义逻辑 */ }
    }
  ]
})
```

## 4. 非功能性需求

- 模板中的 `pipes: [{ type: 'xxx' }]` 无需任何改动即可关联自定义管道
- 规则需在 CHANGELOG 中记录
