// 云函数：getChatHistory
// 获取当前用户与另一用户之间的双向聊天记录
// 云函数管理员权限可读取所有消息，不受"仅创建者可读"限制
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
    const { OPENID } = cloud.getWXContext()
    const { otherUserId } = event

    if (!otherUserId) return []

    try {
        const res = await db.collection('messages')
            .where(_.or([
                { senderId: OPENID, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: OPENID }
            ]))
            .orderBy('createTime', 'asc')
            .limit(100)
            .get()

        return res.data
    } catch (err) {
        console.error('getChatHistory error:', err)
        return []
    }
}
