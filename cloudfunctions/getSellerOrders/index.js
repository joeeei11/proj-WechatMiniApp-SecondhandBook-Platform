// 云函数：getSellerOrders
// 获取当前用户作为卖家的所有订单
// 订单文档由买家创建（_openid=buyerId），卖家无法直接读取，需云函数处理
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
    const { OPENID } = cloud.getWXContext()

    try {
        const res = await db.collection('orders')
            .where({ sellerId: OPENID })
            .orderBy('createTime', 'desc')
            .get()
        return res.data
    } catch (err) {
        console.error('getSellerOrders error:', err)
        return []
    }
}
