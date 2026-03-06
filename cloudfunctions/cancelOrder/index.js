// 云函数：cancelOrder
// 取消订单，同时将书籍状态恢复为在售
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { orderId } = event

    if (!orderId) {
        return { success: false, error: '参数缺失' }
    }

    try {
        // 读取订单信息
        const orderRes = await db.collection('orders').doc(orderId).get()
        if (!orderRes.data) {
            return { success: false, error: '订单不存在' }
        }

        const order = orderRes.data
        // 只有买家可以取消订单
        if (order.buyerId !== openid) {
            return { success: false, error: '无权操作此订单' }
        }

        if (order.status !== 'pending') {
            return { success: false, error: '当前订单状态不可取消' }
        }

        // 更新订单状态为已取消
        await db.collection('orders').doc(orderId).update({
            data: { status: 'cancelled', updateTime: db.serverDate() }
        })

        // 将书籍状态恢复为在售
        await db.collection('books').doc(order.bookId).update({
            data: { status: 'on_sale', updateTime: db.serverDate() }
        })

        return { success: true }
    } catch (err) {
        console.error('cancelOrder error:', err)
        return { success: false, error: err.message }
    }
}
