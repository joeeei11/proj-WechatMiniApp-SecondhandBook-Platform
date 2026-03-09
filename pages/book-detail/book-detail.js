// pages/book-detail/book-detail.js
const { bookAPI, userAPI, orderAPI } = require('../../utils/api')
const { formatTime, formatStars, CONDITION_MAP } = require('../../utils/format')

Page({
    data: {
        bookId: '',
        book: {},
        seller: null,
        isMine: false,
        publishTime: '',
        creditStars: '',
        conditionMap: CONDITION_MAP
    },

    async onLoad(options) {
        const { id } = options
        if (!id) { wx.navigateBack(); return }
        this.setData({ bookId: id })
        wx.showLoading({ title: '加载中...' })
        try {
            await this.loadBook(id)
        } catch (err) {
            console.error('加载书籍详情失败:', err)
            wx.showToast({ title: '加载失败，请检查网络或云函数是否部署', icon: 'none', duration: 3000 })
        } finally {
            wx.hideLoading()
        }
    },

    async loadBook(id) {
        const book = await bookAPI.getBookDetail(id)
        if (!book) { wx.showToast({ title: '书籍不存在或已下架', icon: 'error' }); return }

        // 增加浏览量（异步，不影响主流程）
        bookAPI.incrementView(id).catch(() => { })

        const app = getApp()
        const isMine = book.sellerId === app.globalData.openid
        const publishTime = formatTime(book.createTime)

        this.setData({ book, isMine, publishTime })

        // 加载卖家信息
        if (!isMine && book.sellerId) {
            try {
                const seller = await userAPI.getUserInfo(book.sellerId)
                if (seller) {
                    const creditStars = formatStars(Math.min(5, Math.max(1, Math.round(((seller.creditScore || 100) - 80) / 10))))
                    this.setData({ seller, creditStars })
                }
            } catch (e) {
                console.warn('加载卖家信息失败:', e)
            }
        }
    },

    // 预览图片
    previewImage(e) {
        const index = e.currentTarget.dataset.index
        wx.previewImage({
            current: this.data.book.images[index],
            urls: this.data.book.images
        })
    },

    // 联系卖家
    contactSeller() {
        const app = getApp()
        if (!app.globalData.openid) {
            wx.showToast({ title: '请先登录', icon: 'none' })
            wx.navigateTo({ url: '/pages/login/login' })
            return
        }
        const { book } = this.data
        if (!book.sellerId) {
            wx.showToast({ title: '卖家信息异常', icon: 'none' })
            return
        }
        const sellerName = this.data.seller ? (this.data.seller.nickName || '') : ''
        wx.navigateTo({
            url: `/pages/chat/chat?userId=${book.sellerId}&bookId=${this.data.bookId}&bookTitle=${book.title || ''}&nickName=${sellerName}`
        })
    },

    // 创建订单
    async createOrder() {
        const { book, bookId } = this.data
        const app = getApp()

        if (!app.globalData.openid) {
            wx.showToast({ title: '请先登录', icon: 'none' })
            wx.navigateTo({ url: '/pages/login/login' })
            return
        }

        if (!bookId || !book.sellerId) {
            wx.showToast({ title: '书籍信息异常', icon: 'error' })
            return
        }

        const result = await wx.showModal({
            title: '确认购买',
            content: `《${book.title}》\n定价：¥${book.price}\n\n确认后进入支付页面`,
            confirmText: '去支付'
        })
        if (!result.confirm) return

        wx.showLoading({ title: '下单中...' })
        let orderId = null
        try {
            const res = await orderAPI.createOrder({
                bookId: bookId,
                sellerId: book.sellerId,
                price: Number(book.price)
            })
            wx.hideLoading()
            if (!res.success) {
                wx.showToast({ title: res.error || '下单失败', icon: 'error' })
                return
            }
            orderId = res.orderId
        } catch (e) {
            wx.hideLoading()
            wx.showToast({ title: '下单失败', icon: 'error' })
            return
        }

        // 拉起模拟支付
        await this.mockPay(orderId, book)
    },

    // 模拟微信支付流程
    async mockPay(orderId, book) {
        const payRes = await wx.showModal({
            title: '微信支付',
            content: `支付金额  ¥${Number(book.price).toFixed(2)}\n\n收款方：湘潭大学校园二手书平台`,
            confirmText: '确认支付',
            cancelText: '暂不支付'
        })

        if (!payRes.confirm) {
            wx.showToast({ title: '可在"我的订单"中继续支付', icon: 'none', duration: 2500 })
            setTimeout(() => wx.switchTab({ url: '/pages/order/order' }), 1500)
            return
        }

        wx.showLoading({ title: '支付中...' })
        setTimeout(async () => {
            try {
                await orderAPI.payOrder(orderId)
                wx.hideLoading()
                wx.showToast({ title: '支付成功！', icon: 'success' })
                setTimeout(() => wx.switchTab({ url: '/pages/order/order' }), 1500)
            } catch (e) {
                wx.hideLoading()
                wx.showToast({ title: '支付失败，请稍后重试', icon: 'error' })
            }
        }, 1500)
    },

    // 查看卖家主页
    goSellerProfile() {
        wx.navigateTo({ url: `/pages/profile/profile?userId=${this.data.book.sellerId}` })
    },

    // 编辑书籍
    editBook() {
        wx.navigateTo({ url: `/pages/edit-book/edit-book?id=${this.data.bookId}` })
    },

    // 下架书籍
    async withdrawBook() {
        const result = await wx.showModal({
            title: '确认下架',
            content: '下架后此书不再对外展示，确认下架吗？',
            confirmColor: '#F56C6C'
        })
        if (!result.confirm) return

        wx.showLoading({ title: '处理中...' })
        try {
            await bookAPI.withdrawBook(this.data.bookId)
            wx.showToast({ title: '已下架' })
            setTimeout(() => wx.navigateBack(), 1500)
        } finally {
            wx.hideLoading()
        }
    }
})
