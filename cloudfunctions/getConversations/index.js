// 云函数：getConversations - 获取用户会话列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()

    // 获取该用户相关的所有消息
    const res = await db.collection('messages')
        .where(_.or([
            { senderId: OPENID },
            { receiverId: OPENID }
        ]))
        .orderBy('createTime', 'desc')
        .limit(200)
        .get()

    const messages = res.data

    // 按对方用户ID分组，取每组最新一条
    const convMap = {}
    messages.forEach(msg => {
        const otherUserId = msg.senderId === OPENID ? msg.receiverId : msg.senderId
        if (!convMap[otherUserId]) {
            convMap[otherUserId] = {
                userId: otherUserId,
                lastMsg: msg,
                unread: 0
            }
        }
        if (msg.receiverId === OPENID && !msg.isRead) {
            convMap[otherUserId].unread++
        }
    })

    // 获取对方用户信息
    const conversations = Object.values(convMap)
    for (let conv of conversations) {
        try {
            const userRes = await db.collection('users').doc(conv.userId).get()
            conv.nickName = userRes.data.nickName || '用户'
            conv.avatarUrl = userRes.data.avatarUrl || ''
        } catch (e) {
            conv.nickName = '用户'
            conv.avatarUrl = ''
        }
    }

    // 按最新消息时间排序
    conversations.sort((a, b) => {
        const timeA = a.lastMsg.createTime ? new Date(a.lastMsg.createTime) : 0
        const timeB = b.lastMsg.createTime ? new Date(b.lastMsg.createTime) : 0
        return timeB - timeA
    })

    return conversations
}
