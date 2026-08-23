import type { MockData } from '../../types';

/**
 * 默认系统内置 Mock 数据列表
 */
export const defaultMockData: MockData[] = [
  {
    id: 'mock-sales-001',
    name: '销售出库单 - 标准样例',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 包含5个明细项',
    data: {
      title: '销售出库单',
      subtitle: 'SALES DELIVERY NOTE',
      companyName: '深圳市示例科技有限公司',
      companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
      documentNo: 'SO202401150001',
      createdDate: '2024-01-15',
      createdTime: '2024-01-15T14:30:00',
      amount: 15800.5,
      status: 'completed',
      qrCodeUrl: 'https://www.example.com/delivery/SO202401150001',
      barcode: 'SO202401150001',
      logoUrl: 'https://via.placeholder.com/150x50/4A90E2/FFFFFF?text=LOGO',
      signatureUrl: 'https://via.placeholder.com/120x60/E2E2E2/666666?text=Signature',
      customer: {
        name: '北京天河商贸有限公司',
        contact: '张经理',
        phone: '13800138000',
        email: 'zhang@tianhe.com',
        address: '北京市朝阳区建国门外大街1号国贸大厦A座2001室'
      },
      items: [
        { no: 1, code: 'PRD-001', name: '<i style="color: red;">iPhone 15 Pro Max</i>', spec: '256GB 深空黑色', unit: '台', quantity: 5, price: 9999.0, amount: 49995.0 },
        { no: 2, code: 'PRD-002', name: 'MacBook Pro 14英寸', spec: 'M3 芯片/16GB/512GB', unit: '台', quantity: 3, price: 15999.0, amount: 47997.0 },
        { no: 3, code: 'PRD-003', name: 'AirPods Pro 2', spec: 'USB-C 充电盒', unit: '个', quantity: 10, price: 1899.0, amount: 18990.0 },
        { no: 4, code: 'PRD-004', name: 'Magic Keyboard', spec: '妙控键盘 含触控板', unit: '个', quantity: 8, price: 899.0, amount: 7192.0 },
        { no: 5, code: 'PRD-005', name: 'Magic Mouse', spec: '妙控鼠标 黑色', unit: '个', quantity: 8, price: 649.0, amount: 5192.0 }
      ],
      summary: {
        totalQuantity: 34,
        totalAmount: 129366.0,
        discount: 5000.0,
        tax: 15732.79,
        finalAmount: 140098.79
      },
      remarks: '1. 请核对商品数量和规格\n2. 签收时请检查包装是否完好\n3. 如有问题请在24小时内联系客服\n4. 本单据一式三份，请妥善保管',
      operator: '李明',
      reviewer: '王芳'
    }
  },
  {
    id: 'mock-sales-002',
    name: '月度销售汇总表 - 大数据量',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 包含39个明细项，用于测试大表格',
    data: {
      title: '月度销售汇总表',
      subtitle: 'MONTHLY SALES SUMMARY REPORT',
      companyName: '深圳市示例科技有限公司',
      companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
      documentNo: 'SR202401',
      orderDate: null,
      createdDate: '2024-01-31',
      createdTime: '2024-01-31T17:00:00',
      amount: 2856780.5,
      status: 'completed',
      qrCodeUrl: 'https://www.example.com/report/SR202401',
      barcode: 'SR202401',
      logoUrl: 'https://via.placeholder.com/150x50/4A90E2/FFFFFF?text=LOGO',
      signatureUrl: 'https://via.placeholder.com/120x60/E2E2E2/666666?text=Signature',
      customer: { name: '全国各区域销售统计', contact: '销售部', phone: '400-123-4567', email: 'sales@example.com', address: '全国' },
      items: [
        { no: 1, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
        { no: 2, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
        { no: 3, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
        { no: 4, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
        { no: 5, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
        { no: 6, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
        { no: 7, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
        { no: 8, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
        { no: 9, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
        { no: 10, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
        { no: 11, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
        { no: 12, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
        { no: 13, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
        { no: 14, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
        { no: 15, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
        { no: 16, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
        { no: 17, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
        { no: 18, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
        { no: 19, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
        { no: 20, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
        { no: 21, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
        { no: 22, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
        { no: 23, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
        { no: 24, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
        { no: 25, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
        { no: 26, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
        { no: 27, code: 'PRD-027', name: 'USB-C 转闪电连接线', spec: '1米', unit: '根', quantity: 156, price: 145.0, amount: 22620.0 },
        { no: 28, code: 'PRD-028', name: 'iPhone 硅胶保护壳', spec: '多色可选', unit: '个', quantity: 234, price: 399.0, amount: 93366.0 },
        { no: 29, code: 'PRD-029', name: 'iPad 智能双面夹', spec: '深海蓝', unit: '个', quantity: 87, price: 569.0, amount: 49503.0 },
        { no: 30, code: 'PRD-030', name: 'Mac Studio M2 Ultra', spec: '64GB/1TB', unit: '台', quantity: 12, price: 33999.0, amount: 407988.0 },
        { no: 31, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
        { no: 32, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
        { no: 33, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
        { no: 34, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
        { no: 35, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
        { no: 36, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
        { no: 37, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
        { no: 38, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
        { no: 39, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
        { no: 40, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
        { no: 41, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
        { no: 42, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
        { no: 43, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
        { no: 44, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
        { no: 45, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
        { no: 46, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
        { no: 47, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
        { no: 48, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
        { no: 49, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
        { no: 50, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
        { no: 51, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
        { no: 52, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
        { no: 53, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
        { no: 54, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
        { no: 55, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
        { no: 56, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
        { no: 57, code: 'PRD-027', name: 'USB-C 转闪电连接线', spec: '1米', unit: '根', quantity: 156, price: 145.0, amount: 22620.0 },
        { no: 58, code: 'PRD-028', name: 'iPhone 硅胶保护壳', spec: '多色可选', unit: '个', quantity: 234, price: 399.0, amount: 93366.0 },
        { no: 59, code: 'PRD-029', name: 'iPad 智能双面夹', spec: '深海蓝', unit: '个', quantity: 87, price: 569.0, amount: 49503.0 },
        { no: 60, code: 'PRD-030', name: 'Mac Studio M2 Ultra', spec: '64GB/1TB', unit: '台', quantity: 12, price: 33999.0, amount: 407988.0 },
        { no: 61, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 }
      ],
      summary: { totalQuantity: 3090, totalAmount: 12856780.5, discount: 500000.0, tax: 1542813.66, finalAmount: 13899594.16 },
      remarks: '本月销售业绩创历史新高，感谢全体销售人员的辛勤付出！',
      operator: '系统自动生成',
      reviewer: '财务部'
    }
  },
  {
    id: 'mock-sales-003',
    name: '简单测试单 - 最小数据集',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 最小化数据集，用于快速测试',
    data: {
      title: '简单测试单',
      subtitle: 'Simple Test',
      companyName: '测试公司',
      companyAddress: '测试地址',
      documentNo: 'T001',
      createdDate: '2024-01-15',
      createdTime: '2024-01-15T10:00:00',
      amount: 100.0,
      status: 'pending',
      qrCodeUrl: 'https://test.com',
      barcode: '123456',
      logoUrl: '',
      signatureUrl: '',
      customer: { name: '客户A', contact: '张三', phone: '12345678901', email: 'test@test.com', address: '北京' },
      items: [{ no: 1, code: 'A1', name: '商品1', spec: '默认', unit: '个', quantity: 1, price: 100.0, amount: 100.0 }],
      summary: { totalQuantity: 1, totalAmount: 100.0, discount: 0.0, tax: 0.0, finalAmount: 100.0 },
      remarks: '无',
      operator: '测试员',
      reviewer: ''
    }
  },
  {
    id: 'mock-batch-001',
    name: '批量打印测试数据 - 5份订单',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 用于测试批量打印功能，包含5份不同的订单',
    data: [
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150001',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T14:30:00',
        amount: 15800.5,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150001',
        barcode: 'SO202401150001',
        customer: {
          name: '北京天河商贸有限公司',
          contact: '张经理',
          phone: '13800138000',
          email: 'zhang@tianhe.com',
          address: '北京市朝阳区建国门外大街1号国贸大厦A座2001室'
        },
        items: [
          { no: 1, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
          { no: 2, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
          { no: 3, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
          { no: 4, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
          { no: 5, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
          { no: 6, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
          { no: 7, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
          { no: 8, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
          { no: 9, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
          { no: 10, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
          { no: 11, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
          { no: 12, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
          { no: 13, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
          { no: 14, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
          { no: 15, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
          { no: 16, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
          { no: 17, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
          { no: 18, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
          { no: 19, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
          { no: 20, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
          { no: 21, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
          { no: 22, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
          { no: 23, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
          { no: 24, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
          { no: 25, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
          { no: 26, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
          { no: 27, code: 'PRD-027', name: 'USB-C 转闪电连接线', spec: '1米', unit: '根', quantity: 156, price: 145.0, amount: 22620.0 },
          { no: 28, code: 'PRD-028', name: 'iPhone 硅胶保护壳', spec: '多色可选', unit: '个', quantity: 234, price: 399.0, amount: 93366.0 },
          { no: 29, code: 'PRD-029', name: 'iPad 智能双面夹', spec: '深海蓝', unit: '个', quantity: 87, price: 569.0, amount: 49503.0 },
          { no: 30, code: 'PRD-030', name: 'Mac Studio M2 Ultra', spec: '64GB/1TB', unit: '台', quantity: 12, price: 33999.0, amount: 407988.0 },
          { no: 31, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
          { no: 32, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
          { no: 33, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
          { no: 34, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
          { no: 35, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
          { no: 36, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
          { no: 37, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
          { no: 38, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
          { no: 39, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
          { no: 40, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
          { no: 41, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
          { no: 42, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
          { no: 43, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
          { no: 44, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
          { no: 45, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
          { no: 46, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
          { no: 47, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
          { no: 48, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
          { no: 49, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
          { no: 50, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
          { no: 51, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
          { no: 52, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
          { no: 53, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
          { no: 54, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
          { no: 55, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
          { no: 56, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
        ],
        summary: { totalQuantity: 8, totalAmount: 97992.0, discount: 1000.0, tax: 11639.04, finalAmount: 108631.04 },
        remarks: '请核对商品数量和规格',
        operator: '李明',
        reviewer: '王芳'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150002',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T15:00:00',
        amount: 28990.0,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150002',
        barcode: 'SO202401150002',
        customer: {
          name: '上海华盛贸易有限公司',
          contact: '李总',
          phone: '13900139000',
          email: 'li@huasheng.com',
          address: '上海市浦东新区世纪大道8号'
        },
        items: [
          { no: 1, code: 'PRD-003', name: 'AirPods Pro 2', spec: 'USB-C 充电盒', unit: '个', quantity: 10, price: 1899.0, amount: 18990.0 },
          { no: 2, code: 'PRD-004', name: 'Magic Keyboard', spec: '妙控键盘 含触控板', unit: '个', quantity: 8, price: 899.0, amount: 7192.0 },
          { no: 3, code: 'PRD-005', name: 'Magic Mouse', spec: '妙控鼠标 黑色', unit: '个', quantity: 4, price: 649.0, amount: 2596.0 }
        ],
        summary: { totalQuantity: 22, totalAmount: 28778.0, discount: 500.0, tax: 3393.36, finalAmount: 31671.36 },
        remarks: '紧急订单，请优先处理',
        operator: '张伟',
        reviewer: '赵敏'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150003',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T16:00:00',
        amount: 52995.0,
        status: 'pending',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150003',
        barcode: 'SO202401150003',
        customer: {
          name: '广州博瑞科技有限公司',
          contact: '陈总',
          phone: '13700137000',
          email: 'chen@borui.com',
          address: '广东省广州市天河区珠江新城科技园'
        },
        items: [
          { no: 1, code: 'PRD-006', name: 'iPad Pro 12.9', spec: 'M2 256GB', unit: '台', quantity: 6, price: 8799.0, amount: 52794.0 }
        ],
        summary: { totalQuantity: 6, totalAmount: 52794.0, discount: 800.0, tax: 6239.28, finalAmount: 58233.28 },
        remarks: '大客户订单',
        operator: '吴明',
        reviewer: '周芳'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150004',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T17:00:00',
        amount: 16495.0,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150004',
        barcode: 'SO202401150004',
        customer: {
          name: '杭州云达网络有限公司',
          contact: '郑经理',
          phone: '13600136000',
          email: 'zheng@yunda.com',
          address: '浙江省杭州市滨江区网商路599号'
        },
        items: [
          { no: 1, code: 'PRD-007', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 5, price: 3199.0, amount: 15995.0 }
        ],
        summary: { totalQuantity: 5, totalAmount: 15995.0, discount: 500.0, tax: 1859.4, finalAmount: 17354.4 },
        remarks: '常规订单',
        operator: '黄娜',
        reviewer: '张强'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150005',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T18:00:00',
        amount: 9597.0,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150005',
        barcode: 'SO202401150005',
        customer: {
          name: '成都智慧信息有限公司',
          contact: '刘总',
          phone: '13500135000',
          email: 'liu@zhihui.com',
          address: '四川省成都市高新区天府软件园'
        },
        items: [
          { no: 1, code: 'PRD-008', name: 'HomePod mini', spec: '智能音箱', unit: '台', quantity: 12, price: 749.0, amount: 8988.0 }
        ],
        summary: { totalQuantity: 12, totalAmount: 8988.0, discount: 100.0, tax: 1066.56, finalAmount: 9954.56 },
        remarks: '小额订单',
        operator: '孙丽',
        reviewer: '马军'
      }
    ]
  },
  {
    id: 'mock-nested-order-001',
    name: '采购订单 - 嵌套对象演示',
    schemaId: 'schema-demo-order-nested',
    description: '演示表格列使用嵌套路径（如 product.name）的数据，每行 items 中包含嵌套的 product 对象',
    data: {
      title: '采购订单',
      orderNo: 'PO202401150001',
      orderDate: '2024-01-15',
      supplier: {
        name: '深圳华芯电子科技有限公司',
        contact: '李工',
        phone: '0755-86001234'
      },
      items: [
        {
          no: 1,
          product: { name: 'STM32F407 微控制器', code: 'MCU-001', category: '芯片' },
          quantity: 500,
          price: 28.50,
          amount: 14250.00
        },
        {
          no: 2,
          product: { name: '0.96寸 OLED 显示屏', code: 'DSP-012', category: '显示屏' },
          quantity: 200,
          price: 15.80,
          amount: 3160.00
        },
        {
          no: 3,
          product: { name: 'ESP32-WROOM-32D 模组', code: 'MOD-007', category: '模组' },
          quantity: 300,
          price: 22.00,
          amount: 6600.00
        },
        {
          no: 4,
          product: { name: 'Type-C USB 连接器', code: 'CON-033', category: '连接器' },
          quantity: 1000,
          price: 1.20,
          amount: 1200.00
        },
        {
          no: 5,
          product: { name: 'LM2596 降压模块', code: 'MOD-021', category: '模组' },
          quantity: 150,
          price: 6.50,
          amount: 975.00
        }
      ],
      summary: { totalAmount: 26185.00, finalAmount: 26185.00 },
      remarks: '嵌套对象路径测试：表格列使用 product.name、product.code、product.category 等 dataIndex'
    }
  },
  {
    id: 'mock-continuous-001',
    name: '二分纸测试数据 - 标准样例',
    schemaId: 'schema-demo-sales',
    templateId: 'template-continuous-half',
    description: '用于二分纸连续打印模板的测试数据，包含 5 个明细项',
    data: {
      title: '销售出库单',
      subtitle: 'CONTINUOUS PRINT',
      companyName: '示例科技有限公司',
      companyAddress: '测试地址',
      documentNo: 'SO202405150001',
      createdDate: '2024-05-15',
      createdTime: '2024-05-15T10:30:00',
      amount: 38677.0,
      status: 'completed',
      qrCodeUrl: 'https://example.com/delivery/SO202405150001',
      barcode: 'SO202405150001',
      logoUrl: '',
      signatureUrl: '',
      customer: {
        name: '北京测试商贸有限公司',
        contact: '王经理',
        phone: '13900139000',
        email: 'wang@test.com',
        address: '北京市朝阳区测试路 1 号'
      },
      items: [
        { no: 1, code: 'TEST-001', name: '测试商品 A', spec: '标准规格', unit: '个', quantity: 10, price: 999.0, amount: 9990.0 },
        { no: 2, code: 'TEST-002', name: '测试商品 B', spec: '大号', unit: '个', quantity: 5, price: 1599.0, amount: 7995.0 },
        { no: 3, code: 'TEST-003', name: '测试商品 C', spec: '小号', unit: '个', quantity: 20, price: 299.0, amount: 5980.0 },
        { no: 4, code: 'TEST-004', name: '测试商品 D', spec: '中号', unit: '个', quantity: 8, price: 899.0, amount: 7192.0 },
        { no: 5, code: 'TEST-005', name: '测试商品 E', spec: '豪华版', unit: '个', quantity: 3, price: 2500.0, amount: 7500.0 }
      ],
      summary: {
        totalQuantity: 46,
        totalAmount: 38657.0,
        discount: 100.0,
        tax: 4626.84,
        finalAmount: 43183.84
      },
      remarks: '这是用于测试二分纸连续打印的示例数据，请核对商品数量和规格。',
      operator: '测试员',
      reviewer: '审核员'
    }
  },
  {
    id: 'mock-a5-001',
    name: 'A5 订单测试数据 - 标准样例',
    schemaId: 'schema-demo-sales',
    templateId: 'template-a5-order',
    description: '用于 A5 纸张模板的测试数据，包含 4 个明细项',
    data: {
      title: '销售出库单',
      subtitle: 'A5 DOCUMENT',
      companyName: '示例科技有限公司',
      companyAddress: '广东省深圳市南山区科技园',
      documentNo: 'A5-20240515001',
      createdDate: '2024-05-15',
      createdTime: '2024-05-15T09:00:00',
      amount: 38890.0,
      status: 'completed',
      qrCodeUrl: 'https://example.com/order/A5-20240515001',
      barcode: 'A5-20240515001',
      logoUrl: '',
      signatureUrl: '',
      customer: {
        name: '上海极光商贸有限公司',
        contact: '李经理',
        phone: '13912345678',
        email: 'li@jiguang.com',
        address: '上海市浦东新区张江高科技园区 200 号'
      },
      items: [
        { no: 1, code: 'A5-001', name: '文具套装 A', spec: '标准版', unit: '套', quantity: 20, price: 299.0, amount: 5980.0 },
        { no: 2, code: 'A5-002', name: '办公笔记本', spec: 'A5 皮面', unit: '本', quantity: 50, price: 35.0, amount: 1750.0 },
        { no: 3, code: 'A5-003', name: '签字笔套装', spec: '12 支装', unit: '盒', quantity: 30, price: 128.0, amount: 3840.0 },
        { no: 4, code: 'A5-004', name: '打印纸', spec: '80g/500张', unit: '箱', quantity: 10, price: 289.0, amount: 2890.0 }
      ],
      summary: {
        totalQuantity: 110,
        totalAmount: 14460.0,
        discount: 200.0,
        tax: 1711.2,
        finalAmount: 15971.2
      },
      remarks: 'A5 模板测试数据 - 常规文具订单，请按时发货。',
      operator: '张三',
      reviewer: '李四'
    }
  },
  {
    id: 'mock-a4-header-footer-001',
    name: '页眉页脚模板测试数据 - 标准样例',
    schemaId: 'schema-demo-sales',
    templateId: 'template-a4-header-footer',
    description: '用于页眉页脚 A4 模板的测试数据，包含 5 个明细项',
    data: {
      title: '订单打印',
      subtitle: '',
      companyName: '星辰数码科技有限公司',
      companyAddress: '广东省深圳市南山区高新科技园 A 座 1208',
      documentNo: 'ORD-202401220001',
      createdDate: '2024-01-22 14:30',
      createdTime: '2024-01-22T14:30:00',
      amount: 38990.0,
      status: 'completed',
      qrCodeUrl: 'https://example.com/order/ORD-202401220001',
      barcode: 'ORD202401220001',
      logoUrl: '',
      signatureUrl: '',
      customer: {
        name: '深圳市朝阳电子科技有限公司',
        contact: '张伟',
        phone: '138****5678',
        email: 'zhangwei@chaoyang.com',
        address: '广东省深圳市宝安区西乡街道 88 号'
      },
      items: [
        { no: 1, code: 'P001', name: 'iPhone 15 Pro', spec: '256GB 深空黑', unit: '台', quantity: 2, price: 8999.0, amount: 17998.0 },
        { no: 2, code: 'P002', name: 'MacBook Pro 14', spec: 'M3 Pro / 18GB / 512GB', unit: '台', quantity: 1, price: 14999.0, amount: 14999.0 },
        { no: 3, code: 'P003', name: 'AirPods Pro', spec: '第二代 USB-C', unit: '副', quantity: 3, price: 1899.0, amount: 5697.0 },
        { no: 4, code: 'P004', name: 'Apple Watch Ultra 2', spec: '49mm 海洋表带', unit: '只', quantity: 1, price: 6499.0, amount: 6499.0 },
        { no: 5, code: 'P005', name: 'iPad Air', spec: '11英寸 M2 / 256GB', unit: '台', quantity: 1, price: 5999.0, amount: 5999.0 }
      ],
      summary: {
        totalQuantity: 8,
        totalAmount: 51192.0,
        discount: 500.0,
        tax: 6083.04,
        finalAmount: 56775.04
      },
      remarks: '页眉页脚模板测试数据，请注意核对商品序列号，所有商品需提供正规发票。',
      operator: '王芳',
      reviewer: '赵明'
    }
  },
  {
    id: 'mock-real-001',
    name: '示例订单数据 - 食材配送(批量)',
    schemaId: 'schema-demo-sales',
    description: '示例业务订单数据 - 阳光幼儿园食材配送，45个明细项，用于演示批量打印场景',
    data: [
      {
        code: 'XSDD20260603001',
        submitDate: '2026-06-03',
        deliverDate: '2026-06-05',
        reconcileDate: '2026-06-05',
        createTime: '2026-06-03 16:08:34',
        customName: 'XX市阳光幼儿园食堂-幼儿',
        settleCustomerName: 'XX市阳光幼儿园食堂',
        mealName: '调味辅料类',
        contacts: '张老师',
        phone: '13800138000',
        address: 'XX市XX区XX路 88 号',
        submitUserName: '李小红',
        updateByName: '李小红',
        amount: 6947.02,
        discountAmount: 0,
        actualAmount: 6947.02,
        totalCount: 410.2,
        totalAmount: 6947.024,
        customCode: 'CUST001-2',
        status: 100,
        orderItemList: [
          { "no": 1, "materialName": "紫菜/特级", "materialCode": "MAT001001", "saleUnitName": "斤", "count": 1.7, "saleCount": 1.7, "price": 83.98, "amount": 142.77, "scmQuotationMaterialBasePrice": "88.40", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 2, "materialName": "通心粉（白）/25kg", "materialCode": "MAT001002", "saleUnitName": "斤", "count": 31, "saleCount": 31, "price": 5.61, "amount": 173.91, "scmQuotationMaterialBasePrice": "5.90", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 3, "materialName": "紫米/一级", "materialCode": "MAT001003", "saleUnitName": "斤", "count": 2.6, "saleCount": 2.6, "price": 8.84, "amount": 22.98, "scmQuotationMaterialBasePrice": "9.30", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 4, "materialName": "腐竹/干货", "materialCode": "MAT001004", "saleUnitName": "斤", "count": 9, "saleCount": 9, "price": 19.86, "amount": 178.74, "scmQuotationMaterialBasePrice": "20.90", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 5, "materialName": "黑木耳/一级", "materialCode": "MAT001005", "saleUnitName": "斤", "count": 2.6, "saleCount": 2.6, "price": 42.39, "amount": 110.21, "scmQuotationMaterialBasePrice": "44.63", "scmQuotationMaterialDiscountRate": "94.98%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 6, "materialName": "小米/一级", "materialCode": "MAT001006", "saleUnitName": "斤", "count": 2.6, "saleCount": 2.6, "price": 7.26, "amount": 18.88, "scmQuotationMaterialBasePrice": "7.65", "scmQuotationMaterialDiscountRate": "94.9%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 7, "materialName": "米粉/2kg", "materialCode": "MAT001007", "saleUnitName": "箱", "count": 32, "saleCount": 8, "price": 24.99, "amount": 199.92, "scmQuotationMaterialBasePrice": "26.30", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 8, "materialName": "蜜枣/一级", "materialCode": "MAT001008", "saleUnitName": "斤", "count": 1.8, "saleCount": 1.8, "price": 9.98, "amount": 17.96, "scmQuotationMaterialBasePrice": "10.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 9, "materialName": "茨实/特级", "materialCode": "MAT001009", "saleUnitName": "斤", "count": 4.3, "saleCount": 4.3, "price": 39.81, "amount": 171.18, "scmQuotationMaterialBasePrice": "41.90", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 10, "materialName": "绿豆/特级", "materialCode": "MAT001010", "saleUnitName": "斤", "count": 4.3, "saleCount": 4.3, "price": 10.55, "amount": 45.37, "scmQuotationMaterialBasePrice": "11.10", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 11, "materialName": "蜜枣/一级", "materialCode": "MAT001008", "saleUnitName": "斤", "count": 2.7, "saleCount": 2.7, "price": 9.98, "amount": 26.95, "scmQuotationMaterialBasePrice": "10.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 12, "materialName": "干裙带菜/一级", "materialCode": "MAT001012", "saleUnitName": "斤", "count": 1.7, "saleCount": 1.7, "price": 47.79, "amount": 81.24, "scmQuotationMaterialBasePrice": "50.30", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 13, "materialName": "小米/一级", "materialCode": "MAT001006", "saleUnitName": "斤", "count": 4.3, "saleCount": 4.3, "price": 7.26, "amount": 31.22, "scmQuotationMaterialBasePrice": "7.65", "scmQuotationMaterialDiscountRate": "94.9%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 14, "materialName": "开边红枣/特级", "materialCode": "MAT001014", "saleUnitName": "斤", "count": 1.7, "saleCount": 1.7, "price": 19.86, "amount": 33.76, "scmQuotationMaterialBasePrice": "20.90", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 15, "materialName": "麦冬/一级", "materialCode": "MAT001015", "saleUnitName": "斤", "count": 2.7, "saleCount": 2.7, "price": 104.98, "amount": 283.45, "scmQuotationMaterialBasePrice": "110.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 16, "materialName": "响螺片/一级", "materialCode": "MAT001016", "saleUnitName": "斤", "count": 2.7, "saleCount": 2.7, "price": 180.03, "amount": 486.08, "scmQuotationMaterialBasePrice": "189.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 17, "materialName": "糙米/一级", "materialCode": "MAT001017", "saleUnitName": "斤", "count": 2.6, "saleCount": 2.6, "price": 5.99, "amount": 15.57, "scmQuotationMaterialBasePrice": "6.30", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 18, "materialName": "腰果仁/500g", "materialCode": "MAT001018", "saleUnitName": "罐", "count": 9, "saleCount": 9, "price": 108.02, "amount": 972.18, "scmQuotationMaterialBasePrice": "113.70", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 19, "materialName": "岩烧海苔（原味）/16g*8包", "materialCode": "MAT001019", "saleUnitName": "包", "count": 69, "saleCount": 69, "price": 17.96, "amount": 1239.24, "scmQuotationMaterialBasePrice": "18.90", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 20, "materialName": "卤水汁/230ml*24瓶", "materialCode": "MAT001020", "saleUnitName": "瓶", "count": 8, "saleCount": 8, "price": 7.22, "amount": 57.76, "scmQuotationMaterialBasePrice": "7.60", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 21, "materialName": "白醋/450ml*12瓶", "materialCode": "MAT001021", "saleUnitName": "瓶", "count": 7, "saleCount": 7, "price": 4.28, "amount": 29.96, "scmQuotationMaterialBasePrice": "4.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 22, "materialName": "大红浙醋/620ml*12瓶", "materialCode": "MAT001022", "saleUnitName": "瓶", "count": 2, "saleCount": 2, "price": 4.47, "amount": 8.94, "scmQuotationMaterialBasePrice": "4.70", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 23, "materialName": "番茄沙司/510ml*12瓶", "materialCode": "MAT001023", "saleUnitName": "瓶", "count": 3, "saleCount": 3, "price": 9.03, "amount": 27.09, "scmQuotationMaterialBasePrice": "9.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 24, "materialName": "冰片糖/5kg", "materialCode": "MAT001024", "saleUnitName": "斤", "count": 3, "saleCount": 3, "price": 4.94, "amount": 14.82, "scmQuotationMaterialBasePrice": "5.20", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 25, "materialName": "鸡骨草", "materialCode": "MAT001025", "saleUnitName": "斤", "count": 0.5, "saleCount": 0.5, "price": 22.99, "amount": 11.5, "scmQuotationMaterialBasePrice": "24.20", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 26, "materialName": "干羊肚菌/一级", "materialCode": "MAT001026", "saleUnitName": "斤", "count": 1.9, "saleCount": 1.9, "price": 665.0, "amount": 1263.5, "scmQuotationMaterialBasePrice": "700.00", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 27, "materialName": "西米/大粒", "materialCode": "MAT001027", "saleUnitName": "斤", "count": 4.8, "saleCount": 4.8, "price": 5.99, "amount": 28.75, "scmQuotationMaterialBasePrice": "6.30", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 28, "materialName": "黄冰糖/5kg", "materialCode": "MAT001028", "saleUnitName": "斤", "count": 8, "saleCount": 8, "price": 5.51, "amount": 44.08, "scmQuotationMaterialBasePrice": "5.80", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 29, "materialName": "香叶/一级", "materialCode": "MAT001029", "saleUnitName": "斤", "count": 0.1, "saleCount": 0.1, "price": 36.01, "amount": 3.6, "scmQuotationMaterialBasePrice": "37.90", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 30, "materialName": "桂皮/一级", "materialCode": "MAT001030", "saleUnitName": "斤", "count": 0.1, "saleCount": 0.1, "price": 30.4, "amount": 3.04, "scmQuotationMaterialBasePrice": "32.00", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 31, "materialName": "草果/一级", "materialCode": "MAT001031", "saleUnitName": "斤", "count": 0.1, "saleCount": 0.1, "price": 39.52, "amount": 3.95, "scmQuotationMaterialBasePrice": "41.60", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 32, "materialName": "话梅/一级", "materialCode": "MAT001032", "saleUnitName": "斤", "count": 0.2, "saleCount": 0.2, "price": 24.99, "amount": 5.0, "scmQuotationMaterialBasePrice": "26.30", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 33, "materialName": "白砂糖/50kg", "materialCode": "MAT001033", "saleUnitName": "袋", "count": 100, "saleCount": 1, "price": 447.0, "amount": 447.0, "scmQuotationMaterialBasePrice": "470.53", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 34, "materialName": "生抽/1.9L*6瓶", "materialCode": "MAT001034", "saleUnitName": "瓶", "count": 5, "saleCount": 5, "price": 22.04, "amount": 110.2, "scmQuotationMaterialBasePrice": "23.20", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 35, "materialName": "散装碗面/1.75kg", "materialCode": "MAT001035", "saleUnitName": "箱", "count": 3.5, "saleCount": 1, "price": 28.03, "amount": 28.03, "scmQuotationMaterialBasePrice": "29.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 36, "materialName": "虾皮/一级", "materialCode": "MAT001036", "saleUnitName": "斤", "count": 0.5, "saleCount": 0.5, "price": 33.54, "amount": 16.77, "scmQuotationMaterialBasePrice": "35.30", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 37, "materialName": "蚝油/6kg*2桶", "materialCode": "MAT001037", "saleUnitName": "桶", "count": 2, "saleCount": 2, "price": 41.99, "amount": 83.98, "scmQuotationMaterialBasePrice": "44.20", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 38, "materialName": "糕点用小麦粉/25kg", "materialCode": "MAT001038", "saleUnitName": "袋", "count": 50, "saleCount": 1, "price": 182.97, "amount": 182.97, "scmQuotationMaterialBasePrice": "192.60", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 39, "materialName": "干冬菇/特级", "materialCode": "MAT001039", "saleUnitName": "斤", "count": 0.8, "saleCount": 0.8, "price": 51.97, "amount": 41.58, "scmQuotationMaterialBasePrice": "54.70", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 40, "materialName": "干冬菇/特级", "materialCode": "MAT001039", "saleUnitName": "斤", "count": 0.4, "saleCount": 0.4, "price": 51.97, "amount": 20.79, "scmQuotationMaterialBasePrice": "54.70", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 41, "materialName": "糯米粉/500g*20包", "materialCode": "MAT001041", "saleUnitName": "包", "count": 7, "saleCount": 7, "price": 10.55, "amount": 73.85, "scmQuotationMaterialBasePrice": "11.10", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 42, "materialName": "牛油", "materialCode": "MAT001042", "saleUnitName": "斤", "count": 8, "saleCount": 8, "price": 13.02, "amount": 104.16, "scmQuotationMaterialBasePrice": "13.70", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 43, "materialName": "白糖粉", "materialCode": "MAT001043", "saleUnitName": "斤", "count": 4, "saleCount": 4, "price": 7.51, "amount": 30.04, "scmQuotationMaterialBasePrice": "7.90", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 44, "materialName": "全脂奶粉/500g", "materialCode": "MAT001044", "saleUnitName": "包", "count": 1, "saleCount": 1, "price": 45.03, "amount": 45.03, "scmQuotationMaterialBasePrice": "47.40", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" },
          { "no": 45, "materialName": "腐乳/300g*36瓶", "materialCode": "MAT001045", "saleUnitName": "瓶", "count": 1, "saleCount": 1, "price": 9.03, "amount": 9.03, "scmQuotationMaterialBasePrice": "9.50", "scmQuotationMaterialDiscountRate": "95%", "remark": "", "customNameSuffix": "幼儿" }
        ]
      }
    ]
  },
  {
    id: 'mock-group-001',
    name: '分组测试数据 - 食材配送单(按分类)',
    schemaId: 'schema-demo-sales',
    description: '表格分组功能测试数据 - 4 个分类共 26 个明细项（含 1 条空分类，用于验证"未分组"归组），分组字段为 items[].category',
    data: {
      title: '食材配送单',
      documentNo: 'PS202608190001',
      deliverDate: '2026-08-19 07:30:00 ~ 2026-08-19 09:30:00',
      customName: 'XX市阳光幼儿园食堂',
      contacts: '张老师',
      phone: '13800138000',
      items: [
        // ── 蔬果（18 项，小计 89.19）──
        { no: 1, category: '蔬果', name: '白萝卜#', unit: '斤', count: 6.3, price: 0.92, amount: 5.80 },
        { no: 2, category: '蔬果', name: '胡萝卜', unit: '斤', count: 1.07, price: 1.60, amount: 1.71 },
        { no: 3, category: '蔬果', name: '云南新大蒜#', unit: '斤', count: 2, price: 4.31, amount: 8.62 },
        { no: 4, category: '蔬果', name: '淮山药', unit: '斤', count: 1, price: 4.52, amount: 4.52 },
        { no: 5, category: '蔬果', name: '香芹（实心）', unit: '斤', count: 1, price: 2.18, amount: 2.18 },
        { no: 6, category: '蔬果', name: '西兰花（外地）#', unit: '斤', count: 1.4, price: 2.96, amount: 4.14 },
        { no: 7, category: '蔬果', name: '空心菜#', unit: '斤', count: 1.5, price: 2.72, amount: 4.08 },
        { no: 8, category: '蔬果', name: '浆绿叶', unit: '斤', count: 1.1, price: 2.51, amount: 2.76 },
        { no: 9, category: '蔬果', name: '凤尾', unit: '斤', count: 1, price: 3.39, amount: 3.39 },
        { no: 10, category: '蔬果', name: '眉山折耳根（人工挑选）', unit: '斤', count: 2, price: 6.32, amount: 12.64 },
        { no: 11, category: '蔬果', name: '三月瓜（普通）', unit: '斤', count: 1.1, price: 2.11, amount: 2.32 },
        { no: 12, category: '蔬果', name: '带壳玉米棒', unit: '斤', count: 2, price: 1.17, amount: 2.34 },
        { no: 13, category: '蔬果', name: '散花菜', unit: '斤', count: 1.7, price: 1.42, amount: 2.41 },
        { no: 14, category: '蔬果', name: '红小米椒', unit: '斤', count: 1, price: 5.81, amount: 5.81 },
        { no: 15, category: '蔬果', name: '蒜米普通(5斤)', unit: '斤', count: 5, price: 3.40, amount: 17.00 },
        { no: 16, category: '蔬果', name: '小葱（切葱白用）', unit: '斤', count: 1, price: 3.76, amount: 3.76 },
        { no: 17, category: '蔬果', name: '水发大木耳#', unit: '斤', count: 1, price: 2.51, amount: 2.51 },
        { no: 18, category: '蔬果', name: '银针菇（小袋装）', unit: '袋', count: 2, price: 1.60, amount: 3.20 },
        // ── 鲜货/水发发私房菜（1 项，小计 15.60）──
        { no: 19, category: '鲜货/水发发私房菜', name: 'N1 鲜猪脑花##', unit: '个', count: 5, price: 3.12, amount: 15.60 },
        // ── 肉禽蛋水产私房菜（2 项，小计 55.85）──
        { no: 20, category: '肉禽蛋水产私房菜', name: '白壳鸡蛋（30枚）/板#', unit: '板', count: 1, price: 23.80, amount: 23.80 },
        { no: 21, category: '肉禽蛋水产私房菜', name: '龙骨（砍）#', unit: '斤', count: 5, price: 6.41, amount: 32.05 },
        // ── 豆/面制品私房菜（4 项，小计 11.50）──
        { no: 22, category: '豆/面制品私房菜', name: '花椒厚豆干#', unit: '斤', count: 1, price: 4.86, amount: 4.86 },
        { no: 23, category: '豆/面制品私房菜', name: '黄凉粉（米凉粉）', unit: '斤', count: 1, price: 1.12, amount: 1.12 },
        { no: 24, category: '豆/面制品私房菜', name: '绿豆芽（2斤/袋）#', unit: '斤', count: 2, price: 1.36, amount: 2.72 },
        { no: 25, category: '豆/面制品私房菜', name: '老豆腐（块）', unit: '块', count: 2, price: 1.40, amount: 2.80 },
        // ── 空分类（验证 emptyGroupLabel 归入"未分组"）──
        { no: 26, category: '', name: '未知分类商品', unit: '斤', count: 1, price: 10.00, amount: 10.00 }
      ],
      totalAmount: 172.14,
      remarks: '分组测试数据：表格列 dataIndex 使用 name/count/price/amount，分组字段为 category'
    }
  },
  {
    id: 'mock-group-batch-001',
    name: '分组批量测试 - 3份食材配送单',
    schemaId: 'schema-demo-group',
    description: '表格分组批量打印测试 - 3 份配送单（各 4~5 组、20+ 明细），用于验证批量模式下的分组渲染与分页',
    data: (() => {
      /** 按分类生成一份配送单明细 */
      const buildItems = (seed: number) => {
        const cats: [string, number][] = [['蔬果', 12], ['鲜货/水发发私房菜', 3], ['肉禽蛋水产私房菜', 4], ['豆/面制品私房菜', 3]];
        const items: any[] = [];
        let no = 1;
        for (const [cat, count] of cats) {
          for (let i = 0; i < count; i++) {
            const idx = seed + i;
            items.push({
              no: no++,
              category: cat,
              name: `${cat.slice(0, 2)}商品${idx}#`,
              unit: i % 3 === 0 ? '斤' : i % 3 === 1 ? '个' : '袋',
              count: 1 + ((idx * 7) % 9) / 2,
              price: Number((2 + ((idx * 13) % 30) / 10).toFixed(2)),
              amount: Number(Number((2 + ((idx * 13) % 30) / 10).toFixed(2)) * (1 + ((idx * 7) % 9) / 2)).toFixed(2),
            });
          }
          seed += count;
        }
        return items;
      };
      return [
        { title: '食材配送单', documentNo: 'PS202608200001', deliverDate: '2026-08-20 07:30:00 ~ 09:30:00', customName: '阳光幼儿园食堂', contacts: '张老师', phone: '13800138000', items: buildItems(1), totalAmount: 0, remarks: '批量第 1 份' },
        { title: '食材配送单', documentNo: 'PS202608200002', deliverDate: '2026-08-20 07:30:00 ~ 09:30:00', customName: '希望小学食堂', contacts: '李老师', phone: '13900139000', items: buildItems(30), totalAmount: 0, remarks: '批量第 2 份' },
        { title: '食材配送单', documentNo: 'PS202608200003', deliverDate: '2026-08-20 07:30:00 ~ 09:30:00', customName: '实验中学食堂', contacts: '王老师', phone: '13700137000', items: buildItems(60), totalAmount: 0, remarks: '批量第 3 份' },
      ];
    })()
  },
  {
    id: 'mock-group-large-001',
    name: '分组大数据量测试 - 8组640行',
    schemaId: 'schema-demo-group',
    description: '表格分组压力测试 - 8 个分类共 640 个明细项，用于验证多页分页、keepTogether 与渲染性能',
    data: (() => {
      const catNames = ['蔬菜类', '水果类', '肉禽类', '水产类', '豆制品类', '粮油类', '调味品类', '干货类'];
      const items: any[] = [];
      let no = 1;
      for (let c = 0; c < catNames.length; c++) {
        for (let i = 0; i < 80; i++) {
          const idx = c * 100 + i;
          const price = Number((1 + ((idx * 17) % 500) / 100).toFixed(2));
          const count = 1 + ((idx * 7) % 19) / 2;
          items.push({
            no: no++,
            category: catNames[c],
            name: `${catNames[c]}-商品${String(i + 1).padStart(3, '0')}${i % 10 === 0 ? '#' : ''}`,
            unit: ['斤', '个', '袋', '箱', '瓶'][i % 5],
            count,
            price,
            amount: Number((price * count).toFixed(2)),
          });
        }
      }
      return {
        title: '食材配送单（大数据量）',
        documentNo: 'PS202608210001',
        deliverDate: '2026-08-21 07:30:00 ~ 09:30:00',
        customName: 'XX市集中采购食堂',
        contacts: '赵老师',
        phone: '13600136000',
        items,
        totalAmount: 0,
        remarks: '大数据量分组测试：8 组 × 80 行，验证跨页 keepTogether 与性能'
      };
    })()
  }
];
