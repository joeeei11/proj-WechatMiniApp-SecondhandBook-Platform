// 云函数：getUserPublicInfo
// 获取用户公开信息（不含手机号等隐私字段）
// 云函数以管理员权限运行，可读取任意用户数据
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
    const { userId } = event
    if (!userId) return null

    try {
        const res = await db.collection('users').doc(userId).get()
        const u = res.data
        // 只返回公开字段，不暴露手机号
        return {
            _id: u._id,
            nickName: u.nickName || '',
            avatarUrl: u.avatarUrl || '',
            college: u.college || '',
            grade: u.grade || '',
            creditScore: u.creditScore || 100,
            isAdmin: u.isAdmin || false
        }
    } catch (err) {
        console.error('getUserPublicInfo error:', err)
        return null
    }
}
