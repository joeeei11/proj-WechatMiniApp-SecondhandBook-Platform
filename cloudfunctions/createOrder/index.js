// 云函数：createOrder
// 创建交易订单
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const buyerId = wxContext.OPENID
    const { bookId, sellerId, price } = event

    if (!bookId || !sellerId || !price) {
        return { success: false, error: '参数缺失' }
    }

    if (buyerId === sellerId) {
        return { success: false, error: '不能购买自己发布的书籍' }
    }

    try {
        // 检查书籍是否仍在售
        const bookRes = await db.collection('books').doc(bookId).get()
        if (!bookRes.data || bookRes.data.status !== 'on_sale') {
            return { success: false, error: '该书籍已下架或已售出' }
        }

        // 创建订单
        const orderData = {
            bookId,
            buyerId,
            sellerId,
            price,
            status: 'pending', // pending / confirmed / completed / cancelled
            createTime: db.serverDate(),
            updateTime: db.serverDate()
        }
        const result = await db.collection('orders').add({ data: orderData })

        // 将书籍状态更新为"交易中"（可选：防止重复下单）
        await db.collection('books').doc(bookId).update({
            data: { status: 'trading', updateTime: db.serverDate() }
        })

        return { success: true, orderId: result._id }
    } catch (err) {
        console.error('createOrder error:', err)
        return { success: false, error: err.message }
    }
}
