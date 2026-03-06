// 云函数：completeOrder
// 确认交易完成：订单状态→completed，书籍状态→sold
// 需云函数处理：订单由买家创建，卖家无权更新；书籍虽由卖家创建但需同步完成
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
    const { OPENID } = cloud.getWXContext()
    const { orderId, bookId } = event

    if (!orderId || !bookId) {
        return { success: false, error: '参数缺失' }
    }

    try {
        // 验证调用者是卖家
        const orderRes = await db.collection('orders').doc(orderId).get()
        const order = orderRes.data
        if (order.sellerId !== OPENID) {
            return { success: false, error: '只有卖家才能确认完成' }
        }
        if (order.status !== 'trading') {
            return { success: false, error: '订单状态不正确' }
        }

        const now = db.serverDate()
        await db.collection('orders').doc(orderId).update({
            data: { status: 'completed', updateTime: now }
        })
        await db.collection('books').doc(bookId).update({
            data: { status: 'sold', updateTime: now }
        })

        return { success: true }
    } catch (err) {
        console.error('completeOrder error:', err)
        return { success: false, error: err.message }
    }
}
