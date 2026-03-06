// 云函数：markMessagesRead
// 将来自指定用户的消息标记为已读
// 因为消息文档由发送者创建，接收者无权限直接修改，需云函数处理
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
    const { OPENID } = cloud.getWXContext()
    const { senderId } = event

    if (!senderId) return { success: false }

    try {
        await db.collection('messages')
            .where({
                senderId,
                receiverId: OPENID,
                isRead: false
            })
            .update({ data: { isRead: true } })
        return { success: true }
    } catch (err) {
        console.error('markMessagesRead error:', err)
        return { success: false }
    }
}
