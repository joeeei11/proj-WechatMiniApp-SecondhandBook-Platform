// 云函数：updateCreditScore
// 更新用户信用分（评价提交后调用）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    const { revieweeId, score } = event
    // score: 1-5星，转换为信用分变化：5星+2，4星+1，3星不变，2星-1，1星-3
    const scoreMap = { 5: 2, 4: 1, 3: 0, 2: -1, 1: -3 }
    const delta = scoreMap[score] || 0

    try {
        if (delta !== 0) {
            await db.collection('users').doc(revieweeId).update({
                data: {
                    creditScore: _.increment(delta),
                    updateTime: db.serverDate()
                }
            })
        }
        // 读取最新信用分
        const user = await db.collection('users').doc(revieweeId).get()
        return { success: true, creditScore: user.data.creditScore }
    } catch (err) {
        return { success: false, error: err.message }
    }
}
