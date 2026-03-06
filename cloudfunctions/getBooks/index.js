// 云函数：getBooks - 书籍查询（以管理员权限运行，绕过数据库权限限制）
// 支持：按ID查单本、按sellerId查卖家书籍、关键词搜索、多条件筛选
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
    const {
        bookId,
        sellerId,
        keyword = '',
        college = '',
        condition = '',
        priceRange = '',
        page = 1,
        pageSize = 20
    } = event

    // 查询单本书籍详情
    if (bookId) {
        try {
            const res = await db.collection('books').doc(bookId).get()
            // 增加浏览量（异步，不等待）
            db.collection('books').doc(bookId).update({
                data: { viewCount: _.inc(1) }
            }).catch(() => {})
            return res.data
        } catch (err) {
            return null
        }
    }

    // 查询指定卖家的在售书籍
    if (sellerId) {
        const res = await db.collection('books')
            .where({ sellerId, status: 'on_sale' })
            .orderBy('createTime', 'desc')
            .limit(20)
            .get()
        return res.data
    }

    // 列表/搜索查询
    let whereCondition = { status: 'on_sale' }
    if (college) whereCondition.college = college
    if (condition) whereCondition.condition = condition
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number)
        whereCondition.price = _.gte(min).and(_.lte(max))
    }

    let query = db.collection('books').where(whereCondition)

    // 有关键词：全量拉取后本地过滤（云数据库不支持原生模糊搜索）
    if (keyword) {
        const allRes = await query.orderBy('createTime', 'desc').limit(100).get()
        const kw = keyword.toLowerCase()
        const filtered = allRes.data.filter(book =>
            (book.title && book.title.toLowerCase().includes(kw)) ||
            (book.author && book.author.toLowerCase().includes(kw)) ||
            (book.isbn && book.isbn.includes(kw)) ||
            (book.description && book.description.toLowerCase().includes(kw))
        )
        const start = (page - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }

    const res = await query
        .orderBy('createTime', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()

    return res.data
}
