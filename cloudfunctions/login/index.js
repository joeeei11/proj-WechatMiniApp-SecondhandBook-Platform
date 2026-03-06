// 云函数：login
// 获取用户openid，若为新用户则创建用户记录
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    try {
        // 查询用户是否已存在
        const userResult = await db.collection('users').doc(openid).get().catch(() => null)

        if (userResult && userResult.data) {
            // 老用户：直接返回
            return {
                openid,
                userInfo: userResult.data,
                isNewUser: false
            }
        } else {
            // 新用户：创建基础记录
            const newUser = {
                _id: openid,
                nickName: '',
                avatarUrl: '',
                college: '',
                grade: '',
                phone: '',
                creditScore: 100,
                isAdmin: false,
                createTime: db.serverDate(),
                updateTime: db.serverDate()
            }
            await db.collection('users').add({ data: newUser })
            return {
                openid,
                userInfo: newUser,
                isNewUser: true
            }
        }
    } catch (err) {
        console.error('login cloud function error:', err)
        return { error: err.message }
    }
}
